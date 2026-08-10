#!/usr/bin/env python3
"""
Rebuild quantable-questions.json - v3.
Core insight: The raw text has pattern [unicode_spaced_rendered] [compact_ascii_source]
for each LaTeX expression. The problemLatex array gives us the exact LaTeX in order.

Strategy:
1. Walk through the text sequentially 
2. For each LaTeX expression, find where the unicode rendering starts and the
   compact source ends
3. Replace the entire block with $latex$
"""
import json
import re
import os
import sys

SCRAPED_DIR = 'scraped-questions'
PLAYLISTS_PATH = '/Users/thomaskidane/Documents/Courses/CS/learncpp/quantable-extension/scraped-questions/playlists.json'
OUTPUT_PATH = 'public/quantable-questions.json'

UNICODE_MINUS = '\u2212'


def is_math_unicode(ch):
    """Check if char is a unicode math alphanumeric symbol."""
    code = ord(ch)
    return 0x1D400 <= code <= 0x1D7FF


def is_math_symbol(ch):
    """Check if char is a rendered math symbol (not letter/digit)."""
    return ch in '≤≥≠∼≈±∞…⋯×⋅∩∪∈∉⊂⊆∀∃→←⇒⇐∣∑∏∫∂∇√παβγδεελμσθφωρτχψηζνξκΓΔΣΩΦΘΛΠ\u2212\ue020'


def strip_difficulty(text):
    return re.sub(r'^(Easy|Medium|Hard|Extreme)\s+', '', text)


def latex_to_compact_ascii(latex):
    """
    Convert LaTeX to what the compact ASCII source looks like in the text.
    This is the version WITHOUT unicode math italic chars, but WITH unicode operators.
    """
    s = latex
    s = s.replace('\\$', '$')
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
    s = s.replace('\\mid', '∣').replace('\\vert', '∣')
    s = s.replace('\\sum', '∑').replace('\\prod', '∏').replace('\\int', '∫')
    s = s.replace('\\partial', '∂').replace('\\nabla', '∇').replace('\\sqrt', '√')
    # Greek letters
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
    # Fractions
    s = re.sub(r'\\d?frac\{([^}]*)\}\{([^}]*)\}', r'\1/\2', s)
    # Binom
    s = re.sub(r'\\(?:binom|dbinom)\{([^}]*)\}\{([^}]*)\}', r'(\1,\2)', s)
    # Decorators
    s = re.sub(r'\\(?:overline|underline|hat|bar|tilde|vec|widehat)\{([^}]*)\}', r'\1', s)
    # Function names
    s = re.sub(r'\\(ln|log|sin|cos|tan|exp|max|min|lim|sup|inf|det|gcd|Pr|prob|Var|Cov|E|P)\b', r'\1', s)
    # Remaining commands
    s = re.sub(r'\\[a-zA-Z]+', '', s)
    # Strip formatting chars
    s = re.sub(r'[{}^_\\]', '', s)
    # Remove spaces
    s = s.replace(' ', '')
    return s


def find_rendered_block_start(text, source_start):
    """
    Given where the compact source starts, scan backward to find where
    the rendered (unicode) version begins.
    
    The rendered version consists of:
    - Unicode math italic characters (U+1D400-U+1D7FF)  
    - Math operator symbols (≤, ≥, ∼, etc.)
    - Digits and basic punctuation (when surrounded by math context)
    - Spaces between tokens
    """
    if source_start == 0:
        return source_start
    
    # The space (or spaces) immediately before the compact source
    i = source_start - 1
    if i < 0 or text[i] != ' ':
        return source_start
    
    # Skip the space between rendered and source
    i -= 1
    if i < 0:
        return source_start
    
    # Now we should be in the rendered block. Walk backward through it.
    # Rendered block characters: unicode math, math symbols, digits, punctuation, spaces
    def is_rendered_content(ch):
        if is_math_unicode(ch):
            return True
        if is_math_symbol(ch):
            return True
        if ch in '0123456789':
            return True
        if ch in '()[]|/,.:;+-=':
            return True
        if ch == UNICODE_MINUS:
            return True
        return False
    
    # Walk backward through the rendered block
    while i >= 0:
        ch = text[i]
        if ch == ' ':
            # Space is ok if preceded by rendered content
            if i > 0 and is_rendered_content(text[i-1]):
                i -= 1
            else:
                break
        elif is_rendered_content(ch):
            i -= 1
        else:
            break
    
    rendered_start = i + 1
    
    # Verify: the region text[rendered_start:source_start] should contain
    # at least one unicode math char or math symbol to be a valid rendered block
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
        
        # Find compact source in text from current position
        # We need to find it at a boundary (not inside a word)
        search_start = pos
        idx = -1
        
        while True:
            idx = text.find(compact, search_start)
            if idx == -1:
                # Try with unicode minus
                alt_compact = compact.replace('-', UNICODE_MINUS)
                if alt_compact != compact:
                    idx = text.find(alt_compact, search_start)
                    if idx != -1:
                        compact = alt_compact
                break
            
            # Verify this is at a valid boundary (not inside a word)
            # For single-letter matches, be very strict
            if len(compact) == 1 and compact.isalpha():
                # Must be preceded by space/unicode-math/start AND followed by space/punct/end/unicode-math
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
                
                # Additionally: for single letters, they must be preceded by their
                # unicode math italic equivalent (the "rendered" version)
                # Check if there's the unicode italic version nearby before
                expected_unicode = None
                c = ord(compact)
                if 97 <= c <= 122:  # lowercase
                    expected_unicode = chr(0x1D44E + (c - 97))
                elif 65 <= c <= 90:  # uppercase
                    expected_unicode = chr(0x1D434 + (c - 65))
                
                if expected_unicode:
                    # Look back: should find the unicode char within a few chars
                    lookback = text[max(0, idx-3):idx]
                    if expected_unicode not in lookback:
                        # Not a rendered+source pair, skip
                        search_start = idx + 1
                        continue
            
            # For short number matches (1-2 digits), verify duplication
            elif len(compact) <= 2 and compact.isdigit():
                # Pattern should be "N N" (number space number)
                before_check = text[max(0, idx-len(compact)-1):idx]
                if before_check == compact + ' ' or before_check.endswith(compact + ' '):
                    pass  # Good, it's a duplication
                elif idx > 0 and (is_math_unicode(text[idx-1]) or is_math_symbol(text[idx-1])):
                    pass  # Preceded by unicode math (part of rendered block)
                else:
                    # Not clearly a duplication, check if preceded by space + same digits
                    if not (idx >= len(compact) + 1 and 
                            text[idx-1] == ' ' and 
                            text[idx-len(compact)-1:idx-1] == compact):
                        search_start = idx + 1
                        continue
            
            break
        
        if idx == -1 or idx - pos > 800:
            continue
        
        # Find where the rendered block starts (before the compact source)
        block_start = find_rendered_block_start(text, idx)
        
        # For simple duplications like "3 3" where no unicode is present
        if block_start == idx and len(compact) <= 3:
            # Check for simple "X X" pattern
            check_start = idx - len(compact) - 1
            if check_start >= pos and text[check_start:idx] == compact + ' ':
                block_start = check_start
        
        # Ensure we don't go before already processed text
        if block_start < pos:
            block_start = idx
        
        block_end = idx + len(compact)
        
        # Add text before block
        before_text = text[pos:block_start]
        result_parts.append(before_text)
        
        # Add $latex$
        result_parts.append(f'${latex}$')
        pos = block_end
    
    # Add remaining text
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
        
        # Skip unicode math alphanumeric
        if 0x1D400 <= code <= 0x1D7FF:
            # Also skip trailing space if the next non-space char is normal text
            i += 1
            # Skip a single trailing space that was between unicode and ascii
            if i < len(text) and text[i] == ' ':
                i += 1
            continue
        
        # Skip zero-width chars
        if ch in '\u200B\u200C\u200D\u200E\u200F\uFEFF':
            i += 1
            continue
        
        # Replace private-use \ue020 with ≠
        if ch == '\ue020':
            chars.append('≠')
            i += 1
            continue
        
        chars.append(ch)
        i += 1
    
    result = ''.join(chars)
    # Collapse multiple spaces
    result = re.sub(r'  +', ' ', result)
    # Fix space before punctuation
    result = re.sub(r' ([.,;:!?])', r'\1', result)
    # Trim spaces around $ (but ensure word boundary)
    # $latex$ should have space before if preceded by letter, space after if followed by letter
    result = re.sub(r'(\w)\$', r'\1 $', result)
    result = re.sub(r'\$(\w)', r'$ \1', result)
    # But don't double-space
    result = re.sub(r'  +', ' ', result)
    
    return result.strip()


def main():
    difficulties = ['easy', 'medium', 'hard', 'extreme']
    all_records = []
    
    for diff in difficulties:
        path = os.path.join(SCRAPED_DIR, f'{diff}.json')
        if not os.path.exists(path):
            continue
        data = json.load(open(path))
        
        for rec in data['records']:
            problem = process_text(
                rec.get('problem', ''),
                rec.get('problemLatex', [])
            )
            solution = process_text(
                rec.get('solution', ''),
                rec.get('solutionLatex', []),
                title=rec.get('title')
            )
            
            all_records.append({
                'id': f"q-{rec['id']}",
                'title': rec['title'],
                'difficulty': rec.get('difficulty', diff),
                'url': rec.get('url', ''),
                'problem': problem,
                'solution': solution,
                'characteristics': rec.get('relatedTopics', []),
                'hasHint': bool(rec.get('hint', '').strip()),
                'hint': rec.get('hint', ''),
            })
    
    # Load playlists
    playlists = []
    if os.path.exists(PLAYLISTS_PATH):
        pdata = json.load(open(PLAYLISTS_PATH))
        for pl in pdata.get('playlists', []):
            playlists.append({
                'id': pl['id'],
                'name': pl['name'],
                'url': pl.get('url', ''),
                'questions': [q['title'] for q in pl.get('questions', [])],
            })
    
    output = {
        'count': len(all_records),
        'questions': all_records,
        'playlists': playlists,
    }
    
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(output, f)
    
    size_mb = os.path.getsize(OUTPUT_PATH) / 1024 / 1024
    print(f"Written {len(all_records)} questions, {len(playlists)} playlists")
    print(f"File size: {size_mb:.2f} MB")
    
    # Show samples
    samples = ['Class Game', 'Family Independence', 'Biggie Cheese Diff',
               'Quartic Normal II', 'Mike Oxlong', 'Particle Reach IV',
               'Unchanged Wheat', 'Absolute Value Normal II', 'Gamma Function']
    for title in samples:
        q = next((x for x in all_records if x['title'] == title), None)
        if q:
            print(f"\n=== {title} ===")
            print(f"Problem: {q['problem'][:400]}")


if __name__ == '__main__':
    main()
