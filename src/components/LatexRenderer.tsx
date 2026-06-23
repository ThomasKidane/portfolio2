import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

interface LatexRendererProps {
  text: string
  className?: string
}

export function LatexRenderer({ text, className = '' }: LatexRendererProps) {
  const parts = parseLatex(text)

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
  const lines = text.split('\n')
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
    const blockIdx = remaining.indexOf('$$')
    const inlineIdx = remaining.indexOf('$')

    if (blockIdx !== -1 && (blockIdx <= inlineIdx || inlineIdx === -1)) {
      if (blockIdx > 0) {
        parts.push({ type: 'text', content: remaining.slice(0, blockIdx) })
      }
      const endIdx = remaining.indexOf('$$', blockIdx + 2)
      if (endIdx === -1) {
        parts.push({ type: 'text', content: remaining.slice(blockIdx) })
        break
      }
      parts.push({ type: 'block', content: remaining.slice(blockIdx + 2, endIdx) })
      remaining = remaining.slice(endIdx + 2)
    } else if (inlineIdx !== -1) {
      if (inlineIdx > 0) {
        parts.push({ type: 'text', content: remaining.slice(0, inlineIdx) })
      }
      const endIdx = remaining.indexOf('$', inlineIdx + 1)
      if (endIdx === -1) {
        parts.push({ type: 'text', content: remaining.slice(inlineIdx) })
        break
      }
      parts.push({ type: 'inline', content: remaining.slice(inlineIdx + 1, endIdx) })
      remaining = remaining.slice(endIdx + 1)
    } else {
      parts.push({ type: 'text', content: remaining })
      break
    }
  }

  return parts
}
