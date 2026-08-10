#!/usr/bin/env python3
"""
Clean batch-4.json: replace doubled math (unicode-rendered + ASCII source)
with proper $latex$ notation using the ordered LaTeX arrays.

Strategy:
1. Convert each LaTeX to a "skeleton" (stripped of spaces/ZWS/formatting)
2. Build a space-normalized index of the raw text to find skeleton matches
3. Once found, walk backward from the match to capture the rendered unicode block
4. Replace the entire rendered+source block with $latex$
"""
import json
import re
import os

INPUT_PATH = '/Users/thomaskidane/Documents/Projects/portfolio2/tmp-batches/batch-4.json'
OUTPUT_PATH = '/Users/thomaskidane/Documents/Projects/portfolio2/tmp-batches/batch-4-clean.json'

UNICODE_MINUS = '\u2212'
ZWS = '\u200b'


def is_math_unicode(ch):
    code = ord(ch)
    return 0x1D400 <= code <= 0x1D7FF


def is_math_symbol(ch):
    return ch in '≤≥≠∼≈±∞…⋯×⋅∩∪∈∉⊂⊆∀∃→←⇒⇐⟺⟹∣∑∏∫∂∇√⋃⋂παβγδεελμσθφωρτχψηζνξκΓΔΣΩΦΘΛΠ\u2212\ue020'


def strip_difficulty(text):
    return re.sub(r'^(Easy|Medium|Hard|Extreme)\s+', '', text)


def latex_to_skeleton(latex):
    """
    Convert LaTeX to a normalized skeleton for searching in raw text.
    This skeleton ignores spaces/ZWS and matches the core characters.
    """
    s = latex
    s = s.replace('\\{', '\x00LB\x00').replace('\\}', '\x00RB\x00')
    s = s.replace('\\$', '$')
    # Operators to unicode (as they appear in raw text)
    s = s.replace('\\leq', '≤').replace('\\geq', '≥').replace('\\neq', '≠')
    s = s.replace('\\le', '≤').replace('\\ge', '≥').replace('\\ne', '≠')
    s = s.replace('\\sim', '∼').replace('\\approx', '≈').replace('\\pm', '±')
    s = s.replace('\\infty', '∞').replace('\\ldots', '…').replace('\\cdots', '⋯')
    s = s.replace('\\times', '×').replace('\\cdot', '⋅').replace('\\circ', '∘')
    s = s.replace('\\cap', '∩').replace('\\cup', '∪').replace('\\bigcup', '⋃').replace('\\bigcap', '⋂')
    s = s.replace('\\in', '∈').replace('\\notin', '∉')
    s = s.replace('\\subset', '⊂').replace('\\subseteq', '⊆')
    s = s.replace('\\forall', '∀').replace('\\exists', '∃')
    s = s.replace('\\rightarrow', '→').replace('\\leftarrow', '←')
    s = s.replace('\\Rightarrow', '⇒').replace('\\Leftarrow', '⇐')
    s = s.replace('\\iff', '⟺')
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
    s = s.replace('\\dots', '…')
    # Custom commands with arguments -> Name(arg1,arg2)
    s = re.sub(r'\\(?:unif|Unif)\{([^}]*)\}\{([^}]*)\}', r'Unif(\1,\2)', s)
    s = re.sub(r'\\(?:binomial|Binomial)\{([^}]*)\}\{([^}]*)\}', r'Binom(\1,\2)', s)
    s = re.sub(r'\\(?:corr|Corr)\{([^}]*)\}\{([^}]*)\}', r'Corr(\1,\2)', s)
    s = re.sub(r'\\(?:cov|Cov)\{([^}]*)\}\{([^}]*)\}', r'Cov(\1,\2)', s)
    s = re.sub(r'\\(?:var|Var)\{([^}]*)\}', r'Var(\1)', s)
    # \textcolor{color}{content} -> just content
    s = re.sub(r'\\textcolor\{[^}]*\}\{([^}]*)\}', r'\1', s)
    # Text commands
    s = re.sub(r'\\(?:text|mathrm|textbf|mathbf|mathbb|operatorname|textrm)\{([^}]*)\}', r'\1', s)
    # Fractions
    s = re.sub(r'\\d?frac\{([^}]*)\}\{([^}]*)\}', r'\1/\2', s)
    # Binom notation
    s = re.sub(r'\\(?:binom|dbinom)\{([^}]*)\}\{([^}]*)\}', r'(\1,\2)', s)
    # Decorators
    s = re.sub(r'\\(?:overline|underline|hat|bar|tilde|vec|widehat)\{([^}]*)\}', r'\1', s)
    # Function names
    s = re.sub(r'\\(ln|log|sin|cos|tan|exp|max|min|lim|sup|inf|det|gcd|Pr|prob|Var|Cov|E|P)\b', r'\1', s)
    # \ev{...} and \prob{...} -> content
    s = re.sub(r'\\ev\{([^}]*)\}', r'\1', s)
    s = re.sub(r'\\prob\{([^}]*)\}', r'\1', s)
    # Display/sizing commands
    s = re.sub(r'\\(?:left|right|displaystyle|textstyle|scriptstyle|big|Big|bigg|Bigg)', '', s)
    # Remaining commands - remove
    s = re.sub(r'\\[a-zA-Z]+', '', s)
    # Remove formatting characters (but keep literal braces)
    s = s.replace('^', '').replace('_', '').replace('\\', '')
    # Remove grouping braces: { and } that are NOT part of literal content
    s = s.replace('{', '').replace('}', '')
    # Restore literal braces from placeholders
    s = s.replace('\x00LB\x00', '{').replace('\x00RB\x00', '}')
    # Remove all whitespace and ZWS
    s = s.replace(' ', '').replace(ZWS, '').replace('\u200b', '')
    return s


def normalize_for_search(text):
    """Strip spaces, ZWS, and zero-width chars from text for skeleton matching."""
    return re.sub(r'[\s\u200b\u200c\u200d\u200e\u200f\ufeff]+', '', text)


def build_position_map(text):
    """
    Build a map from normalized positions back to original positions.
    Returns (normalized_text, pos_map) where pos_map[norm_idx] = original_idx.
    """
    norm_chars = []
    pos_map = []
    for i, ch in enumerate(text):
        if ch in ' \t\n\r\u200b\u200c\u200d\u200e\u200f\ufeff':
            continue
        norm_chars.append(ch)
        pos_map.append(i)
    return ''.join(norm_chars), pos_map


def find_compact_source(text, skeleton, search_from, norm_text, pos_map, is_short_match=False):
    """
    Find where the compact ASCII source is in text, using normalized skeleton matching.
    Returns (source_start, source_end) in original text coordinates, or (-1, -1).
    
    For short matches (single digits/letters), looks for doubled patterns where
    the skeleton appears twice consecutively in normalized text.
    """
    if not skeleton:
        return -1, -1

    # Find the normalized position corresponding to search_from
    norm_start = 0
    for ni, orig_pos in enumerate(pos_map):
        if orig_pos >= search_from:
            norm_start = ni
            break
    else:
        norm_start = len(pos_map)

    ni = -1
    used_skeleton = skeleton

    if is_short_match:
        # For short matches (digits/short numbers), look for doubled pattern
        doubled = skeleton + skeleton
        for variant in _skeleton_variants(doubled):
            ni = norm_text.find(variant, norm_start)
            if ni != -1:
                # Point to the second occurrence (the source copy)
                ni += len(skeleton)
                used_skeleton = skeleton
                break
        if ni == -1:
            # Fall back to finding it after math unicode content
            for variant in _skeleton_variants(skeleton):
                ni = norm_text.find(variant, norm_start)
                if ni != -1:
                    used_skeleton = variant
                    break
    else:
        # Search in normalized text - try multiple variants
        for variant in _skeleton_variants(skeleton):
            ni = norm_text.find(variant, norm_start)
            if ni != -1:
                used_skeleton = variant
                break
        
        # If found, check if this is the rendered copy (has spaces in original)
        # If so, look for the next occurrence (the compact source)
        if ni != -1 and len(used_skeleton) >= 4:
            orig_start = pos_map[ni]
            orig_end_ni = ni + len(used_skeleton) - 1
            if orig_end_ni < len(pos_map):
                orig_end = pos_map[orig_end_ni] + 1
                span = text[orig_start:orig_end]
                # If the matched span has significantly more chars than the skeleton
                # (indicating spaces are present), it's the rendered copy
                if len(span) > len(used_skeleton) * 1.5:
                    # Look for the next occurrence
                    next_ni = norm_text.find(used_skeleton, ni + len(used_skeleton))
                    if next_ni != -1:
                        ni = next_ni

    if ni == -1:
        return -1, -1

    # Map back to original positions
    orig_start = pos_map[ni]
    orig_end_ni = ni + len(used_skeleton) - 1
    if orig_end_ni >= len(pos_map):
        return -1, -1
    orig_end = pos_map[orig_end_ni] + 1

    # Extend orig_end to include any trailing spaces/ZWS that are part of the compact block
    while orig_end < len(text) and text[orig_end] in ' \u200b':
        orig_end += 1

    return orig_start, orig_end


def _skeleton_variants(skeleton):
    """Generate search variants for a skeleton (different ellipsis, minus, etc.)."""
    variants = [skeleton]
    # Try unicode minus
    if '-' in skeleton:
        variants.append(skeleton.replace('-', UNICODE_MINUS))
    # Try centered dots (⋯) instead of regular dots (…)
    if '…' in skeleton:
        variants.append(skeleton.replace('…', '⋯'))
        if '-' in skeleton:
            variants.append(skeleton.replace('…', '⋯').replace('-', UNICODE_MINUS))
    # Try private-use ≠ variant: \ue020 followed by = instead of ≠
    if '≠' in skeleton:
        variants.append(skeleton.replace('≠', '\ue020='))
        if '-' in skeleton:
            variants.append(skeleton.replace('≠', '\ue020=').replace('-', UNICODE_MINUS))
    return variants


def find_rendered_block_start(text, source_start, pos):
    """
    Scan backward from source_start to find where the unicode rendered block begins.
    The rendered block is the spaced-out unicode rendering preceding the compact source.
    
    Key distinguishing features of rendered blocks vs normal text:
    - Contains unicode math italic chars (U+1D400-1D7FF)
    - Characters are often space-separated (single char, space, single char)
    - May contain ASCII letters for function names (Unif, Var) but these are
      interspersed with math symbols/chars
    """
    if source_start <= pos:
        return source_start

    i = source_start - 1
    if i < pos or text[i] != ' ':
        return source_start

    i -= 1
    if i < pos:
        return source_start

    def is_basic_rendered(ch):
        """Characters that can appear in rendered math blocks."""
        if is_math_unicode(ch):
            return True
        if is_math_symbol(ch):
            return True
        if ch in '0123456789':
            return True
        if ch in '()[]{}|/,.:;+-=':
            return True
        if ch == UNICODE_MINUS or ch == ZWS:
            return True
        if ch.isalpha() and ord(ch) < 128:
            return True
        return False

    # Walk backward, but track whether we're seeing actual math content
    consecutive_ascii = 0

    while i >= pos:
        ch = text[i]
        if ch == ' ':
            # After passing through ASCII letters, check if this forms a valid math word
            if consecutive_ascii >= 2:
                # We just walked backward through a multi-letter ASCII word
                # Check if this word is a short function name preceded by math
                word_start = i + 1
                word_end = word_start + consecutive_ascii
                word_len = consecutive_ascii
                if word_len >= 5:
                    break  # Too long - definitely an English word
                # Check what comes before this space (before the word)
                check_j = i - 1
                while check_j >= pos and text[check_j] == ' ':
                    check_j -= 1
                if check_j >= pos and (is_math_unicode(text[check_j]) or is_math_symbol(text[check_j]) or text[check_j] in '0123456789()[]{}'):
                    # This word is preceded by math content - it's a function name
                    consecutive_ascii = 0
                    i -= 1
                    continue
                else:
                    break  # Not preceded by math - stop here
            consecutive_ascii = 0
            if i > pos:
                prev = text[i-1]
                if is_math_unicode(prev) or is_math_symbol(prev) or prev in '0123456789()[]{}|/,.:;+-=<>!\'\"\u200b' or prev == UNICODE_MINUS or prev == ZWS:
                    i -= 1
                elif prev.isalpha() and ord(prev) < 128:
                    # ASCII letter before space - peek at the word length
                    j = i - 1
                    word_len = 0
                    while j >= pos and text[j].isalpha() and ord(text[j]) < 128:
                        j -= 1
                        word_len += 1
                    if word_len <= 1:
                        i -= 1
                    elif word_len <= 4:
                        check_j = j
                        while check_j >= pos and text[check_j] == ' ':
                            check_j -= 1
                        if check_j >= pos and (is_math_unicode(text[check_j]) or is_math_symbol(text[check_j]) or text[check_j] in '()[]{}'):
                            i -= 1
                        else:
                            break
                    else:
                        break
                else:
                    break
            else:
                break
        elif is_math_unicode(ch) or is_math_symbol(ch):
            consecutive_ascii = 0
            i -= 1
        elif ch in '0123456789()[]{}|/,.:;+-=<>!\'\"' or ch == UNICODE_MINUS or ch == ZWS:
            consecutive_ascii = 0
            i -= 1
        elif ch.isalpha() and ord(ch) < 128:
            consecutive_ascii += 1
            i -= 1
        else:
            break

    rendered_start = i + 1

    # Verify: must contain at least one unicode math char
    region = text[rendered_start:source_start]
    has_math = any(is_math_unicode(c) or is_math_symbol(c) for c in region)

    if not has_math:
        return source_start

    # Trim leading English words that aren't part of math rendering
    # Walk forward past pure-ASCII words at the beginning
    while rendered_start < source_start:
        # Find end of current "word" (non-space run)
        word_end = rendered_start
        while word_end < source_start and text[word_end] != ' ':
            word_end += 1

        word = text[rendered_start:word_end]
        # If this word is all ASCII letters (3+) and the rest doesn't start with math soon
        if len(word) >= 3 and word.isalpha() and all(ord(c) < 128 for c in word):
            # Check if any math char in this word or next few chars
            lookahead = text[rendered_start:min(word_end + 5, source_start)]
            if not any(is_math_unicode(c) or is_math_symbol(c) for c in lookahead):
                # Skip this word
                rendered_start = word_end
                while rendered_start < source_start and text[rendered_start] == ' ':
                    rendered_start += 1
                continue
        break

    return rendered_start


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

    # Build normalized search index
    norm_text, pos_map = build_position_map(text)

    result_parts = []
    pos = 0

    for latex in latex_parts:
        if not latex or not latex.strip():
            continue

        skeleton = latex_to_skeleton(latex)
        if not skeleton:
            continue

        # Determine if this is a short match that might appear doubled
        # (rendered + source are the same characters, just different spacing)
        is_short = (len(skeleton) <= 3 and 
                   (skeleton.isdigit() or 
                    all(c.isdigit() or c in '-\u2212' for c in skeleton)))

        source_start, source_end = find_compact_source(
            text, skeleton, pos, norm_text, pos_map, is_short_match=is_short
        )

        if source_start == -1 or source_start - pos > 800:
            continue

        # Validate single-character matches
        if len(skeleton) == 1 and skeleton.isalpha():
            # For single letters, verify the match is preceded by its unicode math equivalent
            expected_unicode = None
            c = ord(skeleton)
            if 97 <= c <= 122:
                expected_unicode = chr(0x1D44E + (c - 97))
            elif 65 <= c <= 90:
                expected_unicode = chr(0x1D434 + (c - 65))
            if expected_unicode:
                lookback = text[max(pos, source_start-5):source_start]
                if expected_unicode not in lookback:
                    # Try finding next occurrence
                    # Re-search from after this position
                    retry_start = source_end
                    found_valid = False
                    for _ in range(20):
                        s2, e2 = find_compact_source(
                            text, skeleton, retry_start, norm_text, pos_map, is_short_match=False
                        )
                        if s2 == -1 or s2 - pos > 800:
                            break
                        lb = text[max(pos, s2-5):s2]
                        if expected_unicode in lb:
                            source_start, source_end = s2, e2
                            found_valid = True
                            break
                        retry_start = e2
                    if not found_valid:
                        continue

        # Validate short numeric matches - check for duplication pattern
        elif len(skeleton) <= 2 and skeleton.isdigit():
            # For digits, the "rendered" form is the same as source (no unicode math)
            # Look for the duplication pattern "N N" or "NN" where N=skeleton
            # The source we found should be the SECOND occurrence in the pair
            before_region = text[max(pos, source_start - len(skeleton) - 2):source_start]
            before_stripped = before_region.replace(' ', '')
            if skeleton in before_stripped:
                pass  # Good - doubled digits
            elif any(is_math_unicode(c) or is_math_symbol(c) for c in before_region):
                pass  # Part of a larger math expression
            else:
                continue

        # Find where the rendered (unicode) block starts
        block_start = find_rendered_block_start(text, source_start, pos)

        # For simple duplications like "3 3"
        if block_start == source_start and len(skeleton) <= 3:
            check_start = source_start - len(skeleton) - 1
            if check_start >= pos and normalize_for_search(text[check_start:source_start]) == skeleton:
                block_start = check_start

        if block_start < pos:
            block_start = source_start

        before_text = text[pos:block_start]
        result_parts.append(before_text)
        result_parts.append(f'${latex}$')
        pos = source_end

    result_parts.append(text[pos:])
    result = ''.join(result_parts)
    return clean_final(result)


def clean_final(text):
    """Remove leftover unicode math chars, zero-width chars, and clean spacing."""
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
    # Fix spacing around dollar signs
    result = re.sub(r'(\w)\$', r'\1 $', result)
    result = re.sub(r'\$(\w)', r'$ \1', result)
    # Remove doubled $$ (from adjacent LaTeX expressions)
    result = result.replace('$$', '$ $')
    result = re.sub(r'  +', ' ', result)
    return result.strip()


def main():
    with open(INPUT_PATH, 'r') as f:
        data = json.load(f)

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
    size_kb = os.path.getsize(OUTPUT_PATH) / 1024
    print(f"Output size: {size_kb:.1f} KB")

    # Show samples
    for q in output[:5]:
        print(f"\n=== {q['title']} ({q['difficulty']}) ===")
        print(f"Problem: {q['problem'][:300]}")
        print(f"Solution: {q['solution'][:300]}")


if __name__ == '__main__':
    main()
