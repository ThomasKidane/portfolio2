#!/usr/bin/env python3
"""
Clean batch JSON files by replacing corrupted doubled math expressions
with proper LaTeX formatting.

Usage: python clean-batch.py <batch_number>
"""

import json
import sys
import re
from pathlib import Path


PLACEHOLDER_START = '\x00LATEX_START\x00'
PLACEHOLDER_END = '\x00LATEX_END\x00'


def is_math_unicode(ch):
    cp = ord(ch)
    if 0x1D400 <= cp <= 0x1D7FF:
        return True
    if cp == 0x210E:
        return True
    if cp in (0x2102, 0x210D, 0x2115, 0x2119, 0x211A, 0x211D, 0x2124):
        return True
    # Math italic Greek (some may fall outside the main range)
    if 0x1D6A8 <= cp <= 0x1D7C9:
        return True
    return False


SYMBOL_MAP = {
    'cdot': '\u22c5', 'sim': '\u223c', 'leq': '\u2264', 'geq': '\u2265',
    'neq': '\u2260', 'ne': '\u2260', 'times': '\u00d7', 'div': '\u00f7',
    'infty': '\u221e', 'cap': '\u2229', 'cup': '\u222a', 'in': '\u2208',
    'notin': '\u2209',
    'subset': '\u2282', 'supset': '\u2283', 'subseteq': '\u2286', 'supseteq': '\u2287',
    'sqrt': '\u221a', 'sum': '\u2211', 'prod': '\u220f', 'int': '\u222b',
    'emptyset': '\u2205', 'equiv': '\u2261', 'approx': '\u2248',
    'perp': '\u22a5', 'wedge': '\u2227', 'vee': '\u2228',
    'neg': '\u00ac', 'lnot': '\u00ac', 'exists': '\u2203', 'forall': '\u2200',
    'to': '\u2192', 'rightarrow': '\u2192', 'leftarrow': '\u2190',
    'Rightarrow': '\u21d2', 'Leftarrow': '\u21d0',
    'iff': '\u21d4', 'leftrightarrow': '\u2194',
    'pm': '\u00b1', 'mp': '\u2213',
    'partial': '\u2202', 'nabla': '\u2207',
    'ldots': '\u2026', 'cdots': '\u22ef', 'dots': '\u2026',
    'mid': '\u2223', 'parallel': '\u2016', 'nmid': '\u2224',
}

# Greek letters need separate handling: spaced uses math-italic, compact uses regular
GREEK_SPACED_COMPACT = {
    'alpha': ('\U0001D6FC', '\u03b1'), 'beta': ('\U0001D6FD', '\u03b2'),
    'gamma': ('\U0001D6FE', '\u03b3'), 'delta': ('\U0001D6FF', '\u03b4'),
    'epsilon': ('\U0001D700', '\u03b5'), 'varepsilon': ('\U0001D700', '\u03b5'),
    'zeta': ('\U0001D701', '\u03b6'), 'eta': ('\U0001D702', '\u03b7'),
    'theta': ('\U0001D703', '\u03b8'), 'vartheta': ('\U0001D717', '\u03d1'),
    'iota': ('\U0001D704', '\u03b9'), 'kappa': ('\U0001D705', '\u03ba'),
    'lambda': ('\U0001D706', '\u03bb'), 'mu': ('\U0001D707', '\u03bc'),
    'nu': ('\U0001D708', '\u03bd'), 'xi': ('\U0001D709', '\u03be'),
    'pi': ('\U0001D70B', '\u03c0'), 'rho': ('\U0001D70C', '\u03c1'),
    'sigma': ('\U0001D70E', '\u03c3'), 'tau': ('\U0001D70F', '\u03c4'),
    'upsilon': ('\U0001D710', '\u03c5'), 'phi': ('\U0001D711', '\u03c6'),
    'varphi': ('\U0001D719', '\u03d5'), 'chi': ('\U0001D712', '\u03c7'),
    'psi': ('\U0001D713', '\u03c8'), 'omega': ('\U0001D714', '\u03c9'),
    'Gamma': ('\U0001D6E4', '\u0393'), 'Delta': ('\U0001D6E5', '\u0394'),
    'Theta': ('\U0001D6E9', '\u0398'), 'Lambda': ('\U0001D6EC', '\u039b'),
    'Xi': ('\U0001D6EF', '\u039e'), 'Pi': ('\U0001D6F1', '\u03a0'),
    'Sigma': ('\U0001D6F4', '\u03a3'), 'Phi': ('\U0001D6F7', '\u03a6'),
    'Psi': ('\U0001D6F9', '\u03a8'), 'Omega': ('\U0001D6FA', '\u03a9'),
}

FUNC_MAP = {
    'prob': 'P', 'Pr': 'Pr', 'E': 'E', 'Var': 'Var', 'Cov': 'Cov',
    'log': 'log', 'ln': 'ln', 'exp': 'exp',
    'sin': 'sin', 'cos': 'cos', 'tan': 'tan',
    'max': 'max', 'min': 'min', 'sup': 'sup', 'inf': 'inf',
    'lim': 'lim', 'det': 'det', 'gcd': 'gcd', 'lcm': 'lcm',
}

SKIP_COMMANDS = {
    'left', 'right', 'big', 'Big', 'bigg', 'Bigg',
    'text', 'mathrm', 'mathbf', 'mathbb', 'mathcal', 'mathfrak', 'mathsf',
    'operatorname', 'boldsymbol', 'overline', 'underline', 'hat',
    'bar', 'vec', 'dot', 'ddot', 'tilde', 'widehat', 'widetilde',
    'displaystyle', 'textstyle', 'scriptstyle', 'quad', 'qquad',
    'hspace', 'vspace', 'phantom', 'hfill',
}

ASCII_TO_MATH_ITALIC = {}
for i, c in enumerate('ABCDEFGHIJKLMNOPQRSTUVWXYZ'):
    ASCII_TO_MATH_ITALIC[c] = chr(0x1D434 + i)
for i, c in enumerate('abcdefghijklmnopqrstuvwxyz'):
    if c == 'h':
        ASCII_TO_MATH_ITALIC[c] = chr(0x210E)
    else:
        ASCII_TO_MATH_ITALIC[c] = chr(0x1D44E + i)


def parse_group_str(expr, start):
    """Parse a {}-delimited group, return (content_string, position_after_close_brace)."""
    pos = start
    if pos < len(expr) and expr[pos] == '{':
        pos += 1
        depth = 1
        content = []
        while pos < len(expr) and depth > 0:
            if expr[pos] == '{':
                depth += 1
            elif expr[pos] == '}':
                depth -= 1
                if depth == 0:
                    pos += 1
                    break
            content.append(expr[pos])
            pos += 1
        return ''.join(content), pos
    return '', pos


def tokenize_latex(latex_expr):
    """
    Parse LaTeX into a list of (spaced_token, compact_token) pairs.
    
    For the spaced form: letters become math-italic, digits grouped, operators as unicode.
    For the compact form: letters stay ASCII, digits grouped, operators as unicode,
                          superscripts/subscripts get a preceding space.
    
    Special: FRAC and BINOM are handled by producing spaced tokens in normal order
    and compact tokens in reversed order.
    """
    spaced_tokens = []
    compact_tokens = []
    i = 0

    while i < len(latex_expr):
        ch = latex_expr[i]

        if ch == '\\':
            j = i + 1
            while j < len(latex_expr) and latex_expr[j].isalpha():
                j += 1
            cmd = latex_expr[i+1:j]

            if not cmd and j < len(latex_expr):
                spaced_tokens.append(latex_expr[j])
                compact_tokens.append(latex_expr[j])
                i = j + 1
            elif cmd in ('dfrac', 'frac', 'tfrac'):
                num_content, after_num = parse_group_str(latex_expr, j)
                den_content, after_den = parse_group_str(latex_expr, after_num)
                num_s, num_c = tokenize_latex(num_content)
                den_s, den_c = tokenize_latex(den_content)
                # Spaced: num then den
                spaced_tokens.extend(num_s)
                spaced_tokens.extend(den_s)
                # Compact: den then num then ZWS
                compact_tokens.extend(den_c)
                compact_tokens.extend(num_c)
                compact_tokens.append('\u200b')
                i = after_den
            elif cmd in ('binom', 'tbinom', 'dbinom'):
                top_content, after_top = parse_group_str(latex_expr, j)
                bot_content, after_bot = parse_group_str(latex_expr, after_top)
                top_s, top_c = tokenize_latex(top_content)
                bot_s, bot_c = tokenize_latex(bot_content)
                spaced_tokens.append('(')
                spaced_tokens.extend(top_s)
                spaced_tokens.extend(bot_s)
                spaced_tokens.append(')')
                compact_tokens.append('(')
                compact_tokens.extend(bot_c)
                compact_tokens.extend(top_c)
                compact_tokens.append('\u200b')
                compact_tokens.append(')')
                i = after_bot
            elif cmd == 'prob':
                spaced_tokens.append(ASCII_TO_MATH_ITALIC['P'])
                spaced_tokens.append('[')
                compact_tokens.append('P')
                compact_tokens.append('[')
                content, after = parse_group_str(latex_expr, j)
                inner_s, inner_c = tokenize_latex(content)
                spaced_tokens.extend(inner_s)
                compact_tokens.extend(inner_c)
                spaced_tokens.append(']')
                compact_tokens.append(']')
                i = after
            elif cmd == 'norm':
                # \norm{a}{b} renders as N(a,b)
                spaced_tokens.append(ASCII_TO_MATH_ITALIC['N'])
                spaced_tokens.append('(')
                compact_tokens.append('N')
                compact_tokens.append('(')
                arg1, after1 = parse_group_str(latex_expr, j)
                inner1_s, inner1_c = tokenize_latex(arg1)
                spaced_tokens.extend(inner1_s)
                compact_tokens.extend(inner1_c)
                spaced_tokens.append(',')
                compact_tokens.append(',')
                arg2, after2 = parse_group_str(latex_expr, after1)
                inner2_s, inner2_c = tokenize_latex(arg2)
                spaced_tokens.extend(inner2_s)
                compact_tokens.extend(inner2_c)
                spaced_tokens.append(')')
                compact_tokens.append(')')
                i = after2
            elif cmd in GREEK_SPACED_COMPACT:
                spaced_ch, compact_ch = GREEK_SPACED_COMPACT[cmd]
                spaced_tokens.append(spaced_ch)
                compact_tokens.append(compact_ch)
                i = j
            elif cmd in SYMBOL_MAP:
                sym = SYMBOL_MAP[cmd]
                spaced_tokens.append(sym)
                compact_tokens.append(sym)
                i = j
            elif cmd in FUNC_MAP:
                name = FUNC_MAP[cmd]
                if name:
                    # Function names render as a single word (not spaced individual letters)
                    spaced_tokens.append(name)
                    compact_tokens.append(name)
                if j < len(latex_expr) and latex_expr[j] == '{':
                    content, after = parse_group_str(latex_expr, j)
                    inner_s, inner_c = tokenize_latex(content)
                    spaced_tokens.extend(inner_s)
                    compact_tokens.extend(inner_c)
                    i = after
                else:
                    i = j
            elif cmd in SKIP_COMMANDS:
                if j < len(latex_expr) and latex_expr[j] == '{':
                    content, after = parse_group_str(latex_expr, j)
                    inner_s, inner_c = tokenize_latex(content)
                    spaced_tokens.extend(inner_s)
                    compact_tokens.extend(inner_c)
                    i = after
                else:
                    i = j
            else:
                if j < len(latex_expr) and latex_expr[j] == '{':
                    content, after = parse_group_str(latex_expr, j)
                    inner_s, inner_c = tokenize_latex(content)
                    spaced_tokens.extend(inner_s)
                    compact_tokens.extend(inner_c)
                    i = after
                else:
                    i = j
            if i < len(latex_expr) and latex_expr[i] == ' ':
                i += 1
        elif ch == '{':
            content, after = parse_group_str(latex_expr, i)
            inner_s, inner_c = tokenize_latex(content)
            spaced_tokens.extend(inner_s)
            compact_tokens.extend(inner_c)
            i = after
        elif ch == '}':
            i += 1
        elif ch in '^_':
            i += 1
            if i < len(latex_expr):
                if latex_expr[i] == '{':
                    content, after = parse_group_str(latex_expr, i)
                    inner_s, inner_c = tokenize_latex(content)
                    spaced_tokens.extend(inner_s)
                    # In compact form, superscript/subscript content gets a space before
                    compact_tokens.append(' ')
                    compact_tokens.extend(inner_c)
                    i = after
                else:
                    sub_ch = latex_expr[i]
                    if sub_ch.isdigit():
                        j2 = i
                        while j2 < len(latex_expr) and latex_expr[j2].isdigit():
                            j2 += 1
                        num = latex_expr[i:j2]
                        spaced_tokens.append(num)
                        compact_tokens.append(' ')
                        compact_tokens.append(num)
                        i = j2
                    elif sub_ch.isalpha():
                        spaced_tokens.append(ASCII_TO_MATH_ITALIC.get(sub_ch, sub_ch))
                        compact_tokens.append(' ')
                        compact_tokens.append(sub_ch)
                        i += 1
                    elif sub_ch == '\\':
                        # Handle \command in superscript
                        j2 = i + 1
                        while j2 < len(latex_expr) and latex_expr[j2].isalpha():
                            j2 += 1
                        cmd2 = latex_expr[i+1:j2]
                        if cmd2 in SYMBOL_MAP:
                            spaced_tokens.append(SYMBOL_MAP[cmd2])
                            compact_tokens.append(' ')
                            compact_tokens.append(SYMBOL_MAP[cmd2])
                        i = j2
                    else:
                        spaced_tokens.append(sub_ch)
                        compact_tokens.append(' ')
                        compact_tokens.append(sub_ch)
                        i += 1
        elif ch in ' ~&':
            i += 1
        elif ch.isdigit():
            j2 = i
            while j2 < len(latex_expr) and (latex_expr[j2].isdigit() or latex_expr[j2] == '.'):
                j2 += 1
            num = latex_expr[i:j2]
            spaced_tokens.append(num)
            compact_tokens.append(num)
            i = j2
        elif ch.isalpha():
            spaced_tokens.append(ASCII_TO_MATH_ITALIC.get(ch, ch))
            compact_tokens.append(ch)
            i += 1
        elif ch == '-':
            spaced_tokens.append('\u2212')
            compact_tokens.append('\u2212')
            i += 1
        else:
            # Map | to U+2223 (mathematical vertical bar)
            if ch == '|':
                spaced_tokens.append('\u2223')
                compact_tokens.append('\u2223')
            else:
                spaced_tokens.append(ch)
                compact_tokens.append(ch)
            i += 1

    return spaced_tokens, compact_tokens


def build_doubled_regex(spaced_tokens, compact_tokens):
    """
    Build regex for the full doubled pattern.
    Spaced tokens separated by whitespace, then gap, then compact tokens
    (with optional whitespace/ZWS between them).
    """
    if not spaced_tokens:
        return None

    spaced_regex = r'[\s\u200b\u2061]+'.join(re.escape(t) for t in spaced_tokens)
    
    # Compact: tokens may have spaces and ZWS between them
    real_compact_tokens = [t for t in compact_tokens if t != ' ' and t != '\u200b']
    if not real_compact_tokens:
        return None
    compact_regex = r'[\s\u200b\u2061]*'.join(re.escape(t) for t in real_compact_tokens)

    full_regex = spaced_regex + r'[\s\u200b\u2061]+' + compact_regex
    return full_regex


def build_spaced_only_regex(spaced_tokens):
    """Build regex for just the spaced form."""
    if not spaced_tokens:
        return None
    return r'[\s\u200b\u2061]+'.join(re.escape(t) for t in spaced_tokens)


def is_inside_placeholder(text, pos):
    last_start = text.rfind(PLACEHOLDER_START, 0, pos)
    if last_start == -1:
        return False
    next_end = text.find(PLACEHOLDER_END, last_start)
    if next_end == -1:
        return False
    return pos < next_end + len(PLACEHOLDER_END)


def consume_compact_after_spaced(text, spaced_end):
    """
    After matching the spaced form, try to consume the compact form that follows.
    The compact form is a contiguous block of non-English characters (letters, digits,
    operators, brackets) that doesn't contain 3+ consecutive lowercase ASCII letters
    that would indicate an English word.
    """
    i = spaced_end
    # Skip whitespace between spaced and compact
    while i < len(text) and text[i] in ' \u200b':
        i += 1
    
    compact_start = i
    
    # Consume compact form characters
    # Stop conditions: 
    # - hit a placeholder marker
    # - hit a space followed by 3+ lowercase letters (English word)
    # - hit sentence-ending punctuation followed by space + uppercase or end
    while i < len(text):
        ch = text[i]
        if ch == '\x00':
            break
        if ch == ' ':
            # Check what follows - if it's an English word, stop
            rest = text[i+1:i+5]
            if re.match(r'[a-z]{3}', rest):
                break
            # Also stop if followed by capital letter starting a sentence
            if rest and rest[0].isupper() and i > 0 and text[i-1] in '.!?':
                break
            i += 1
        elif ch == '\u200b':
            i += 1
        elif ch.isalpha() or ch.isdigit():
            i += 1
        elif ord(ch) > 127:
            i += 1
        elif ch in '()[]{},.=+/<>!:|;^_\'-*%$\\':
            i += 1
        else:
            break
    
    # Trim trailing whitespace/ZWS
    while i > compact_start and text[i-1] in ' \u200b':
        i -= 1
    
    if i > compact_start:
        return i
    return spaced_end


def clean_text_with_latex(raw_text, latex_array, strip_prefix_func):
    """Main cleaning function."""
    text = strip_prefix_func(raw_text)

    if not latex_array:
        return finalize(text)

    for latex_expr in latex_array:
        spaced_tokens, compact_tokens = tokenize_latex(latex_expr)

        if not spaced_tokens:
            continue

        replacement = PLACEHOLDER_START + latex_expr + PLACEHOLDER_END

        # Strategy 1: Full doubled regex (spaced + compact)
        full_regex = build_doubled_regex(spaced_tokens, compact_tokens)
        matched = False
        if full_regex:
            try:
                match = re.search(full_regex, text)
                if match and not is_inside_placeholder(text, match.start()):
                    text = text[:match.start()] + replacement + text[match.end():]
                    matched = True
            except re.error:
                pass

        if matched:
            continue

        # Strategy 2: Match spaced form, then consume compact greedily
        spaced_regex = build_spaced_only_regex(spaced_tokens)
        if spaced_regex:
            try:
                match = re.search(spaced_regex, text)
                if match and not is_inside_placeholder(text, match.start()):
                    compact_end = consume_compact_after_spaced(text, match.end())
                    text = text[:match.start()] + replacement + text[compact_end:]
                    matched = True
            except re.error:
                pass

        # No fallback for unmatched - skip gracefully

    return finalize(text)


def finalize(text):
    """Convert placeholders to $...$ and clean remaining unicode."""
    text = clean_remaining_unicode(text)
    text = text.replace(PLACEHOLDER_START, '$').replace(PLACEHOLDER_END, '$')
    text = re.sub(r'  +', ' ', text)
    text = text.strip()
    return text


def clean_remaining_unicode(text):
    """Remove leftover unicode math italic characters and zero-width spaces."""
    result = []
    for ch in text:
        if is_math_unicode(ch):
            continue
        elif ch == '\u200b':
            continue
        elif ch == '\u2061':
            continue
        else:
            result.append(ch)
    cleaned = ''.join(result)
    cleaned = re.sub(r'  +', ' ', cleaned)
    return cleaned


def strip_problem_prefix(text):
    for prefix in ['Extreme ', 'Medium ', 'Hard ', 'Easy ']:
        if text.startswith(prefix):
            return text[len(prefix):]
    return text


def make_solution_stripper(title, difficulty):
    def stripper(text):
        diff_cap = difficulty.capitalize()
        prefix = f"{title} {diff_cap} "
        if text.startswith(prefix):
            return text[len(prefix):]
        prefix2 = f"{diff_cap} "
        if text.startswith(prefix2):
            return text[len(prefix2):]
        return text
    return stripper


def process_batch(batch_num):
    base_dir = Path(__file__).parent.parent / "tmp-batches"
    input_file = base_dir / f"batch-{batch_num}.json"
    output_file = base_dir / f"batch-{batch_num}-clean.json"

    with open(input_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    results = []
    for q in questions:
        problem = clean_text_with_latex(
            q['problem_raw'],
            q.get('problemLatex', []),
            strip_problem_prefix
        )
        solution_stripper = make_solution_stripper(
            q.get('title', ''),
            q.get('difficulty', '')
        )
        solution = clean_text_with_latex(
            q['solution_raw'],
            q.get('solutionLatex', []),
            solution_stripper
        )
        results.append({
            'id': q['id'],
            'title': q['title'],
            'difficulty': q['difficulty'],
            'url': q['url'],
            'problem': problem,
            'solution': solution,
            'characteristics': q.get('characteristics', ''),
            'hasHint': q.get('hasHint', False),
            'hint': q.get('hint', ''),
        })

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"Processed {len(results)} questions from batch-{batch_num}.json")
    print(f"Output written to {output_file}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python clean-batch.py <batch_number>")
        sys.exit(1)
    batch_num = sys.argv[1]
    process_batch(batch_num)
