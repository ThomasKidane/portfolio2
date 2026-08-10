#!/usr/bin/env python3
"""
Clean batch-7.json: replace doubled math (unicode-rendered + ASCII source) with $latex$.
Uses the problemLatex/solutionLatex arrays as ground truth for substitution order.

Raw text pattern: [unicode-rendered with spaces] [compact ASCII with spaces]
Fractions \frac{a}{b} compact: denom_tokens num_tokens \u200b
Sums \sum_{sub}^{sup} compact: sub_tokens ∑ sup_tokens \u200b
Exponents x^n compact: x n (space between)
"""
import json
import re
import os

INPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'tmp-batches', 'batch-7.json')
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'tmp-batches', 'batch-7-clean.json')

UNICODE_MINUS = '\u2212'
ZWSP = '\u200b'


def is_math_unicode(ch):
    code = ord(ch)
    return 0x1D400 <= code <= 0x1D7FF


def is_math_symbol(ch):
    return ch in '≤≥≠∼≈±∞…⋯×⋅∩∪∈∉⊂⊆∀∃→←⇒⇐⟺⟹∣∑∏∫∂∇√παβγδεελμσθφωρτχψηζνξκΓΔΣΩΦΘΛΠ\u2212\ue020'


def strip_difficulty(text):
    return re.sub(r'^(Easy|Medium|Hard|Extreme)\s+', '', text)


def latex_to_symbol(s):
    """Replace LaTeX commands with unicode equivalents."""
    s = s.replace('\\$', '$')
    s = s.replace('\\leq', '≤').replace('\\geq', '≥').replace('\\neq', '≠')
    s = re.sub(r'\\le\b', '≤', s)
    s = re.sub(r'\\ge\b', '≥', s)
    s = re.sub(r'\\ne\b', '≠', s)
    s = s.replace('\\sim', '∼').replace('\\approx', '≈').replace('\\pm', '±')
    s = s.replace('\\infty', '∞').replace('\\ldots', '…').replace('\\cdots', '⋯')
    s = s.replace('\\times', '×').replace('\\cdot', '⋅').replace('\\circ', '∘')
    s = s.replace('\\cap', '∩').replace('\\cup', '∪')
    s = s.replace('\\in', '∈').replace('\\notin', '∉')
    s = s.replace('\\subset', '⊂').replace('\\subseteq', '⊆')
    s = s.replace('\\forall', '∀').replace('\\exists', '∃')
    s = s.replace('\\rightarrow', '→').replace('\\leftarrow', '←')
    s = s.replace('\\to', '→')
    s = s.replace('\\Rightarrow', '⇒').replace('\\Leftarrow', '⇐')
    s = s.replace('\\iff', '⟺').replace('\\Leftrightarrow', '⟺')
    s = s.replace('\\implies', '⟹')
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
    s = s.replace('\\dots', '⋯')
    return s


def latex_to_compact(latex):
    """
    Convert LaTeX to its compact ASCII form as it appears in scraped text.
    Returns a string with space-separated tokens matching the raw text pattern.
    """
    if not latex:
        return ''
    if '\\begin{' in latex:
        return ''

    s = latex
    
    # Remove structural commands BEFORE symbol conversion (to avoid \left → ≤ft)
    s = re.sub(r'\\(?:left|right|displaystyle|,|;|!|quad|qquad)\s*', '', s)
    
    s = latex_to_symbol(s)

    # Process fractions: \dfrac{num}{denom} → denom num ZWSP
    # Use a function to handle nested braces
    def find_brace_group(s, start):
        """Find matching brace group starting at s[start] which should be '{'."""
        if start >= len(s) or s[start] != '{':
            return None
        depth = 0
        for i in range(start, len(s)):
            if s[i] == '{':
                depth += 1
            elif s[i] == '}':
                depth -= 1
                if depth == 0:
                    return s[start+1:i]
        return None

    for _ in range(5):
        m = re.search(r'\\d?frac\{', s)
        if not m:
            break
        frac_start = m.start()
        # Find numerator (first brace group after \frac)
        num_start = m.end() - 1  # position of '{'
        num_content = find_brace_group(s, num_start)
        if num_content is None:
            break
        # Find denominator (next brace group)
        denom_start = num_start + len(num_content) + 2  # skip '{content}'
        denom_content = find_brace_group(s, denom_start)
        if denom_content is None:
            break
        
        num_clean = re.sub(r'\\[a-zA-Z]+', '', num_content)
        num_clean = num_clean.replace('^', ' ').replace('_', ' ')
        num_clean = re.sub(r'[{}\\]', '', num_clean)
        num_clean = re.sub(r' +', ' ', num_clean).strip()
        denom_clean = re.sub(r'\\[a-zA-Z]+', '', denom_content)
        denom_clean = denom_clean.replace('^', ' ').replace('_', ' ')
        denom_clean = re.sub(r'[{}\\]', '', denom_clean)
        denom_clean = re.sub(r' +', ' ', denom_clean).strip()
        replacement = denom_clean + ' ' + num_clean + ' ' + ZWSP
        frac_end = denom_start + len(denom_content) + 2
        s = s[:frac_start] + replacement + s[frac_end:]

    # Process sums/products with limits: \sum_{sub}^{sup} → sub ∑ sup ZWSP
    def convert_bigop(m):
        sym = m.group(1)
        sub = m.group(2) or m.group(3) or ''
        sup = m.group(4) or m.group(5) or ''
        sub_c = re.sub(r'\\[a-zA-Z]+', '', sub)
        sub_c = re.sub(r'[{}^_\\]', '', sub_c).replace(' ', '')
        sup_c = re.sub(r'\\[a-zA-Z]+', '', sup)
        sup_c = re.sub(r'[{}^_\\]', '', sup_c).replace(' ', '')
        return sub_c + ' ' + sym + ' ' + sup_c + ' ' + ZWSP

    s = re.sub(r'(∑|∏|∫)_(?:\{([^{}]*)\}|([a-zA-Z0-9]+))\^(?:\{([^{}]*)\}|([a-zA-Z0-9]+))', convert_bigop, s)

    # Process text commands
    s = re.sub(r'\\(?:text|mathrm|textbf|mathbf|mathbb|operatorname|textrm)\{([^}]*)\}', r'\1', s)
    s = re.sub(r'\\(?:overline|underline|hat|bar|tilde|vec|widehat)\{([^}]*)\}', r'\1', s)
    s = re.sub(r'\\(ln|log|sin|cos|tan|exp|max|min|lim|sup|inf|det|gcd|Pr|prob|Var|Cov|E|P)\b', r'\1', s)
    s = re.sub(r'\\(?:unif|Unif)\{([^}]*)\}\{([^}]*)\}', r'Unif(\1,\2)', s)
    s = re.sub(r'\\[a-zA-Z]+', '', s)
    s = s.replace('{', '').replace('}', '').replace('\\', '')
    s = s.replace('^', ' ').replace('_', ' ')
    s = re.sub(r' +', ' ', s).strip()

    return s


def build_flex_regex(compact):
    """
    Build a regex that matches the compact string with optional spaces between tokens.
    Tokens = contiguous runs of same-type characters.
    """
    if not compact:
        return None

    tokens = []
    i = 0
    while i < len(compact):
        ch = compact[i]
        if ch == ' ':
            i += 1
            continue
        if ch == ZWSP:
            tokens.append(ZWSP)
            i += 1
            continue
        # Collect contiguous alphanumeric
        if ch.isalnum():
            j = i
            while j < len(compact) and compact[j].isalnum():
                j += 1
            tokens.append(compact[i:j])
            i = j
        else:
            tokens.append(ch)
            i += 1

    if not tokens:
        return None

    parts = [re.escape(t) for t in tokens]
    # Allow optional space (and optional zwsp) between tokens
    sep = r'[\s\u200b]*'
    pattern = sep.join(parts)
    return pattern


def find_rendered_block_start(text, source_start, pos):
    """Scan backward from compact source to find where unicode rendering begins."""
    if source_start <= pos:
        return source_start

    i = source_start - 1
    if i < pos or text[i] != ' ':
        return source_start

    i -= 1
    if i < pos:
        return source_start

    def is_rendered_char(ch):
        if is_math_unicode(ch):
            return True
        if is_math_symbol(ch):
            return True
        if ch in '0123456789':
            return True
        if ch in '()<>[]|/,.;+-=!':
            return True
        if ch == UNICODE_MINUS:
            return True
        if ch == ZWSP:
            return True
        if ch == '\u2061':
            return True
        return False

    def is_math_func(text, end_pos):
        """Check if text ending at end_pos is a known math function."""
        funcs = ['sin', 'cos', 'tan', 'log', 'ln', 'exp', 'max', 'min', 'lim',
                 'sup', 'inf', 'det', 'gcd', 'Pr', 'Var', 'Cov']
        for f in funcs:
            start = end_pos - len(f) + 1
            if start >= pos and text[start:end_pos+1] == f:
                return start
        return -1

    while i >= pos:
        ch = text[i]
        if ch == ' ':
            if i > pos and is_rendered_char(text[i-1]):
                i -= 1
            elif i > pos and text[i-1].isalpha():
                # Check if this is a math function name
                j = i - 1
                while j >= pos and text[j].isalpha():
                    j -= 1
                letter_run = text[j+1:i]
                if len(letter_run) <= 5:
                    func_start = is_math_func(text, i-1)
                    if func_start >= pos:
                        # Include the function in the rendered block, then stop
                        i = func_start - 1
                        if i >= pos and text[i] == ' ':
                            # Check what's before the space before the function
                            if i > pos and is_rendered_char(text[i-1]):
                                i -= 1
                                continue
                            else:
                                # Stop here; the function IS the start of rendered block
                                break
                        continue
                break
            else:
                break
        elif is_rendered_char(ch):
            i -= 1
        elif ch.isalpha():
            # Single letter or known function embedded in math
            j = i
            while j >= pos and text[j].isalpha():
                j -= 1
            letter_run = text[j+1:i+1]
            if len(letter_run) <= 5:
                func_start = is_math_func(text, i)
                if func_start >= pos:
                    i = j
                    continue
            break
        else:
            break

    rendered_start = i + 1

    region = text[rendered_start:source_start]
    has_math = any(is_math_unicode(c) or is_math_symbol(c) for c in region)

    if has_math:
        return rendered_start

    # Also check: if the region content (without spaces) equals the compact form,
    # then this IS the rendered duplicate (just spaced out)
    region_stripped = region.replace(' ', '').replace(ZWSP, '').replace('\u2061', '')
    compact_at_source = text[source_start:source_start + len(region_stripped) * 2]
    compact_stripped = compact_at_source.replace(' ', '').replace(ZWSP, '')
    if region_stripped and region_stripped == compact_stripped[:len(region_stripped)]:
        return rendered_start

    return source_start


def validate_match(text, idx, match_len, compact_no_spaces, pos):
    """
    Validate that a match is the compact (second) copy in a rendered+compact pair.
    Returns True if valid, False if should retry from next position.
    """
    if match_len == 1 and compact_no_spaces.isalpha():
        ch = compact_no_spaces
        before_ok = (idx == 0 or
                    text[idx-1] == ' ' or
                    is_math_unicode(text[idx-1]) or
                    is_math_symbol(text[idx-1]) or
                    text[idx-1] in '([$' or
                    text[idx-1] == ZWSP)
        after_idx = idx + match_len
        after_ok = (after_idx >= len(text) or
                   text[after_idx] == ' ' or
                   text[after_idx] in '.,;:!?)]=+\u200b' or
                   is_math_unicode(text[after_idx]) or
                   is_math_symbol(text[after_idx]) or
                   text[after_idx] == '$')

        if not (before_ok and after_ok):
            return False

        expected_unicode = None
        c = ord(ch)
        if 97 <= c <= 122:
            expected_unicode = chr(0x1D44E + (c - 97))
        elif 65 <= c <= 90:
            expected_unicode = chr(0x1D434 + (c - 65))

        if expected_unicode:
            lookback = text[max(pos, idx-4):idx]
            if expected_unicode not in lookback:
                return False
        return True

    elif compact_no_spaces.isdigit():
        # Pure digit match — must be preceded by same digits + space (the rendered copy)
        n = len(compact_no_spaces)
        if idx >= n + 1 and text[idx-1] == ' ' and text[idx-n-1:idx-1] == compact_no_spaces:
            return True
        if idx > 0 and (is_math_unicode(text[idx-1]) or is_math_symbol(text[idx-1]) or text[idx-1] == ZWSP):
            return True
        before_check = text[max(pos, idx-n-1):idx]
        if before_check.endswith(compact_no_spaces + ' '):
            return True
        return False

    # For longer expressions (multi-token), check there's rendered math before
    if match_len <= 5 and compact_no_spaces.isalnum():
        # Short alphanumeric: verify preceded by unicode math or same pattern
        region_before = text[max(pos, idx-match_len*3):idx]
        has_math_before = any(is_math_unicode(c) or is_math_symbol(c) for c in region_before)
        has_dup_before = compact_no_spaces in region_before
        if not has_math_before and not has_dup_before:
            return False

    return True


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
        if '\\begin{' in latex:
            continue

        compact = latex_to_compact(latex)
        if not compact:
            continue

        compact_no_spaces = compact.replace(' ', '').replace(ZWSP, '')
        if not compact_no_spaces:
            continue

        # Build flex regex for matching with optional spaces
        pattern = build_flex_regex(compact)
        if not pattern:
            continue

        # Allow either ASCII minus or unicode minus
        pattern_uminus = pattern.replace(re.escape('-'), '(?:-|\u2212)')
        flex_re = re.compile(pattern_uminus)

        # Search with retry loop for validation
        # Strategy: try exact (no-space) match first, then flex regex
        # For exact: always look for the COMPACT copy (second in a pair)
        search_from = pos
        found = False
        idx = -1
        match_len = 0

        # First try exact compact (no internal spaces)
        exact_variants = [compact_no_spaces, compact_no_spaces.replace('-', UNICODE_MINUS)]
        for variant in exact_variants:
            search_pos = pos
            for _ in range(20):
                eidx = text.find(variant, search_pos)
                if eidx == -1 or eidx - pos > 2000:
                    break
                if validate_match(text, eidx, len(variant), compact_no_spaces, pos):
                    idx = eidx
                    match_len = len(variant)
                    found = True
                    break
                search_pos = eidx + 1
            if found:
                break

        # If exact didn't work, try flex regex
        # The flex regex may match the rendered version first - we need to find 
        # the compact (second) copy by looking for the pattern that is followed by
        # non-math text (the compact one ends the doubled block)
        if not found:
            candidates = []
            search_pos = pos
            for _ in range(30):
                m = flex_re.search(text, search_pos)
                if not m:
                    break
                cidx = m.start()
                clen = m.end() - m.start()
                if cidx - pos > 2000:
                    break
                candidates.append((cidx, clen))
                search_pos = cidx + 1
                if len(candidates) >= 10:
                    break

            # Pick the best candidate: prefer one that has a duplicate before it
            # (indicating it's the compact copy), or failing that, the first valid one
            for ci, (cidx, clen) in enumerate(candidates):
                # Check if there's a similar match right before this one
                # (which would be the rendered copy)
                is_second_copy = False
                if ci > 0:
                    prev_idx, prev_len = candidates[ci-1]
                    if cidx - (prev_idx + prev_len) <= 3:
                        is_second_copy = True
                
                # Also check: text before has math unicode (rendered block)
                region_before = text[max(pos, cidx-clen*3):cidx]
                has_math_before = any(is_math_unicode(c) for c in region_before)
                
                if is_second_copy or has_math_before:
                    if validate_match(text, cidx, clen, compact_no_spaces, pos):
                        idx = cidx
                        match_len = clen
                        found = True
                        break
            
            # If no candidate with math before, try the last candidate (most likely compact)
            if not found and len(candidates) >= 2:
                cidx, clen = candidates[-1]
                if validate_match(text, cidx, clen, compact_no_spaces, pos):
                    idx = cidx
                    match_len = clen
                    found = True
            
            # Fallback: first valid candidate
            if not found:
                for cidx, clen in candidates:
                    if validate_match(text, cidx, clen, compact_no_spaces, pos):
                        idx = cidx
                        match_len = clen
                        found = True
                        break

        if not found:
            continue

        block_end = idx + match_len

        # Skip trailing whitespace/zwsp after match
        while block_end < len(text) and text[block_end] in ' \u200b':
            if text[block_end] == ZWSP:
                block_end += 1
                break
            block_end += 1

        # Find start of rendered block (before compact)
        block_start = find_rendered_block_start(text, idx, pos)

        # For simple "X X" duplications with no unicode math before
        if block_start == idx and len(compact_no_spaces) <= 4:
            # Try to find the rendered duplicate before
            # Pattern: same text + space before the compact match
            before_region = text[max(pos, idx - match_len - 5):idx]
            # Check if rendered copy is right before (with space)
            if before_region.rstrip().endswith(compact_no_spaces):
                # Find where the rendered copy starts
                stripped = before_region.rstrip()
                dup_end = max(pos, idx - match_len - 5) + len(stripped)
                dup_start = dup_end - len(compact_no_spaces)
                if dup_start >= pos:
                    block_start = dup_start

        if block_start < pos:
            block_start = idx

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

        if ch == '\u2061':  # function application char
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
    # Ensure space between word chars and inline math $...$
    # Match $content$ blocks and ensure spacing around them
    def fix_math_spacing(m):
        before = m.group(1) or ''
        content = m.group(2)
        after = m.group(3) or ''
        out = ''
        if before and before[-1].isalnum():
            out += before + ' $' + content + '$'
        else:
            out += before + '$' + content + '$'
        if after and after[0].isalnum():
            out += ' ' + after
        else:
            out += after
        return out
    
    result = re.sub(r'(.?)\$([^$]+)\$(.?)', fix_math_spacing, result)
    result = re.sub(r'  +', ' ', result)

    return result.strip()


def main():
    with open(INPUT_PATH, 'r') as f:
        data = json.load(f)

    print(f"Processing {len(data)} questions from batch-7.json")

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
        json.dump(output, f, indent=2, ensure_ascii=False)

    size_kb = os.path.getsize(OUTPUT_PATH) / 1024
    print(f"Written {len(output)} questions to batch-7-clean.json ({size_kb:.1f} KB)")

    for sample in output[:8]:
        print(f"\n=== {sample['title']} ===")
        print(f"Problem: {sample['problem'][:300]}")
        print(f"Solution (first 300): {sample['solution'][:300]}")


if __name__ == '__main__':
    main()
