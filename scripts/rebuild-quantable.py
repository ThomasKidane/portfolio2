#!/usr/bin/env python3
"""Rebuild quantable-questions.json with proper LaTeX rendering and playlist data."""
import json
import re
import os
import unicodedata

SCRAPED_DIR = 'scraped-questions'
PLAYLISTS_PATH = '/Users/thomaskidane/Documents/Courses/CS/learncpp/quantable-extension/scraped-questions/playlists.json'
OUTPUT_PATH = 'public/quantable-questions.json'

# Map LaTeX commands to their unicode rendered equivalents
LATEX_TO_UNICODE = {
    '\\rightarrow': '→',
    '\\leftarrow': '←',
    '\\Rightarrow': '⇒',
    '\\Leftarrow': '⇐',
    '\\leq': '≤',
    '\\geq': '≥',
    '\\neq': '≠',
    '\\times': '×',
    '\\cdot': '⋅',
    '\\infty': '∞',
    '\\pi': 'π',
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\delta': 'δ',
    '\\epsilon': 'ε',
    '\\lambda': 'λ',
    '\\mu': 'μ',
    '\\sigma': 'σ',
    '\\theta': 'θ',
    '\\phi': 'φ',
    '\\omega': 'ω',
    '\\sum': 'Σ',
    '\\prod': 'Π',
    '\\int': '∫',
    '\\cap': '∩',
    '\\cup': '∪',
    '\\subset': '⊂',
    '\\subseteq': '⊆',
    '\\in': '∈',
    '\\notin': '∉',
    '\\forall': '∀',
    '\\exists': '∃',
    '\\pm': '±',
    '\\approx': '≈',
    '\\sim': '∼',
    '\\equiv': '≡',
    '\\ldots': '…',
    '\\cdots': '⋯',
    '\\vdots': '⋮',
}

# Unicode math italic codepoints
def to_math_italic(ch):
    """Convert ASCII letter to math italic unicode."""
    c = ord(ch)
    if 97 <= c <= 122:  # lowercase
        return chr(0x1D44E + (c - 97))
    if 65 <= c <= 90:  # uppercase
        return chr(0x1D434 + (c - 65))
    return ch

def latex_to_rendered(latex):
    """Convert LaTeX to what the browser renders (unicode chars, spaced out)."""
    s = latex
    # Handle \$ (literal dollar)
    s = s.replace('\\$', '$')
    # Handle fractions
    s = re.sub(r'\\d?frac\{([^}]*)\}\{([^}]*)\}', r'\1/\2', s)
    # Handle sqrt
    s = re.sub(r'\\sqrt\{([^}]*)\}', r'√\1', s)
    # Handle binom
    s = re.sub(r'\\binom\{([^}]*)\}\{([^}]*)\}', r'(\1,\2)', s)
    # Handle text/mathrm
    s = re.sub(r'\\(?:text|mathrm|mathbb)\{([^}]*)\}', r'\1', s)
    # Handle overline
    s = re.sub(r'\\overline\{([^}]*)\}', r'\1', s)
    # Handle named commands
    for cmd, uni in LATEX_TO_UNICODE.items():
        s = s.replace(cmd, uni)
    # Handle remaining commands like \ln, \log, \sin, \cos, etc.
    s = re.sub(r'\\(ln|log|sin|cos|tan|exp|max|min|lim|sup|inf|det|gcd|Pr|prob)\b', r'\1', s)
    # Strip remaining backslash commands
    s = re.sub(r'\\[a-zA-Z]+', '', s)
    # Strip braces, ^, _
    s = re.sub(r'[{}^_]', '', s)
    # Clean spaces
    s = re.sub(r'\s+', '', s)
    return s

def find_footprint(text, pos, latex):
    """
    Find the 'footprint' of a LaTeX expression in the text starting at pos.
    The footprint is: [rendered version with spaces] [source version compact]
    Returns (start, end) of the footprint, or None if not found.
    """
    rendered = latex_to_rendered(latex)
    if not rendered:
        return None
    
    # For single letters, only match "𝑥 x" pattern (unicode italic + ASCII)
    if len(rendered) == 1 and rendered.isalpha():
        unicode_ch = to_math_italic(rendered)
        pair = unicode_ch + ' ' + rendered
        idx = text.find(pair, pos)
        if idx != -1 and idx < pos + 150:
            # Verify word boundary: char before should be space/punct, char after should be space/punct
            before_ok = (idx == 0 or not text[idx-1].isalpha())
            after_idx = idx + len(pair)
            after_ok = (after_idx >= len(text) or not text[after_idx].isalpha())
            if before_ok and after_ok:
                return (idx, after_idx)
        return None
    
    # Strategy 1: Simple doubled "X X" for numbers/simple expressions
    doubled = rendered + ' ' + rendered
    idx = text.find(doubled, pos)
    if idx != -1 and idx < pos + 200:
        return (idx, idx + len(doubled))
    
    # Strategy 2: Spaced rendered + compact source (digits stay grouped)
    parts = tokenize_for_spacing(rendered)
    spaced = ' '.join(parts) if len(parts) > 1 else rendered
    pattern_a = spaced + ' ' + rendered
    idx = text.find(pattern_a, pos)
    if idx != -1 and idx < pos + 200:
        return (idx, idx + len(pattern_a))
    
    # Strategy 3: Unicode italic version + ASCII version
    unicode_rendered = ''.join(
        to_math_italic(ch) if ch.isalpha() else ('\u2212' if ch == '-' else ('\U0001D70B' if ch == 'π' else ch))
        for ch in rendered
    )
    if len(rendered) >= 2:
        # Spaced unicode (digits grouped) + compact ascii
        unicode_parts = tokenize_for_spacing(unicode_rendered)
        unicode_spaced = ' '.join(unicode_parts)
        
        pattern_b = unicode_spaced + ' ' + rendered
        idx = text.find(pattern_b, pos)
        if idx != -1 and idx < pos + 300:
            return (idx, idx + len(pattern_b))
        
        # Spaced unicode + spaced ascii
        ascii_parts = tokenize_for_spacing(rendered)
        spaced_rendered = ' '.join(ascii_parts)
        pattern_c = unicode_spaced + ' ' + spaced_rendered
        idx = text.find(pattern_c, pos)
        if idx != -1 and idx < pos + 300:
            return (idx, idx + len(pattern_c))
    
    # Strategy 4: Arrow/symbol commands — look for the doubled unicode symbol
    for cmd, sym in LATEX_TO_UNICODE.items():
        if latex.strip() == cmd.lstrip('\\') or latex.strip() == cmd:
            doubled_sym = sym + ' ' + sym
            idx = text.find(doubled_sym, pos)
            if idx != -1 and idx < pos + 100:
                return (idx, idx + len(doubled_sym))
    
    # Strategy 5: For expressions with unicode minus (6- becomes 6−)
    rendered_with_unicode_minus = rendered.replace('-', '−')
    if rendered_with_unicode_minus != rendered:
        doubled2 = rendered_with_unicode_minus + ' ' + rendered_with_unicode_minus
        idx = text.find(doubled2, pos)
        if idx != -1 and idx < pos + 200:
            return (idx, idx + len(doubled2))
        # Spaced + compact
        parts2 = tokenize_for_spacing(rendered_with_unicode_minus)
        spaced2 = ' '.join(parts2)
        pattern_d = spaced2 + ' ' + rendered_with_unicode_minus
        idx = text.find(pattern_d, pos)
        if idx != -1 and idx < pos + 200:
            return (idx, idx + len(pattern_d))
    
    # Strategy 6: Just find doubled at boundary (but not inside words)
    idx = text.find(rendered, pos)
    if idx != -1 and idx < pos + 100:
        before_ok = (idx == 0 or text[idx-1] in ' ,;:.!?()[]{}/')
        after_idx = idx + len(rendered)
        after_ok = (after_idx >= len(text) or text[after_idx] in ' ,;:.!?()[]{}/')
        if before_ok and after_ok:
            return (idx, after_idx)
    
    return None


def tokenize_for_spacing(s):
    """Split string into tokens keeping digit runs together."""
    parts = []
    i = 0
    chars = list(s)
    while i < len(chars):
        if chars[i].isdigit():
            num = ''
            while i < len(chars) and chars[i].isdigit():
                num += chars[i]
                i += 1
            parts.append(num)
        else:
            parts.append(chars[i])
            i += 1
    return parts


def clean_text(text, latex_parts, title=None):
    """Process text to replace doubled math expressions with $latex$."""
    if not text:
        return ''
    
    cleaned = text
    
    # Strip difficulty prefix
    cleaned = re.sub(r'^(Easy|Medium|Hard|Extreme)\s+', '', cleaned)
    
    # Strip title + difficulty prefix (for solutions)
    if title:
        for d in ['Easy', 'Medium', 'Hard', 'Extreme']:
            prefix = title + ' ' + d + ' '
            if cleaned.startswith(prefix):
                cleaned = cleaned[len(prefix):]
                break
            prefix2 = title + ' ' + d
            if cleaned.startswith(prefix2):
                cleaned = cleaned[len(prefix2):].lstrip()
                break
    
    if not latex_parts:
        return clean_unicode(cleaned)
    
    # Process each latex expression in order
    result = ''
    pos = 0
    
    for latex in latex_parts:
        if not latex or not latex.strip():
            continue
        
        footprint = find_footprint(cleaned, pos, latex)
        
        if footprint:
            start, end = footprint
            # Add text before this footprint
            result += cleaned[pos:start]
            # Add the LaTeX replacement
            result += f'${latex}$'
            pos = end
        # If not found, skip (don't insert arbitrary LaTeX)
    
    # Add remaining text
    result += cleaned[pos:]
    
    return clean_unicode(result)


def clean_unicode(text):
    """Remove leftover unicode math chars and clean up."""
    # Remove unicode math alphanumeric symbols (U+1D400-U+1D7FF)
    result = ''
    for ch in text:
        code = ord(ch)
        if 0x1D400 <= code <= 0x1D7FF:
            continue
        result += ch
    # Remove zero-width chars
    result = re.sub(r'[\u200B-\u200F\uFEFF]', '', result)
    # Collapse spaces
    result = re.sub(r'  +', ' ', result)
    return result.strip()


def main():
    difficulties = ['easy', 'medium', 'hard', 'extreme']
    all_records = []
    
    for diff in difficulties:
        path = os.path.join(SCRAPED_DIR, f'{diff}.json')
        data = json.load(open(path))
        
        for rec in data['records']:
            problem = clean_text(rec['problem'], rec.get('problemLatex', []))
            solution = clean_text(rec['solution'], rec.get('solutionLatex', []), rec['title'])
            
            all_records.append({
                'id': f"q-{rec['id']}",
                'title': rec['title'],
                'difficulty': rec['difficulty'],
                'url': rec['url'],
                'problem': problem,
                'solution': solution,
                'hasHint': bool(rec.get('hint', '').strip()),
                'hint': rec.get('hint', ''),
            })
    
    # Load playlists
    playlists = []
    if os.path.exists(PLAYLISTS_PATH):
        pdata = json.load(open(PLAYLISTS_PATH))
        for pl in pdata['playlists']:
            playlists.append({
                'id': pl['id'],
                'name': pl['name'],
                'url': pl['url'],
                'questions': [q['title'] for q in pl['questions']],
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
    
    # Verify samples
    samples = ['See All Sides V', 'Dog Collision', 'No 6, No Pay', 'Stoplight Switch II', 'Dollar Draw', 'Blue Square', 'Same Arc']
    for title in samples:
        q = next((x for x in all_records if x['title'] == title), None)
        if q:
            print(f"\n=== {title} ===")
            print(f"Problem: {q['problem'][:300]}")
            print(f"Solution: {q['solution'][:200]}")


if __name__ == '__main__':
    main()
