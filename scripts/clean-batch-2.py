#!/usr/bin/env python3
"""
Clean batch-2.json: replace doubled unicode+ASCII math with proper $latex$ notation.

The raw text has pattern [unicode_spaced_rendered] [compact_ascii_source]
for each LaTeX expression. The problemLatex/solutionLatex arrays give us the
exact LaTeX in order.

Complex expressions (frac, binom, subscripts) have a \u200b (zero-width space)
marking the end of their compact source. Simple expressions don't.
"""
import json
import re
import os

INPUT_PATH = '/Users/thomaskidane/Documents/Projects/portfolio2/tmp-batches/batch-2.json'
OUTPUT_PATH = '/Users/thomaskidane/Documents/Projects/portfolio2/tmp-batches/batch-2-clean.json'

UNICODE_MINUS = '\u2212'
ZWSP = '\u200b'


def is_math_unicode(ch):
    code = ord(ch)
    return 0x1D400 <= code <= 0x1D7FF


def is_math_symbol(ch):
    return ch in '≤≥≠∼≈±∞…⋯×⋅∩∪∈∉⊂⊆∀∃→←⇒⇐∣∑∏∫∂∇√παβγδεελμσθφωρτχψηζνξκΓΔΣΩΦΘΛΠ\u2212\ue020<>∘'


def strip_difficulty(text):
    return re.sub(r'^(Easy|Medium|Hard|Extreme)\s+', '', text)


def is_complex_latex(latex):
    """Check if LaTeX has structures that cause reordering/spacing in compact source."""
    if '_' in latex or '^' in latex:
        return True
    if re.search(r'\\(d?frac|binom|dbinom)\{', latex):
        return True
    return False


def apply_common_replacements(s):
    """Apply symbol/operator replacements common to both compact functions."""
    s = s.replace('\\$', '$')
    s = s.replace('\\{', '\x00LBRACE\x00').replace('\\}', '\x00RBRACE\x00')
    s = s.replace('\\leq', '≤').replace('\\geq', '≥').replace('\\neq', '≠')
    s = s.replace('\\le', '≤').replace('\\ge', '≥').replace('\\ne', '≠')
    s = s.replace('\\sim', '∼').replace('\\approx', '≈').replace('\\pm', '±')
    s = s.replace('\\infty', '∞').replace('\\ldots', '…').replace('\\cdots', '⋯')
    s = s.replace('\\times', '×').replace('\\cdot', '⋅').replace('\\circ', '∘')
    s = s.replace('\\cap', '∩').replace('\\cup', '∪')
    s = s.replace('\\in', '∈').replace('\\notin', '∉')
    s = s.replace('\\subset', '⊂').replace('\\subseteq', '⊆')
    s = s.replace('\\forall', '∀').replace('\\exists', '∃')
    s = s.replace('\\rightarrow', '→').replace('\\leftarrow', '←')
    s = s.replace('\\Rightarrow', '⇒').replace('\\Leftarrow', '⇐')
    s = s.replace('\\mid', '∣').replace('\\vert', '∣')
    s = s.replace('\\sum', '∑').replace('\\prod', '∏').replace('\\int', '∫')
    s = s.replace('\\partial', '∂').replace('\\nabla', '∇').replace('\\sqrt', '√')
    s = s.replace('\\pi', 'π').replace('\\alpha', 'α').replace('\\beta', 'β')
    s = s.replace('\\gamma', 'γ').replace('\\delta', 'δ').replace('\\epsilon', 'ε')
    s = s.replace('\\varepsilon', 'ε').replace('\\lambda', 'λ').replace('\\mu', 'μ')
    s = s.replace('\\sigma', 'σ').replace('\\theta', 'θ').replace('\\phi', 'φ')
    s = s.replace('\\varphi', 'φ').replace('\\omega', 'ω').replace('\\rho', 'ρ')
    s = s.replace('\\tau', 'τ').replace('\\chi', 'χ').replace('\\psi', 'ψ')
    s = s.replace('\\eta', 'η').replace('\\zeta', 'ζ').replace('\\nu', 'ν')
    s = s.replace('\\xi', 'ξ').replace('\\kappa', 'κ')
    s = s.replace('\\Gamma', 'Γ').replace('\\Delta', 'Δ').replace('\\Sigma', 'Σ')
    s = s.replace('\\Omega', 'Ω').replace('\\Phi', 'Φ').replace('\\Theta', 'Θ')
    s = s.replace('\\Lambda', 'Λ').replace('\\Pi', 'Π')
    s = s.replace('\\dots', '…')
    s = s.replace('\\iff', '⟺').replace('\\implies', '⟹')
    # Custom distribution/probability commands
    s = re.sub(r'\\prob\{([^}]*)\}', r'P[\1]', s)
    s = re.sub(r'\\ev\{([^}]*)\}', r'E[\1]', s)
    s = re.sub(r'\\var\{([^}]*)\}', r'Var(\1)', s)
    s = re.sub(r'\\cov\{([^}]*)\}\{([^}]*)\}', r'Cov(\1,\2)', s)
    s = re.sub(r'\\corr\{([^}]*)\}\{([^}]*)\}', r'Corr(\1,\2)', s)
    s = re.sub(r'\\binomial\{([^}]*)\}\{([^}]*)\}', r'Binom(\1,\2)', s)
    s = re.sub(r'\\unif\{([^}]*)\}\{([^}]*)\}', r'Unif(\1,\2)', s)
    s = re.sub(r'\\geom\{([^}]*)\}', r'Geom(\1)', s)
    s = re.sub(r'\\exponential\{([^}]*)\}', r'Exp(\1)', s)
    # Standard text/math mode commands
    s = re.sub(r'\\(?:text|mathrm|textbf|mathbf|mathbb|operatorname|textrm)\{([^}]*)\}', r'\1', s)
    return s


def latex_to_compact_ascii(latex):
    """Convert LaTeX to the compact ASCII form as it appears in text (for simple expressions)."""
    s = apply_common_replacements(latex)
    s = re.sub(r'\\d?frac\{([^}]*)\}\{([^}]*)\}', r'\1/\2', s)
    s = re.sub(r'\\(?:binom|dbinom)\{([^}]*)\}\{([^}]*)\}', r'(\1,\2)', s)
    s = re.sub(r'\\(?:overline|underline|hat|bar|tilde|vec|widehat)\{([^}]*)\}', r'\1', s)
    s = re.sub(r'\\(ln|log|sin|cos|tan|exp|max|min|lim|sup|inf|det|gcd|Pr|Var|Cov|E|P)\b', r'\1', s)
    s = re.sub(r'\\[a-zA-Z]+', '', s)
    s = re.sub(r'[{}^_\\]', '', s)
    s = s.replace('\x00LBRACE\x00', '{').replace('\x00RBRACE\x00', '}')
    s = s.replace(' ', '')
    return s


def latex_to_compact_with_zwsp(latex):
    """Generate compact form for complex expressions (reordered for frac/binom)."""
    s = apply_common_replacements(latex)
    # For frac: swap to denominator first, numerator second (matches text rendering)
    s = re.sub(r'\\d?frac\{([^}]*)\}\{([^}]*)\}', r'\2\1', s)
    # For binom: swap to bottom first, top second
    s = re.sub(r'\\(?:binom|dbinom)\{([^}]*)\}\{([^}]*)\}', r'(\2\1)', s)
    s = re.sub(r'\\(?:overline|underline|hat|bar|tilde|vec|widehat)\{([^}]*)\}', r'\1', s)
    s = re.sub(r'\\(ln|log|sin|cos|tan|exp|max|min|lim|sup|inf|det|gcd|Pr|Var|Cov|E|P)\b', r'\1', s)
    s = re.sub(r'\\[a-zA-Z]+', '', s)
    s = re.sub(r'[{}^_\\]', '', s)
    s = s.replace('\x00LBRACE\x00', '{').replace('\x00RBRACE\x00', '}')
    s = s.replace(' ', '')
    return s


def find_compact_in_text(text, compact, pos, prefer_spaced=False):
    """
    Find the compact source in text, allowing for spaces between characters.
    Returns (start_idx, end_idx) or (-1, -1) if not found.
    If prefer_spaced=True (for complex expressions), try spaced pattern first.
    """
    if not prefer_spaced:
        # First try exact match (no extra spaces)
        idx = text.find(compact, pos)
        if idx != -1 and idx - pos < 2000:
            return (idx, idx + len(compact))

        # Try with unicode minus
        alt = compact.replace('-', UNICODE_MINUS)
        if alt != compact:
            idx = text.find(alt, pos)
            if idx != -1 and idx - pos < 2000:
                return (idx, idx + len(alt))

    # Try matching with optional spaces/zwsp between characters
    if len(compact) >= 2:
        # Also try with unicode minus substitution
        variants = [compact]
        alt = compact.replace('-', UNICODE_MINUS)
        if alt != compact:
            variants.append(alt)
        for variant in variants:
            pattern_chars = []
            for ch in variant:
                pattern_chars.append(re.escape(ch))
            spaced_pattern = r'[\s\u200b]*'.join(pattern_chars)
            try:
                m = re.search(spaced_pattern, text[pos:pos+2000])
                if m:
                    return (pos + m.start(), pos + m.end())
            except re.error:
                pass

    if prefer_spaced:
        # Fall back to exact match
        idx = text.find(compact, pos)
        if idx != -1 and idx - pos < 2000:
            return (idx, idx + len(compact))
        alt = compact.replace('-', UNICODE_MINUS)
        if alt != compact:
            idx = text.find(alt, pos)
            if idx != -1 and idx - pos < 2000:
                return (idx, idx + len(alt))

    return (-1, -1)


def find_rendered_block_start(text, source_start, pos, compact_len=0):
    """Scan backward from compact source to find where the rendered (unicode) block begins."""
    if source_start <= pos:
        return source_start

    i = source_start - 1
    if i < pos or text[i] != ' ':
        return source_start

    i -= 1
    if i < pos:
        return source_start

    max_lookback = max(compact_len * 4, 40) if compact_len > 0 else 200
    min_pos = max(pos, source_start - max_lookback)

    def is_core_math(ch):
        """Characters that are unambiguously math rendering."""
        if is_math_unicode(ch):
            return True
        if is_math_symbol(ch):
            return True
        if ch == ZWSP:
            return True
        return False

    def is_rendered_content(ch):
        """Characters that can appear in a rendered math block."""
        if is_core_math(ch):
            return True
        if ch in '0123456789':
            return True
        if ch in '()[]{}|/,.:;+-=!':
            return True
        if ch == UNICODE_MINUS:
            return True
        return False

    def is_ascii_word_char(ch):
        return ch.isalpha() and ord(ch) < 128

    while i >= min_pos:
        ch = text[i]
        if ch == ' ':
            if i > min_pos and (is_rendered_content(text[i-1]) or is_ascii_word_char(text[i-1])):
                # Check if preceding content has math chars further back
                # Don't extend through pure English text
                j = i - 1
                while j >= min_pos and is_ascii_word_char(text[j]):
                    j -= 1
                if j >= min_pos and (text[j] == ' ' or is_rendered_content(text[j])):
                    # Check if there's math content before the ASCII word
                    k = j
                    if text[k] == ' ':
                        k -= 1
                    if k >= min_pos and is_core_math(text[k]):
                        i = j  # Skip past the ASCII word
                        continue
                # Just check if immediately preceding char is rendered
                if i > min_pos and is_rendered_content(text[i-1]):
                    i -= 1
                else:
                    break
            else:
                break
        elif is_rendered_content(ch):
            i -= 1
        elif is_ascii_word_char(ch):
            # ASCII letters might be function names (Unif, Binom, etc.)
            # Look backward to find start of this word
            word_end = i
            while i >= min_pos and is_ascii_word_char(text[i]):
                i -= 1
            word_start = i + 1
            word = text[word_start:word_end+1]
            # Check if preceded by math content (meaning this word is inside math)
            if i >= min_pos and (text[i] == ' ' or is_rendered_content(text[i])):
                # Look further back: is there math content before the space?
                check_pos = i
                if text[check_pos] == ' ':
                    check_pos -= 1
                if check_pos >= min_pos and (is_core_math(text[check_pos]) or is_rendered_content(text[check_pos])):
                    # This word is sandwiched in math context, include it
                    continue
            # Not in math context - stop here
            i = word_start - 1
            break
        else:
            break

    rendered_start = i + 1
    region = text[rendered_start:source_start]
    has_math = any(is_math_unicode(c) or is_math_symbol(c) for c in region)

    if has_math:
        return rendered_start
    else:
        return source_start


def extend_past_zwsp(text, idx):
    """If there's a \u200b after idx (possibly with intervening spaces), extend past it."""
    i = idx
    while i < len(text) and text[i] == ' ':
        i += 1
    if i < len(text) and text[i] == ZWSP:
        return i + 1
    return idx


def process_text(raw_text, latex_parts, title=None):
    """Process raw text to replace duplicated math with $latex$."""
    if not raw_text:
        return ''

    text = strip_difficulty(raw_text)

    if title:
        for diff in ['Easy', 'Medium', 'Hard', 'Extreme']:
            prefix = title + ' ' + diff + ' '
            if text.startswith(prefix):
                text = text[len(prefix):]
                break
            prefix2 = title + ' ' + diff
            if text.startswith(prefix2):
                text = text[len(prefix2):].lstrip()
                break

    if not latex_parts:
        return clean_final(text)

    result_parts = []
    pos = 0

    for latex in latex_parts:
        if not latex or not latex.strip():
            continue

        compact = latex_to_compact_ascii(latex)
        if not compact:
            continue

        complex_expr = is_complex_latex(latex)
        search_start = pos
        idx = -1
        compact_end = -1

        if complex_expr:
            reordered = latex_to_compact_with_zwsp(latex)
            start, end = find_compact_in_text(text, reordered, search_start, prefer_spaced=True)
            if start != -1:
                idx = start
                compact_end = extend_past_zwsp(text, end)
            else:
                start, end = find_compact_in_text(text, compact, search_start, prefer_spaced=True)
                if start != -1:
                    idx = start
                    compact_end = extend_past_zwsp(text, end)
        else:
            while True:
                idx = text.find(compact, search_start)
                if idx == -1:
                    alt_compact = compact.replace('-', UNICODE_MINUS)
                    if alt_compact != compact:
                        idx = text.find(alt_compact, search_start)
                        if idx != -1:
                            compact = alt_compact
                    break

                # Boundary checks for single letter matches
                if len(compact) == 1 and compact.isalpha():
                    before_ok = (idx == 0 or
                                text[idx-1] == ' ' or
                                is_math_unicode(text[idx-1]) or
                                is_math_symbol(text[idx-1]) or
                                text[idx-1] in '([$')
                    after_idx = idx + len(compact)
                    after_ok = (after_idx >= len(text) or
                               text[after_idx] == ' ' or
                               text[after_idx] in '.,;:!?)]=+' or
                               is_math_unicode(text[after_idx]) or
                               is_math_symbol(text[after_idx]) or
                               text[after_idx] == '$')

                    if not (before_ok and after_ok):
                        search_start = idx + 1
                        continue

                    expected_unicode = None
                    c = ord(compact)
                    if 97 <= c <= 122:
                        expected_unicode = chr(0x1D44E + (c - 97))
                    elif 65 <= c <= 90:
                        expected_unicode = chr(0x1D434 + (c - 65))

                    if expected_unicode:
                        lookback = text[max(0, idx-4):idx]
                        if expected_unicode not in lookback:
                            search_start = idx + 1
                            continue

                elif len(compact) <= 2 and compact.isdigit():
                    before_check = text[max(0, idx-len(compact)-1):idx]
                    if before_check == compact + ' ' or before_check.endswith(compact + ' '):
                        pass
                    elif idx > 0 and (is_math_unicode(text[idx-1]) or is_math_symbol(text[idx-1])):
                        pass
                    else:
                        if not (idx >= len(compact) + 1 and
                                text[idx-1] == ' ' and
                                text[idx-len(compact)-1:idx-1] == compact):
                            search_start = idx + 1
                            continue

                break

            if idx != -1:
                compact_end = idx + len(compact)

        if idx == -1 or idx - pos > 2000:
            continue

        block_start = find_rendered_block_start(text, idx, pos, compact_len=len(compact))

        # For simple duplications like "3 3" where no unicode is present
        if block_start == idx and len(compact) <= 3 and not complex_expr:
            check_start = idx - len(compact) - 1
            if check_start >= pos and text[check_start:idx] == compact + ' ':
                block_start = check_start

        # For spaced duplications like "2 / 3 2/3" where rendered = compact with spaces
        if block_start == idx and not complex_expr and len(compact) >= 2:
            spaced_rendered = ' '.join(compact)
            check_start = idx - len(spaced_rendered) - 1
            if check_start >= pos and text[check_start:idx] == spaced_rendered + ' ':
                block_start = check_start

        if block_start < pos:
            block_start = idx

        block_end = compact_end if compact_end != -1 else idx + len(compact)

        before_text = text[pos:block_start]
        result_parts.append(before_text)
        result_parts.append(f'${latex}$')
        pos = block_end

    result_parts.append(text[pos:])
    result = ''.join(result_parts)
    return clean_final(result)


def clean_final(text):
    """Remove leftover unicode math chars and clean spacing."""
    chars = []
    i = 0
    while i < len(text):
        ch = text[i]
        code = ord(ch)

        if 0x1D400 <= code <= 0x1D7FF:
            i += 1
            if i < len(text) and text[i] == ' ':
                i += 1
            continue

        if ch in '\u200B\u200C\u200D\u200E\u200F\uFEFF':
            i += 1
            continue

        if ch == '\ue020':
            chars.append('≠')
            i += 1
            continue

        chars.append(ch)
        i += 1

    result = ''.join(chars)
    result = re.sub(r'  +', ' ', result)
    result = re.sub(r' ([.,;:!?])', r'\1', result)
    result = result.strip()
    return result


def main():
    with open(INPUT_PATH, 'r') as f:
        data = json.load(f)

    print(f"Loaded {len(data)} questions from batch-2.json")

    output = []
    for i, rec in enumerate(data):
        problem = process_text(
            rec.get('problem_raw', ''),
            rec.get('problemLatex', [])
        )
        solution = process_text(
            rec.get('solution_raw', ''),
            rec.get('solutionLatex', []),
            title=rec.get('title')
        )

        output.append({
            'id': rec['id'],
            'title': rec['title'],
            'difficulty': rec['difficulty'],
            'url': rec['url'],
            'problem': problem,
            'solution': solution,
            'characteristics': rec.get('characteristics', ''),
            'hasHint': rec.get('hasHint', False),
            'hint': rec.get('hint', ''),
        })

    with open(OUTPUT_PATH, 'w') as f:
        json.dump(output, f, indent=2)

    size_kb = os.path.getsize(OUTPUT_PATH) / 1024
    print(f"Written {len(output)} questions to batch-2-clean.json ({size_kb:.1f} KB)")

    # Show samples
    for q in output[:5]:
        print(f"\n=== {q['title']} ({q['difficulty']}) ===")
        print(f"Problem: {q['problem'][:350]}")
        print(f"Solution: {q['solution'][:350]}")


if __name__ == '__main__':
    main()
