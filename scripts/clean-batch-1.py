#!/usr/bin/env python3
"""
Clean batch-1.json: replace doubled math expressions with proper $latex$ notation.

Each LaTeX expression appears doubled in raw text:
  First copy: spaced out (spaces between tokens), letters as math italic unicode
  Second copy: compact ASCII form, immediately after first copy

Strategy: build a regex that matches BOTH copies together.
For the first copy, allow optional spaces between characters and letters as unicode.
For the second copy, match the compact form exactly.
"""

import json
import re

INPUT_PATH = "/Users/thomaskidane/Documents/Projects/portfolio2/tmp-batches/batch-1.json"
OUTPUT_PATH = "/Users/thomaskidane/Documents/Projects/portfolio2/tmp-batches/batch-1-clean.json"

DIFFICULTY_PREFIXES = ["Extreme ", "Hard ", "Medium ", "Easy "]
MATH_UNICODE_RE = re.compile(r'[\U0001D400-\U0001D7FF\u210E]')
ZWS = '\u200b'


def latex_to_compact(latex):
    """Convert LaTeX to its compact form as it appears in the raw text (2nd copy)."""
    text = latex

    symbol_map = [
        ('\\thicksim', '∼'), ('\\sim', '∼'),
        ('\\cdot', '⋅'), ('\\times', '×'),
        ('\\pm', '±'), ('\\mp', '∓'),
        ('\\neq', '≠'), ('\\ne', '≠'),
        ('\\leq', '≤'), ('\\le', '≤'),
        ('\\geq', '≥'), ('\\ge', '≥'),
        ('\\infty', '∞'),
        ('\\iff', '⟺'), ('\\implies', '⟹'),
        ('\\Rightarrow', '⇒'), ('\\Leftarrow', '⇐'),
        ('\\rightarrow', '→'), ('\\to', '→'),
        ('\\leftarrow', '←'), ('\\mapsto', '↦'),
        ('\\ldots', '…'), ('\\cdots', '⋯'), ('\\vdots', '⋮'), ('\\dots', '\x04'),
        ('\\in', '∈'), ('\\notin', '∉'),
        ('\\subseteq', '⊆'), ('\\subset', '⊂'),
        ('\\supseteq', '⊇'), ('\\supset', '⊃'),
        ('\\cup', '∪'), ('\\cap', '∩'),
        ('\\emptyset', '∅'), ('\\varnothing', '∅'),
        ('\\neg', '¬'), ('\\lnot', '¬'),
        ('\\forall', '∀'), ('\\exists', '∃'),
        ('\\nmid', '∤'), ('\\mid', '∣'),
        ('\\sum', '∑'), ('\\prod', '∏'), ('\\int', '∫'),
        ('\\partial', '∂'), ('\\nabla', '∇'),
        ('\\approx', '≈'), ('\\equiv', '≡'),
        ('\\perp', '⊥'), ('\\parallel', '∥'),
        ('\\angle', '∠'),
        ('\\varepsilon', 'ε'), ('\\epsilon', 'ε'),
        ('\\varphi', 'φ'), ('\\phi', 'ϕ'),
        ('\\vartheta', 'ϑ'), ('\\theta', 'θ'),
        ('\\alpha', 'α'), ('\\beta', 'β'),
        ('\\gamma', 'γ'), ('\\delta', 'δ'),
        ('\\zeta', 'ζ'), ('\\eta', 'η'),
        ('\\iota', 'ι'), ('\\kappa', 'κ'),
        ('\\lambda', 'λ'), ('\\mu', 'μ'),
        ('\\nu', 'ν'), ('\\xi', 'ξ'),
        ('\\pi', 'π'), ('\\rho', 'ρ'),
        ('\\sigma', 'σ'), ('\\tau', 'τ'),
        ('\\upsilon', 'υ'), ('\\chi', 'χ'),
        ('\\psi', 'ψ'), ('\\omega', 'ω'),
        ('\\Gamma', 'Γ'), ('\\Delta', 'Δ'),
        ('\\Theta', 'Θ'), ('\\Lambda', 'Λ'),
        ('\\Xi', 'Ξ'), ('\\Pi', 'Π'),
        ('\\Sigma', 'Σ'), ('\\Phi', 'Φ'),
        ('\\Psi', 'Ψ'), ('\\Omega', 'Ω'),
        ('\\displaystyle', ''), ('\\textstyle', ''),
        ('\\,', ''), ('\\;', ''), ('\\!', ''), ('\\:', ''),
        ('\\ ', ' '),
        ('\\quad', ' '), ('\\qquad', '  '),
        ('\\left', ''), ('\\right', ''),
        ('\\bigg', ''), ('\\Bigg', ''), ('\\big', ''), ('\\Big', ''),
    ]

    for old, new in symbol_map:
        text = text.replace(old, new)

    text = re.sub(r'\\(?:norm|unif)\{([^{}]*)\}\{([^{}]*)\}', r'(\1,\2)', text)
    text = re.sub(r'\\binomial\{([^{}]*)\}\{([^{}]*)\}', r'Binom(\1,\2)', text)
    text = re.sub(r'\\prob\{([^{}]*)\}', r'P[\1]', text)
    text = re.sub(r'\\prob\[([^\]]*)\]', r'P[\1]', text)
    text = re.sub(r'\\ev\{([^{}]*)\}', r'E[\1]', text)
    text = re.sub(r'\\ev\[([^\]]*)\]', r'E[\1]', text)
    text = re.sub(r'\\(?:Var|Cov|var|cov)\[([^\]]*)\]', r'\1', text)
    text = re.sub(r'\\(?:Var|Cov|var|cov)\{([^{}]*)\}', r'\1', text)
    text = re.sub(r'\\(?:text|mathrm|mathbf|mathbb|mathcal|operatorname|boldsymbol)\{([^{}]*)\}', r'\1', text)
    text = re.sub(r'\\(?:overline|underline|hat|tilde|bar|vec|widehat|widetilde)\{([^{}]*)\}', r'\1', text)
    text = re.sub(r'\\sqrt\[([^\]]*)\]\{([^{}]*)\}', r'\1√\2', text)
    text = re.sub(r'\\sqrt\{([^{}]*)\}', r'√\1', text)
    text = re.sub(r'\\(?:d?frac|tfrac)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}',
                  lambda m: m.group(2) + '\x01' + m.group(1) + '\x01' + ZWS, text)
    text = re.sub(r'\\(?:d?binom|dbinom)\{([^{}]*)\}\{([^{}]*)\}', r'(\1,\2)', text)
    text = re.sub(r'\\mathbb\{([^{}]*)\}', r'\1', text)
    # Handle escaped braces - convert to placeholders that survive sub/super handling
    text = text.replace('\\{', '\x02')
    text = text.replace('\\}', '\x03')
    text = re.sub(r'\\[a-zA-Z]+\s*', '', text)
    text = re.sub(r'\\[^a-zA-Z]', '', text)

    # Handle sub/superscripts - use \x01 as sentinel for subscript/superscript spaces
    SUBSEP = '\x01'
    result = []
    i = 0
    while i < len(text):
        if text[i] == '_' and i + 1 < len(text):
            if text[i+1] == '{':
                depth = 1
                j = i + 2
                while j < len(text) and depth > 0:
                    if text[j] == '{': depth += 1
                    elif text[j] == '}': depth -= 1
                    j += 1
                result.append(SUBSEP)
                result.append(text[i+2:j-1])
                result.append(ZWS)
                i = j
            elif i + 1 < len(text):
                result.append(SUBSEP)
                result.append(text[i+1])
                result.append(ZWS)
                i += 2
            else:
                i += 1
        elif text[i] == '^' and i + 1 < len(text):
            if text[i+1] == '{':
                depth = 1
                j = i + 2
                while j < len(text) and depth > 0:
                    if text[j] == '{': depth += 1
                    elif text[j] == '}': depth -= 1
                    j += 1
                result.append(SUBSEP)
                result.append(text[i+2:j-1])
                i = j
            elif i + 1 < len(text):
                result.append(SUBSEP)
                result.append(text[i+1])
                i += 2
            else:
                i += 1
        elif text[i] in '{}':
            i += 1
        else:
            result.append(text[i])
            i += 1

    text = ''.join(result)
    # Remove all regular spaces (from LaTeX token separation)
    text = text.replace(' ', '')
    # Restore subscript/superscript spaces
    text = text.replace(SUBSEP, ' ')
    # Restore literal braces
    text = text.replace('\x02', '{')
    text = text.replace('\x03', '}')
    return text.strip()


def build_doubled_pattern(compact):
    """
    Build regex matching the full doubled pattern (first copy + second copy).
    
    First copy: same content as compact, but
      - Each character separated by optional whitespace (\s*)
      - ASCII letters can appear as math unicode equivalents (U+1D400-1D7FF)
    Second copy: compact form exactly (chars together)
    
    Between first and second: mandatory whitespace (\s+)
    """
    if not compact:
        return None

    # Tokenize compact into characters for the first copy pattern
    first_char_patterns = []
    for ch in compact:
        if ch == ZWS:
            first_char_patterns.append(('zws', r'[\u200b\u200c\u200d]'))
        elif ch == ' ':
            first_char_patterns.append(('space', r'[\s\u200b]'))
        elif ch == '\x04':
            # \dots placeholder - matches either … or ⋯
            first_char_patterns.append(('symbol', r'[…⋯]'))
        elif ch.isalpha() and ch.isascii():
            # Match either the ASCII letter or its math unicode equivalent
            first_char_patterns.append(('letter', f'[{re.escape(ch)}\U0001D400-\U0001D7FF\u210E]'))
        elif ch.isdigit():
            first_char_patterns.append(('digit', re.escape(ch)))
        else:
            first_char_patterns.append(('symbol', re.escape(ch)))

    # Build first copy pattern: chars with mandatory spaces between different-type groups
    # Consecutive same-type chars (word letters, digits) stay together
    # Each symbol is treated as its own group (never grouped with adjacent symbols)
    first_parts = []
    i = 0
    while i < len(first_char_patterns):
        tag, pat = first_char_patterns[i]
        
        if tag == 'space':
            first_parts.append(r'[\s\u200b]+')
            i += 1
        elif tag == 'zws':
            first_parts.append(r'[\u200b\u200c\u200d]?')
            i += 1
        elif tag in ('letter', 'digit'):
            # Collect consecutive same-type characters (words/numbers stay together)
            group = [pat]
            j = i + 1
            while j < len(first_char_patterns) and first_char_patterns[j][0] == tag:
                group.append(first_char_patterns[j][1])
                j += 1
            first_parts.append(''.join(group))
            # Mandatory space before next non-space/zws group
            if j < len(first_char_patterns) and first_char_patterns[j][0] not in ('space', 'zws'):
                first_parts.append(r'[\s\u200b]+')
            i = j
        else:
            # Symbol: each symbol is its own group
            first_parts.append(pat)
            i += 1
            # Mandatory space before next non-space/zws group
            if i < len(first_char_patterns) and first_char_patterns[i][0] not in ('space', 'zws'):
                first_parts.append(r'[\s\u200b]+')


    first_regex = ''.join(first_parts)

    # Build second copy pattern: compact form with optional spaces around operators
    # The actual compact text may have spaces around =, near ZWS (fraction boundaries)
    second_parts = []
    for ch in compact:
        if ch == ZWS:
            second_parts.append(r'[\s\u200b]*[\u200b\u200c\u200d][\s\u200b]*')
        elif ch == ' ':
            second_parts.append(r'[\s\u200b]+')
        elif ch == '\x04':
            second_parts.append(r'[…⋯]')
        elif ch in '=≤≥∼≈≡<>+':
            # Allow optional space before/after comparison and arithmetic operators
            second_parts.append(r'[\s\u200b]*' + re.escape(ch) + r'[\s\u200b]*')
        else:
            second_parts.append(re.escape(ch))
    second_regex = ''.join(second_parts)

    # Full pattern: first + mandatory space + second
    full = first_regex + r'[\s\u200b]+' + second_regex

    try:
        return re.compile(full)
    except re.error:
        return None


def build_compact_only_regex(compact):
    """Build regex matching just the compact version with flexible spacing."""
    if not compact:
        return None
    parts = []
    for ch in compact:
        if ch == ZWS:
            parts.append(r'[\s\u200b]*[\u200b\u200c\u200d][\s\u200b]*')
        elif ch == ' ':
            parts.append(r'[\s\u200b]+')
        elif ch == '\x04':
            parts.append(r'[…⋯]')
        elif ch in '=≤≥∼≈≡<>+':
            parts.append(r'[\s\u200b]*' + re.escape(ch) + r'[\s\u200b]*')
        else:
            parts.append(re.escape(ch))
    try:
        return re.compile(''.join(parts))
    except re.error:
        return None


def find_and_replace(text, latex_expr, search_offset):
    """Find doubled pattern and replace with $latex$."""
    compact = latex_to_compact(latex_expr)
    if not compact:
        return None, search_offset

    replacement = f"${latex_expr}$"

    # Try the full doubled pattern
    doubled_re = build_doubled_pattern(compact)
    if doubled_re:
        match = doubled_re.search(text, search_offset)
        if match:
            start, end = match.start(), match.end()
            if _check_boundary(text, latex_expr, start, end):
                return text[:start] + replacement + text[end:], start + len(replacement)

    # Fallback: find compact and consume unicode prefix
    compact_re = build_compact_only_regex(compact)
    if not compact_re:
        return None, search_offset

    match = compact_re.search(text, search_offset)
    if not match:
        return None, search_offset

    start, end = match.start(), match.end()

    # Look backwards for math unicode prefix
    i = start - 1
    while i >= 0 and text[i] in ' \t\u200b\u200c\u200d\u2009':
        i -= 1

    found_math = False
    while i >= max(0, start - len(compact) * 5):
        ch = text[i]
        cp = ord(ch)
        if (0x1D400 <= cp <= 0x1D7FF) or cp == 0x210E:
            found_math = True
            i -= 1
        elif ch in ' \t\u200b\u200c\u200d\u2009':
            i -= 1
        elif ch in '∼≤≥⋅×±∓≠∞⟺⟹…⋯∑∏∫√−+/=!|^_\u2212·,.:;[]()':
            i -= 1
        elif ch.isdigit():
            i -= 1
        elif ch.isalpha() and cp < 128 and found_math:
            # Only include if not part of a regular English word
            if i > 0 and text[i-1].isalpha() and ord(text[i-1]) < 128:
                break
            i -= 1
        else:
            break

    actual_start = (i + 1) if found_math else start
    
    # If no math unicode prefix found, check if there's a "spaced" version prefix
    # (for purely numeric/symbolic expressions where no unicode math is used)
    if not found_math and len(compact.replace(ZWS, '')) > 2:
        # Look for a region before the compact match that contains the same chars spread out
        # Heuristic: check if the char at the start of compact appears right before with spaces
        clean = compact.replace(ZWS, '').replace(' ', '')
        if clean and start > 0:
            # Walk backwards looking for spaced-out content with matching first char
            look_start = max(0, start - len(clean) * 3)
            before_region = text[look_start:start]
            # Check if the first few chars of compact appear in sequence in the before region
            first_chars = clean[:min(3, len(clean))]
            # Find last occurrence of these chars (spaced) before the compact match
            spaced_pat = r'[\s\u200b]*'.join(re.escape(c) for c in first_chars)
            spaced_matches = list(re.finditer(spaced_pat, before_region))
            if spaced_matches:
                # Found spaced version - consume from there
                candidate_start = look_start + spaced_matches[-1].start()
                # Verify it looks like a spaced version (has spaces between chars)
                candidate_region = text[candidate_start:start]
                if ' ' in candidate_region and len(candidate_region) > len(clean):
                    actual_start = candidate_start

    if _check_boundary(text, latex_expr, actual_start, end):
        return text[:actual_start] + replacement + text[end:], actual_start + len(replacement)
    
    return None, end


def _check_boundary(text, latex_expr, start, end):
    """Word boundary check for single-letter expressions."""
    stripped = latex_expr.strip()
    if len(stripped) == 1 and stripped.isalpha():
        before = text[start - 1] if start > 0 else ' '
        after = text[end] if end < len(text) else ' '
        if before.isalnum() or after.isalnum():
            return False
    return True


def clean_text(raw_text, latex_array):
    """Replace all doubled math patterns with $latex$."""
    if not raw_text or not latex_array:
        return raw_text or ""

    text = raw_text
    offset = 0

    for latex_expr in latex_array:
        result, new_offset = find_and_replace(text, latex_expr, offset)
        if result is not None:
            text = result
            offset = new_offset

    # Cleanup
    text = MATH_UNICODE_RE.sub('', text)
    text = re.sub(r'[\u200b\u200c\u200d\u2009]+', '', text)
    text = re.sub(r'  +', ' ', text)
    text = re.sub(r' ([.,;:!?])', r'\1', text)
    # Fix dollar sign spacing
    text = re.sub(r'\$ +', '$', text)
    text = re.sub(r' +\$', ' $', text)
    # Ensure spacing between math and text
    text = re.sub(r'\$([^$]+)\$([a-zA-Z])', r'$\1$ \2', text)
    text = re.sub(r'([a-zA-Z])\$([^$]+)\$', r'\1 $\2$', text)
    # Add space between adjacent inline math expressions ($...$$ ...$)
    text = re.sub(r'\$\$', '$ $', text)

    return text.strip()


def strip_prefix(text, title, difficulty):
    """Strip difficulty prefix and title from raw text."""
    for prefix in DIFFICULTY_PREFIXES:
        if text.startswith(prefix):
            text = text[len(prefix):]
            break

    if title and text.startswith(title + " "):
        text = text[len(title) + 1:]
        for prefix in DIFFICULTY_PREFIXES:
            if text.startswith(prefix):
                text = text[len(prefix):]
                break
    elif title and text.startswith(title):
        text = text[len(title):]
        for prefix in DIFFICULTY_PREFIXES:
            if text.lstrip().startswith(prefix):
                text = text.lstrip()[len(prefix):]
                break

    return text.strip()


def process_question(q):
    title = q.get("title", "")
    difficulty = q.get("difficulty", "")

    problem_raw = q.get("problem_raw", "")
    problem_latex = q.get("problemLatex", [])
    problem_text = strip_prefix(problem_raw, title, difficulty)
    problem_clean = clean_text(problem_text, problem_latex)

    solution_raw = q.get("solution_raw", "")
    solution_latex = q.get("solutionLatex", [])
    solution_text = strip_prefix(solution_raw, title, difficulty)
    solution_clean = clean_text(solution_text, solution_latex)

    return {
        "id": q["id"],
        "title": title,
        "difficulty": difficulty,
        "url": q.get("url", ""),
        "problem": problem_clean,
        "solution": solution_clean,
        "characteristics": q.get("characteristics", ""),
        "hasHint": q.get("hasHint", False),
        "hint": q.get("hint", "")
    }


def main():
    with open(INPUT_PATH, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"Processing {len(questions)} questions...")

    results = []
    errors = []
    for i, q in enumerate(questions):
        try:
            cleaned = process_question(q)
            results.append(cleaned)
        except Exception as e:
            errors.append((i, q.get('id', '?'), str(e)))
            import traceback
            traceback.print_exc()
            results.append({
                "id": q["id"],
                "title": q.get("title", ""),
                "difficulty": q.get("difficulty", ""),
                "url": q.get("url", ""),
                "problem": q.get("problem_raw", ""),
                "solution": q.get("solution_raw", ""),
                "characteristics": q.get("characteristics", ""),
                "hasHint": q.get("hasHint", False),
                "hint": q.get("hint", "")
            })

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"Done! Wrote {len(results)} questions to {OUTPUT_PATH}")
    if errors:
        print(f"\n{len(errors)} errors:")
        for idx, qid, err in errors[:10]:
            print(f"  [{idx}] {qid}: {err}")

    print("\n=== VERIFICATION ===")
    for r in results[:10]:
        print(f"\n[{r['id']}] {r['title']}")
        print(f"  P: {r['problem'][:300]}")
        print(f"  S: {r['solution'][:300]}")


if __name__ == "__main__":
    main()
