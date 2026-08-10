#!/usr/bin/env python3
"""
Clean batch-5.json: replace doubled math (unicode-rendered + ASCII source) with $latex$.
Uses the problemLatex/solutionLatex arrays as ordered replacement LaTeX.

Pattern: [unicode_spaced_rendered] [compact_ascii_source]
- Rendered: unicode math italic chars + spaced operators/digits
- Source: compact ASCII (operators joined, but subscript indices space-separated)
"""
import json
import re
import os

INPUT_PATH = '/Users/thomaskidane/Documents/Projects/portfolio2/tmp-batches/batch-5.json'
OUTPUT_PATH = '/Users/thomaskidane/Documents/Projects/portfolio2/tmp-batches/batch-5-clean.json'

UNICODE_MINUS = '\u2212'
ZWS = '\u200b'
PRIME = '\u2032'


def is_math_unicode(ch):
    code = ord(ch)
    return 0x1D400 <= code <= 0x1D7FF


def is_math_symbol(ch):
    return ch in '≤≥≠∼≈±∞…⋯×⋅∩∪∈∉⊂⊆⊇⊃∀∃→←⇒⇐⇔⟹⟸⟺∣∑∏∫∂∇√παβγδεελμσθφωρτχψηζνξκΓΔΣΩΦΘΛΠ\u2212\ue020≡≪≫∝∅⊥∧∨¬∘\u2032\u2061'


def strip_difficulty(text):
    return re.sub(r'^(Easy|Medium|Hard|Extreme)\s+', '', text)


def latex_to_compact(latex):
    """Convert LaTeX to the compact source form (no spaces)."""
    s = latex
    # Preserve literal braces
    s = s.replace('\\{', '\x01').replace('\\}', '\x02')
    # Literal dollar sign
    s = s.replace('\\$', '$')
    # Operators
    s = s.replace('\\leq', '≤').replace('\\geq', '≥').replace('\\neq', '≠')
    s = s.replace('\\le ', '≤').replace('\\ge ', '≥').replace('\\ne ', '≠')
    s = s.replace('\\le\n', '≤').replace('\\ge\n', '≥')
    s = s.replace('\\iff', '⟺').replace('\\implies', '⟹').replace('\\impliedby', '⟸')
    s = s.replace('\\Longleftrightarrow', '⟺').replace('\\Longrightarrow', '⟹')
    s = s.replace('\\sim', '∼').replace('\\approx', '≈').replace('\\pm', '±')
    s = s.replace('\\infty', '∞').replace('\\ldots', '…').replace('\\cdots', '⋯')
    s = s.replace('\\times', '×').replace('\\cdot', '⋅').replace('\\circ', '∘')
    s = s.replace('\\cap', '∩').replace('\\cup', '∪')
    s = s.replace('\\notin', '∉').replace('\\in', '∈')
    s = s.replace('\\subseteq', '⊆').replace('\\supseteq', '⊇')
    s = s.replace('\\subset', '⊂').replace('\\supset', '⊃')
    s = s.replace('\\forall', '∀').replace('\\exists', '∃')
    s = s.replace('\\rightarrow', '→').replace('\\leftarrow', '←').replace('\\to', '→')
    s = s.replace('\\Rightarrow', '⇒').replace('\\Leftarrow', '⇐')
    s = s.replace('\\leftrightarrow', '⇔')
    s = s.replace('\\mid', '∣').replace('\\vert', '∣')
    s = s.replace('\\sum', '∑').replace('\\prod', '∏').replace('\\int', '∫')
    s = s.replace('\\partial', '∂').replace('\\nabla', '∇').replace('\\sqrt', '√')
    s = s.replace('\\equiv', '≡').replace('\\ll', '≪').replace('\\gg', '≫')
    s = s.replace('\\propto', '∝').replace('\\emptyset', '∅').replace('\\perp', '⊥')
    s = s.replace('\\wedge', '∧').replace('\\vee', '∨').replace('\\neg', '¬')
    s = s.replace('\\land', '∧').replace('\\lor', '∨').replace('\\lnot', '¬')
    # Greek
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
    # Text/operator commands
    s = re.sub(r'\\(?:text|mathrm|textbf|mathbf|mathbb|operatorname|textrm)\{([^}]*)\}', r'\1', s)
    # Custom probability/stats commands
    s = re.sub(r'\\(?:prob|P|Pr)\{([^}]*)\}', r'P[\1]', s)
    s = re.sub(r'\\(?:prob|P|Pr)\[([^\]]*)\]', r'P[\1]', s)
    s = re.sub(r'\\geom\{([^}]*)\}', r'Geom(\1)', s)
    s = re.sub(r'\\(?:exponential)\{([^}]*)\}', r'Exp(\1)', s)
    s = re.sub(r'\\(?:ev|E)\{([^}]*)\}', r'E[\1]', s)
    s = re.sub(r'\\(?:var|Var)\{([^}]*)\}', r'Var(\1)', s)
    s = re.sub(r'\\(?:E|Exp)\[([^\]]*)\]', r'E[\1]', s)
    s = re.sub(r'\\(?:Var)\[([^\]]*)\]', r'Var[\1]', s)
    s = re.sub(r'\\(?:Cov)\[([^\]]*)\]', r'Cov[\1]', s)
    s = re.sub(r'\\(?:Cov)\{([^}]*)\}', r'Cov(\1)', s)
    # Fractions
    s = re.sub(r'\\d?frac\{([^}]*)\}\{([^}]*)\}', r'\1/\2', s)
    # Binom
    s = re.sub(r'\\(?:binom|dbinom)\{([^}]*)\}\{([^}]*)\}', r'(\1,\2)', s)
    # Decorators
    s = re.sub(r'\\(?:overline|underline|hat|bar|tilde|vec|widehat)\{([^}]*)\}', r'\1', s)
    # Function names (keep as text)
    s = re.sub(r'\\(ln|log|sin|cos|tan|exp|max|min|lim|sup|inf|det|gcd|Pr|Var|Cov|var)\b', r'\1', s)
    # \displaystyle and other layout commands - just remove
    s = re.sub(r'\\(?:displaystyle|textstyle|scriptstyle|left|right|big|Big|bigg|Bigg)\b', '', s)
    # Remaining commands
    s = re.sub(r'\\[a-zA-Z]+', '', s)
    # Strip formatting braces, ^, _, \ (NOT literal braces)
    s = re.sub(r'[{}^_\\]', '', s)
    # Restore literal braces
    s = s.replace('\x01', '{').replace('\x02', '}')
    # Remove spaces and newlines
    s = s.replace(' ', '').replace('\n', '')
    return s


def find_source_in_text(text, compact, pos, latex):
    """Find the compact source in text starting from pos.
    Returns (start_idx, end_idx) or (-1, -1).
    """
    if not compact:
        return -1, -1

    # Generate variants to search for
    variants = [compact]
    v2 = compact.replace('-', UNICODE_MINUS)
    if v2 != compact:
        variants.append(v2)
    v3 = compact.replace("'", PRIME)
    if v3 != compact:
        variants.append(v3)
    v4 = compact.replace('-', UNICODE_MINUS).replace("'", PRIME)
    if v4 not in variants:
        variants.append(v4)

    # Strategy 1: exact match for each variant
    for var in variants:
        search_pos = pos
        attempts = 0
        while attempts < 30:
            attempts += 1
            idx = text.find(var, search_pos)
            if idx == -1:
                break
            if idx - pos > 2000:
                break
            if is_valid_source_match(text, idx, idx + len(var), compact, pos):
                return idx, idx + len(var)
            search_pos = idx + 1

    # Strategy 2: regex with optional spaces/ZWS between chars
    if len(compact) >= 2:
        for var in variants:
            regex = build_flexible_regex(var)
            if regex:
                attempts = 0
                for m in regex.finditer(text, pos):
                    attempts += 1
                    if attempts > 10:
                        break
                    if m.start() - pos > 2000:
                        break
                    if is_valid_source_match(text, m.start(), m.end(), compact, pos):
                        return m.start(), m.end()
                    if len(compact) > 5:
                        break

    # Strategy 3: for complex expressions, find anchor substring
    if len(compact) > 8:
        result = find_by_anchor(text, compact, pos, variants)
        if result:
            return result

    return -1, -1


def build_flexible_regex(compact):
    """Build regex allowing optional spaces/ZWS between characters."""
    parts = []
    for ch in compact:
        parts.append(re.escape(ch))
    spacer = '[ \u200b]*'
    pattern = spacer.join(parts)
    try:
        return re.compile(pattern)
    except re.error:
        return None


def find_by_anchor(text, compact, pos, variants):
    """For complex expressions, find a long substring anchor and expand."""
    best = None
    for var in variants:
        for length in range(min(len(var), 15), 4, -1):
            for start in range(len(var) - length + 1):
                substr = var[start:start + length]
                idx = text.find(substr, pos)
                if idx != -1 and idx - pos < 2000:
                    if best is None or length > best[2]:
                        best = (idx, idx + len(substr), length)
                    break
            if best and best[2] >= 8:
                break
        if best and best[2] >= 8:
            break

    if best is None or best[2] < 5:
        return None

    anchor_start, anchor_end, _ = best

    # Expand to full source block
    block_start = anchor_start
    while block_start > pos:
        ch = text[block_start - 1]
        if ch == ' ' or ch == ZWS:
            if block_start - 2 >= pos and is_source_char(text[block_start - 2]):
                block_start -= 1
            else:
                break
        elif is_source_char(ch):
            block_start -= 1
        else:
            break

    block_end = anchor_end
    while block_end < len(text):
        ch = text[block_end]
        if ch == ZWS:
            block_end += 1
            break
        elif ch == ' ':
            if block_end + 1 < len(text) and (is_source_char(text[block_end + 1]) or text[block_end + 1] == ZWS):
                block_end += 1
            else:
                break
        elif is_source_char(ch):
            block_end += 1
        else:
            break

    return block_start, block_end


def is_source_char(ch):
    """Check if character could be part of a compact source expression."""
    if ch.isalnum():
        return True
    if is_math_symbol(ch):
        return True
    if ch in '()[]{}|/,.:;+-=!$<>' + UNICODE_MINUS + PRIME:
        return True
    return False


def is_valid_source_match(text, start, end, compact, pos):
    """Check if the matched source is valid (not inside a regular word)."""
    stripped = compact.replace(UNICODE_MINUS, '-').replace(PRIME, "'")

    # Single letter: strict boundary + unicode italic before
    if len(stripped) == 1 and stripped.isalpha():
        before_ok = (start <= pos or
                    text[start-1] == ' ' or
                    is_math_unicode(text[start-1]) or
                    is_math_symbol(text[start-1]) or
                    text[start-1] in '([$\u200b' + PRIME)
        after_ok = (end >= len(text) or
                   text[end] == ' ' or
                   text[end] in '.,;:!?)]=+\u200b<>' or
                   is_math_unicode(text[end]) or
                   is_math_symbol(text[end]))
        if not (before_ok and after_ok):
            return False

        expected_unicode = None
        c = ord(stripped)
        if 97 <= c <= 122:
            expected_unicode = chr(0x1D44E + (c - 97))
        elif 65 <= c <= 90:
            expected_unicode = chr(0x1D434 + (c - 65))
        if expected_unicode:
            lookback = text[max(pos, start-5):start]
            if expected_unicode not in lookback:
                return False
        return True

    # Short digit patterns: check duplication
    if len(stripped) <= 2 and stripped.isdigit():
        if start > pos and (is_math_unicode(text[start-1]) or is_math_symbol(text[start-1]) or text[start-1] == ZWS):
            return True
        check_start = start - len(stripped) - 1
        if check_start >= pos:
            before = text[check_start:start]
            if before.rstrip(ZWS).rstrip() == stripped or before == stripped + ' ':
                return True
        if start > 0 and text[start-1] == ' ':
            pre = text[max(pos, start-len(stripped)-2):start-1]
            if pre.endswith(stripped):
                return True
        return False

    # Longer patterns: ensure not inside a normal word
    if start > 0 and text[start-1].isalpha() and not is_math_unicode(text[start-1]) and not is_math_symbol(text[start-1]) and text[start-1] != '$':
        if compact[0].isalpha() and compact[0].islower():
            return False
    if end < len(text) and text[end].isalpha() and not is_math_unicode(text[end]) and text[end] not in ' \u200b':
        if compact[-1].isalpha() and compact[-1] not in ')}]':
            return False

    return True


def find_rendered_block_start(text, source_start, pos):
    """Scan backward from source_start to find where the rendered unicode block begins."""
    if source_start <= pos:
        return source_start

    i = source_start - 1
    if i < pos or text[i] != ' ':
        return source_start

    i -= 1
    if i < pos:
        return source_start

    def is_rendered_content(ch):
        if is_math_unicode(ch):
            return True
        if is_math_symbol(ch):
            return True
        if ch in '0123456789':
            return True
        if ch in '()[]{}|/,.:;+-=!$<>\'>':
            return True
        if ch == UNICODE_MINUS:
            return True
        if ch == ZWS:
            return True
        if ch == PRIME:
            return True
        if ch == '\u2061':
            return True
        return False

    while i >= pos:
        ch = text[i]
        if ch == ' ':
            if i > pos and is_rendered_content(text[i-1]):
                i -= 1
            else:
                break
        elif is_rendered_content(ch):
            i -= 1
        else:
            break

    rendered_start = i + 1

    # Extend backward through function-name-like words and math content
    extended = True
    while extended and rendered_start > pos:
        extended = False
        k = rendered_start - 1
        if k < pos:
            break
        
        if text[k] == ' ':
            k -= 1
            if k < pos:
                break
        elif text[k].isalpha():
            pass
        else:
            break
        
        word_end = k + 1
        while k >= pos and (text[k].isalpha() or is_rendered_content(text[k])):
            k -= 1
        word_start = k + 1
        word = text[word_start:word_end]
        
        if not word:
            break
        
        word_has_math = any(is_math_unicode(c) or is_math_symbol(c) for c in word)
        word_has_rendered = any(is_rendered_content(c) for c in word) and len(word) <= 3
        word_stripped = ''.join(c for c in word if c.isalpha())
        is_func = word_stripped.lower() in ('min', 'max', 'lim', 'sup', 'inf', 'var',
                                            'cov', 'exp', 'log', 'ln', 'sin', 'cos',
                                            'tan', 'det', 'gcd', 'geom')
        
        if word_has_math or is_func or word_has_rendered:
            rendered_start = word_start
            extended = True
        else:
            break

    # Validate: the full region must contain at least one math unicode char or symbol
    region = text[rendered_start:source_start]
    has_math = any(is_math_unicode(c) or is_math_symbol(c) for c in region)

    if has_math:
        return rendered_start
    else:
        return source_start


def process_text(raw_text, latex_parts, title=None):
    """Process raw text to replace duplicated math with $latex$."""
    if not raw_text:
        return ''

    text = strip_difficulty(raw_text)

    if title:
        for pfx in [
            title + ' Easy ', title + ' Medium ', title + ' Hard ', title + ' Extreme ',
            title + ' Easy', title + ' Medium', title + ' Hard', title + ' Extreme',
        ]:
            if text.startswith(pfx):
                text = text[len(pfx):].lstrip()
                break

    if not latex_parts:
        return clean_final(text)

    result_parts = []
    pos = 0

    for latex in latex_parts:
        if not latex or not latex.strip():
            continue

        compact = latex_to_compact(latex)
        if not compact:
            continue

        idx, match_end = find_source_in_text(text, compact, pos, latex)
        if idx == -1:
            continue

        # Find where the rendered block starts
        block_start = find_rendered_block_start(text, idx, pos)

        # For simple duplications like "3 3" or "′ ′" with no unicode before
        if block_start == idx:
            source_text = text[idx:match_end]
            source_stripped = source_text.replace(' ', '').replace(ZWS, '')
            slen = len(source_stripped)
            if slen <= 5:
                # Check if same content appears right before (separated by space)
                check_start = idx - slen - 1
                if check_start >= pos:
                    before = text[check_start:idx]
                    before_stripped = before.replace(ZWS, '')
                    if before_stripped == source_stripped + ' ' or before_stripped.rstrip() == source_stripped:
                        block_start = check_start
                # Also check: maybe we matched the RENDERED copy and the SOURCE is after
                # e.g., "′ ′" - we matched first ′ but should use second ′ as source
                if block_start == idx and match_end + slen + 1 <= len(text):
                    after_region = text[match_end:match_end + slen + 2]
                    after_stripped = after_region.lstrip(' ' + ZWS)
                    if after_stripped.startswith(source_stripped):
                        # The current match is the rendered, the next is the source
                        block_start = idx
                        new_source_start = text.find(source_stripped, match_end)
                        if new_source_start != -1 and new_source_start - match_end <= 3:
                            match_end = new_source_start + len(source_stripped)
                            # Keep block_start as-is (covers the rendered copy)

        if block_start < pos:
            block_start = idx

        # Consume trailing ZWS + optional space
        end = match_end
        if end < len(text) and text[end] == ' ':
            if end + 1 < len(text) and text[end+1] == ZWS:
                end += 2
        if end < len(text) and text[end] == ZWS:
            end += 1
            if end < len(text) and text[end] == ' ':
                end += 1

        result_parts.append(text[pos:block_start])
        result_parts.append(f'${latex}$')
        pos = end

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

        if ch == '\u2061':
            i += 1
            continue

        if ch == '\ue020':
            chars.append('≠')
            i += 1
            continue

        # Convert leftover unicode minus to regular minus
        if ch == UNICODE_MINUS:
            chars.append('-')
            i += 1
            continue

        # Convert leftover prime to apostrophe
        if ch == PRIME:
            chars.append("'")
            i += 1
            continue

        chars.append(ch)
        i += 1

    result = ''.join(chars)
    result = re.sub(r'  +', ' ', result)
    result = re.sub(r' ([.,;:!?])', r'\1', result)
    # Fix spacing: add space between word/closing-paren and opening $
    result = re.sub(r'([a-zA-Z0-9)\]])\$([^$])', r'\1 $\2', result)
    # Fix spacing: add space between closing $ and word/opening-paren
    result = re.sub(r'([^$\\])\$([a-zA-Z0-9(])', r'\1$ \2', result)
    result = re.sub(r'  +', ' ', result)
    return result.strip()


def main():
    with open(INPUT_PATH, 'r') as f:
        data = json.load(f)

    print(f"Processing {len(data)} questions...")

    output = []
    for rec in data:
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
    print(f"Written {len(output)} questions to {OUTPUT_PATH}")
    print(f"File size: {size_kb:.1f} KB")

    # Show samples for review
    for q in output[:8]:
        print(f"\n=== {q['title']} ({q['difficulty']}) ===")
        print(f"Problem: {q['problem'][:350]}")
        print(f"Solution: {q['solution'][:350]}")


if __name__ == '__main__':
    main()
