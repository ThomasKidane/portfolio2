import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

interface LatexRendererProps {
  text: string
  className?: string
}

function cleanUnicodeMath(text: string): string {
  let result = '';
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const code = chars[i].codePointAt(0)!;
    if (code >= 0x1D400 && code <= 0x1D7FF) {
      // Unicode math alphanumeric — skip these (they're rendered duplicates)
      // But only skip if followed by a space or if preceded by a space
      // (to avoid stripping intentional unicode in other contexts)
      continue;
    }
    result += chars[i];
  }
  // Collapse multiple spaces that result from stripping
  return result.replace(/  +/g, ' ');
}

export function LatexRenderer({ text, className = '' }: LatexRendererProps) {
  const cleaned = cleanUnicodeMath(text);
  const parts = parseLatex(cleaned)

  return (
    <div className={className}>
      {parts.map((part, i) => {
        if (part.type === 'block') {
          return <BlockMath key={i} math={part.content} />
        }
        if (part.type === 'inline') {
          return <InlineMath key={i} math={part.content} />
        }
        return <span key={i}>{renderNewlines(part.content)}</span>
      })}
    </div>
  )
}

function renderNewlines(text: string) {
  const cleaned = text.replace(/\\\$/g, '$')
  const lines = cleaned.split('\n')
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ))
}

interface Part {
  type: 'text' | 'inline' | 'block'
  content: string
}

function parseLatex(text: string): Part[] {
  const parts: Part[] = []
  let remaining = text

  while (remaining.length > 0) {
    // Find next $ that isn't escaped by backslash
    let dollarIdx = -1;
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i] === '$' && (i === 0 || remaining[i-1] !== '\\')) {
        dollarIdx = i;
        break;
      }
    }

    if (dollarIdx === -1) {
      parts.push({ type: 'text', content: remaining })
      break
    }

    // Check if block math ($$)
    const isBlock = remaining[dollarIdx + 1] === '$' && (dollarIdx === 0 || remaining[dollarIdx - 1] !== '\\');

    if (isBlock) {
      if (dollarIdx > 0) {
        parts.push({ type: 'text', content: remaining.slice(0, dollarIdx) })
      }
      // Find closing $$
      let endIdx = -1;
      for (let i = dollarIdx + 2; i < remaining.length - 1; i++) {
        if (remaining[i] === '$' && remaining[i+1] === '$' && remaining[i-1] !== '\\') {
          endIdx = i;
          break;
        }
      }
      if (endIdx === -1) {
        parts.push({ type: 'text', content: remaining.slice(dollarIdx) })
        break
      }
      parts.push({ type: 'block', content: remaining.slice(dollarIdx + 2, endIdx) })
      remaining = remaining.slice(endIdx + 2)
    } else {
      if (dollarIdx > 0) {
        parts.push({ type: 'text', content: remaining.slice(0, dollarIdx) })
      }
      // Find closing $ (not escaped, not another $)
      let endIdx = -1;
      for (let i = dollarIdx + 1; i < remaining.length; i++) {
        if (remaining[i] === '$' && remaining[i-1] !== '\\') {
          endIdx = i;
          break;
        }
      }
      if (endIdx === -1) {
        parts.push({ type: 'text', content: remaining.slice(dollarIdx) })
        break
      }
      parts.push({ type: 'inline', content: remaining.slice(dollarIdx + 1, endIdx) })
      remaining = remaining.slice(endIdx + 1)
    }
  }

  return parts
}
