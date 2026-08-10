#!/usr/bin/env python3
"""
Clean batch-6.json: replace doubled math (unicode-rendered + ASCII source) with $latex$.

Strategy: For each LaTeX expression:
1. Generate the compact ASCII form (how the source appears in text)
2. Generate the rendered form (how the unicode rendering appears — spaced, with math italic)
3. Search for "rendered compact" pattern and replace with $latex$
4. Fall back to replacing just compact if full pattern not found
"""
import json
import re

INPUT_PATH = 'tmp-batches/batch-6.json'
OUTPUT_PATH = 'tmp-batches/batch-6-clean.json'

UNICODE_MINUS = '\u2212'
ZWS = '\u200b'

# Greek letter to math italic mapping
GREEK_TO_MATH_ITALIC = {
    'α': '\U0001D6FC', 'β': '\U0001D6FD', 'γ': '\U0001D6FE', 'δ': '\U0001D6FF',
    'ε': '\U0001D700', 'ζ': '\U0001D701', 'η': '\U0001D702', 'θ': '\U0001D703',
    'ι': '\U0001D704', 'κ': '\U0001D705', 'λ': '\U0001D706', 'μ': '\U0001D707',
    'ν': '\U0001D708', 'ξ': '\U0001D709', 'π': '\U0001D70B', 'ρ': '\U0001D70C',
    'σ': '\U0001D70E', 'τ': '\U0001D70F', 'φ': '\U0001D711', 'χ': '\U0001D712',
    'ψ': '\U0001D713', 'ω': '\U0001D714',
}


def is_math_unicode(ch):
    code = ord(ch)
    return 0x1D400 <= code <= 0x1D7FF


def is_math_symbol(ch):
    return ch in '≤≥≠∼≈±∞…⋯×⋅∩∪∈∉⊂⊆∀∃→←⇒⇐∣∑∏∫∂∇√παβγδεελμσθφωρτχψηζνξκΓΔΣΩΦΘΛΠ\u2212\ue020'


def to_math_italic(ch):
    c = ord(ch)
    if 97 <= c <= 122:
        return chr(0x1D44E + (c - 97))
    if 65 <= c <= 90:
        return chr(0x1D434 + (c - 65))
    return ch


def latex_to_compact(latex):
    """Convert LaTeX to the compact ASCII form as it appears in the raw text."""
    s = latex
    s = s.replace('\\$', '$')
    # Custom commands
    s = re.sub(r'\\unif\{([^}]*)\}\{([^}]*)\}', r'Unif(\1,\2)', s)
    s = re.sub(r'\\prob\{([^}]*)\}', r'P[\1]', s)
    s = re.sub(r'\\ev\{([^}]*)\}', r'E[\1]', s)
    # Operators to unicode
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
    s = s.replace('\\iff', '⟺')
    s = s.replace('\\mid', '∣').replace('\\vert', '∣')
    # Literal | in LaTeX also renders as ∣ in the text
    s = s.replace('|', '∣')
    s = s.replace('\\sum', '∑').replace('\\prod', '∏').replace('\\int', '∫')
    s = s.replace('\\partial', '∂').replace('\\nabla', '∇')
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
    # Text commands
    s = re.sub(r'\\(?:text|mathrm|textbf|mathbf|mathbb|operatorname|textrm)\{([^}]*)\}', r'\1', s)
    # sqrt
    s = re.sub(r'\\sqrt\{([^}]*)\}', r'√\1', s)
    s = re.sub(r'\\sqrt', '√', s)
    # Fractions: \frac{a}{b} in the compact source shows denominator first: "b a"
    s = re.sub(r'\\d?frac\{([^}]*)\}\{([^}]*)\}', lambda m: m.group(2) + '\x00' + m.group(1), s)
    # Binom: \binom{n}{k} in compact source shows bottom first: "k n"
    s = re.sub(r'\\(?:binom|dbinom)\{([^}]*)\}\{([^}]*)\}', lambda m: '(' + m.group(2) + '\x00' + m.group(1) + ')', s)
    # Decorators
    s = re.sub(r'\\(?:overline|underline|hat|bar|tilde|vec|widehat)\{([^}]*)\}', r'\1', s)
    # Function names
    s = re.sub(r'\\(ln|log|sin|cos|tan|arcsin|arccos|arctan|exp|max|min|lim|sup|inf|det|gcd|Pr)\b', r'\1', s)
    # Known no-output commands
    s = re.sub(r'\\(?:displaystyle|left|right|hspace\{[^}]*\}|begin\{[^}]*\}|end\{[^}]*\}|\\)\s*', '', s)
    # Strip remaining backslash commands
    s = re.sub(r'\\[a-zA-Z]+', '', s)
    # Remove original LaTeX spaces first
    s = s.replace(' ', '')
    # Replace ^ and _ with space (superscripts/subscripts become space-separated in text)
    s = s.replace('^', ' ').replace('_', ' ')
    # Convert structural separators (from frac/binom) to spaces
    s = s.replace('\x00', ' ')
    # Strip braces and remaining backslashes
    s = re.sub(r'[{}\\]', '', s)
    # Collapse multiple spaces to single, trim
    s = re.sub(r' +', ' ', s).strip()
    return s


def tokenize_compact(compact):
    """Split compact string into tokens for building the rendered version."""
    tokens = []
    i = 0
    while i < len(compact):
        ch = compact[i]
        if ch == ' ':
            i += 1
            continue
        if ch.isdigit():
            num = ''
            while i < len(compact) and compact[i].isdigit():
                num += compact[i]
                i += 1
            tokens.append(num)
        elif ch.isalpha() and ord(ch) < 128:
            word = ''
            while i < len(compact) and compact[i].isalpha() and ord(compact[i]) < 128:
                word += compact[i]
                i += 1
            tokens.append(word)
        elif ch in GREEK_TO_MATH_ITALIC or is_math_symbol(ch):
            tokens.append(ch)
            i += 1
        else:
            tokens.append(ch)
            i += 1
    return tokens


def build_rendered_regex(compact):
    """Build a regex that matches the rendered (spaced, unicode) version of the compact."""
    tokens = tokenize_compact(compact)
    regex_parts = []
    func_names = {'sin', 'cos', 'tan', 'log', 'ln', 'exp', 'lim', 'max', 'min',
                  'sup', 'inf', 'det', 'gcd', 'Pr', 'arcsin', 'arccos', 'arctan',
                  'Unif', 'Var', 'Cov'}

    for i, tok in enumerate(tokens):
        if len(tok) == 1 and tok.isalpha() and ord(tok) < 128:
            # Single letter → match either math italic or the original letter
            math_ver = to_math_italic(tok)
            regex_parts.append(f'(?:{re.escape(math_ver)}|{re.escape(tok)})')
        elif tok in GREEK_TO_MATH_ITALIC:
            math_ver = GREEK_TO_MATH_ITALIC[tok]
            regex_parts.append(f'(?:{re.escape(math_ver)}|{re.escape(tok)})')
        elif tok == '-':
            regex_parts.append(f'(?:{re.escape(UNICODE_MINUS)}|-)')
        elif tok == '|' or tok == '∣':
            regex_parts.append(f'(?:\\||∣)')
        elif tok in func_names:
            # Function name + optional function application char
            regex_parts.append(re.escape(tok))
        else:
            regex_parts.append(re.escape(tok))

    # Join with "one or more spaces, possibly with \u2061 mixed in"
    sep = r'[\s\u2061\u200b]*'
    pattern = sep.join(regex_parts)
    return pattern


def build_full_pattern(latex):
    """Build regex matching the full doubled block: rendered_part + space + compact_source."""
    compact = latex_to_compact(latex)
    if not compact:
        return None, None

    rendered_regex = build_rendered_regex(compact)
    # Build compact regex: spaces become flexible whitespace, - matches both forms
    compact_regex = ''
    for ch in compact:
        if ch == ' ':
            compact_regex += r'[\s\u200b]+'
        elif ch == '-':
            compact_regex += f'(?:{re.escape(UNICODE_MINUS)}|-)'
        else:
            compact_regex += re.escape(ch)
    full_pattern = rendered_regex + r'[\s\u2061\u200b]+' + compact_regex
    return full_pattern, compact


def build_search_variants_unused():
    pass


def find_and_replace(text, pos, latex):
    """Find the doubled math block and return (block_start, block_end) or None."""
    compact = latex_to_compact(latex)
    if not compact:
        return None

    # Strategy 1: Use regex to find the full "rendered + compact" pattern
    full_pattern, _ = build_full_pattern(latex)
    if full_pattern:
        try:
            match = re.search(full_pattern, text[pos:])
            if match and match.start() < 1500:
                start = pos + match.start()
                end = pos + match.end()
                # Skip trailing zero-width chars
                while end < len(text) and text[end] in '\u200b\u200c\u200d\u200e\u200f\ufeff':
                    end += 1
                return (start, end)
        except re.error:
            pass

    # Strategy 2: For subscript patterns, try the spaced variant
    m = re.match(r'^([A-Za-z])_\{?([^}]*)\}?$', latex.strip())
    if m:
        var_letter = m.group(1)
        sub_compact = latex_to_compact(m.group(2))
        if sub_compact:
            spaced_compact = f'{var_letter} {sub_compact}'
            # Build rendered: math_italic_var + space + rendered_sub + space + spaced_compact
            rendered_var = to_math_italic(var_letter)
            sub_rendered_regex = build_rendered_regex(sub_compact)
            sub_pattern = re.escape(rendered_var) + r'[\s\u200b]+' + sub_rendered_regex + r'[\s\u200b]+' + re.escape(spaced_compact)
            try:
                match = re.search(sub_pattern, text[pos:])
                if match and match.start() < 1500:
                    start = pos + match.start()
                    end = pos + match.end()
                    while end < len(text) and text[end] in '\u200b\u200c\u200d\u200e\u200f\ufeff':
                        end += 1
                    return (start, end)
            except re.error:
                pass

    # Strategy 3: Find just the compact source with validation
    result = find_validated_compact(text, pos, compact, latex)
    if result:
        return result

    # Strategy 4: Try with | as ∣ if applicable
    if '|' in compact:
        alt = compact.replace('|', '∣')
        result = find_validated_compact(text, pos, alt, latex)
        if result:
            return result

    return None


def find_validated_compact(text, pos, compact, latex):
    """Find compact source with validation, and try to detect the rendered part before it."""
    # Build regex for the compact (spaces → flexible whitespace)
    compact_regex = ''
    for ch in compact:
        if ch == ' ':
            compact_regex += r'[\s\u200b]+'
        elif ch == '-':
            compact_regex += f'(?:{re.escape(UNICODE_MINUS)}|-)'
        else:
            compact_regex += re.escape(ch)

    search_text = text[pos:]
    for m in re.finditer(compact_regex, search_text):
        idx = pos + m.start()
        if idx - pos > 1500:
            return None

        matched_text = m.group()
        if not validate_compact_match(text, idx, matched_text, pos, latex):
            continue

        end = idx + len(matched_text)
        while end < len(text) and text[end] in '\u200b\u200c\u200d\u200e\u200f\ufeff':
            end += 1

        # Try to detect rendered block before
        block_start = scan_rendered_backward(text, idx, pos)

        # For simple duplications "N N"
        if block_start == idx:
            # Check for duplication pattern: same content + space before
            check_len = len(matched_text)
            check_start = idx - check_len - 1
            if check_start >= pos:
                before = text[check_start:idx]
                if before == matched_text + ' ':
                    block_start = check_start

        if block_start < pos:
            block_start = idx

        return (block_start, end)

    return None


def validate_compact_match(text, idx, matched_text, pos, latex):
    """Validate a compact source match."""
    compact_nospace = matched_text.replace(' ', '')

    # Single letter: needs math italic before
    if len(compact_nospace) == 1 and compact_nospace.isalpha():
        expected = to_math_italic(compact_nospace)
        lookback = text[max(pos, idx - 4):idx]
        return expected in lookback

    # Subscript pattern "X 1": needs math italic of the letter before
    if re.match(r'^[A-Za-z] ', matched_text):
        letter = matched_text[0]
        expected = to_math_italic(letter)
        lookback = text[max(pos, idx - 5):idx]
        return expected in lookback

    # Short numbers: verify duplication
    if len(compact_nospace) <= 2 and compact_nospace.isdigit():
        check_start = idx - len(matched_text) - 1
        if check_start >= pos and text[check_start:idx] == matched_text + ' ':
            return True
        if idx > pos and (is_math_unicode(text[idx - 1]) or is_math_symbol(text[idx - 1])):
            return True
        if idx >= pos + len(matched_text) + 1:
            if text[idx - 1] == ' ' and text[idx - len(matched_text) - 1:idx - 1] == matched_text:
                return True
        return False

    return True


def scan_rendered_backward(text, compact_start, pos):
    """Conservative backward scan — only through non-alphabetic rendered content."""
    if compact_start <= pos:
        return compact_start

    i = compact_start - 1
    if i < pos or text[i] != ' ':
        return compact_start

    i -= 1
    if i < pos:
        return compact_start

    def is_nonalpha_rendered(ch):
        if is_math_unicode(ch):
            return True
        if is_math_symbol(ch):
            return True
        if ch in '0123456789':
            return True
        if ch in '()[]|/,.:;+-=!<>$%⁡':
            return True
        if ch == UNICODE_MINUS:
            return True
        if ch == ZWS:
            return True
        return False

    while i >= pos:
        ch = text[i]
        if ch == ' ':
            if i > pos and is_nonalpha_rendered(text[i - 1]):
                i -= 1
            else:
                break
        elif is_nonalpha_rendered(ch):
            i -= 1
        else:
            break

    rendered_start = i + 1
    region = text[rendered_start:compact_start]
    has_math = any(is_math_unicode(c) or is_math_symbol(c) for c in region)

    if has_math:
        return rendered_start

    # Accept non-math rendered duplications
    region_stripped = re.sub(r'[\s\u200b\u200c\u200d]+', '', region)
    compact_before = text[compact_start:].split(' ')[0] if compact_start < len(text) else ''
    compact_stripped = re.sub(r'[\s\u200b\u200c\u200d]+', '', compact_before)
    if region_stripped and region_stripped == compact_stripped:
        return rendered_start

    return compact_start


def process_text(raw_text, latex_parts, title=None):
    """Replace duplicated math with $latex$ using the ordered LaTeX array."""
    if not raw_text:
        return ''

    text = re.sub(r'^(Easy|Medium|Hard|Extreme)\s+', '', raw_text)

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
        if '\\begin{' in latex:
            continue

        match = find_and_replace(text, pos, latex)
        if match is None:
            continue

        block_start, block_end = match
        result_parts.append(text[pos:block_start])
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

        if ch in '\u200b\u200c\u200d\u200e\u200f\ufeff':
            i += 1
            continue

        if ch == '\ue020':
            chars.append('≠')
            i += 1
            continue

        if ch == '\u2061':
            i += 1
            continue

        chars.append(ch)
        i += 1

    result = ''.join(chars)
    result = re.sub(r'  +', ' ', result)
    result = re.sub(r' ([.,;:!?])', r'\1', result)
    result = re.sub(r'  +', ' ', result)
    return result.strip()


def main():
    with open(INPUT_PATH, 'r') as f:
        data = json.load(f)

    output = []
    for rec in data:
        title = rec.get('title', '')

        problem = process_text(
            rec.get('problem_raw', ''),
            rec.get('problemLatex', [])
        )
        solution = process_text(
            rec.get('solution_raw', ''),
            rec.get('solutionLatex', []),
            title=title
        )

        output.append({
            'id': rec['id'],
            'title': title,
            'difficulty': rec.get('difficulty', ''),
            'url': rec.get('url', ''),
            'problem': problem,
            'solution': solution,
            'characteristics': rec.get('characteristics', ''),
            'hasHint': rec.get('hasHint', False),
            'hint': rec.get('hint', ''),
        })

    with open(OUTPUT_PATH, 'w') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Processed {len(output)} questions -> {OUTPUT_PATH}")

    for q in output[:8]:
        print(f"\n=== {q['title']} ===")
        print(f"Problem: {q['problem'][:300]}")
        print(f"Solution: {q['solution'][:200]}")


if __name__ == '__main__':
    main()
