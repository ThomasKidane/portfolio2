import { useState, useMemo } from 'react'
import questionsData from '../data/quant-questions.json'
import { solutions } from '../data/quant-solutions'

interface Question {
  id: string
  title: string
  difficulty: string
  topic: string
  isPremium: boolean
  companies: string[]
  tags: string[]
  url: string
}

const questions: Question[] = questionsData.questions

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const allTopics = [...new Set(questions.map(q => q.topic))].sort()
const allCompanies = [...new Set(questions.flatMap(q => q.companies))].sort()
const allTags = [...new Set(questions.flatMap(q => q.tags))].sort()

export function Quant() {
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState<string>('')
  const [companyFilter, setCompanyFilter] = useState<string>('')
  const [tagFilter, setTagFilter] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showSolution, setShowSolution] = useState<string | null>(null)
  const [solvedSet, setSolvedSet] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('quant-solved')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch { return new Set() }
  })

  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false
      if (topicFilter && q.topic !== topicFilter) return false
      if (companyFilter && !q.companies.includes(companyFilter)) return false
      if (tagFilter && !q.tags.includes(tagFilter)) return false
      return true
    })
  }, [search, topicFilter, companyFilter, tagFilter])

  const toggleSolved = (id: string) => {
    setSolvedSet(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('quant-solved', JSON.stringify([...next]))
      return next
    })
  }

  const solvedCount = filtered.filter(q => solvedSet.has(q.id)).length

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#60a5fa',
              letterSpacing: '-0.02em',
            }}
          >
            QuantGuide Hard Index
          </h1>
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.8rem',
              color: '#6b7280',
              marginTop: '0.5rem',
            }}
          >
            {filtered.length} questions • {solvedCount} solved • {filtered.length - solvedCount} remaining
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <select
            value={topicFilter}
            onChange={e => setTopicFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Topics</option>
            {allTopics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={companyFilter}
            onChange={e => setCompanyFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Companies</option>
            {allCompanies.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Tags</option>
            {allTags.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Question List */}
        <div className="space-y-2">
          {filtered.map((q) => {
            const slug = slugify(q.title)
            const sol = solutions[slug]
            const isExpanded = expandedId === q.id
            const isSolutionShown = showSolution === q.id
            const isSolved = solvedSet.has(q.id)

            return (
              <div
                key={q.id}
                className={`border rounded-lg transition-all ${
                  isSolved
                    ? 'border-green-800 bg-green-950/30'
                    : 'border-gray-800 bg-gray-900/50'
                }`}
              >
                {/* Question Header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800/50 rounded-lg"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                >
                  <button
                    onClick={e => { e.stopPropagation(); toggleSolved(q.id) }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSolved
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-600 hover:border-green-500'
                    }`}
                  >
                    {isSolved && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span
                      className="font-mono text-sm text-gray-100 truncate block"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      {q.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {q.companies.slice(0, 2).map(c => (
                      <span key={c} className="px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs font-mono rounded">
                        {c}
                      </span>
                    ))}
                    {q.companies.length > 2 && (
                      <span className="text-xs text-gray-500 font-mono">+{q.companies.length - 2}</span>
                    )}
                    <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 text-xs font-mono rounded capitalize">
                      {q.topic}
                    </span>
                  </div>

                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-800">
                    <div className="pt-3 space-y-3">
                      {/* Tags & Meta */}
                      <div className="flex flex-wrap gap-2">
                        {q.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs font-mono rounded">
                            {tag}
                          </span>
                        ))}
                        {q.isPremium && (
                          <span className="px-2 py-0.5 bg-yellow-900/50 text-yellow-300 text-xs font-mono rounded">
                            Premium
                          </span>
                        )}
                      </div>

                      {/* Companies */}
                      {q.companies.length > 0 && (
                        <p className="text-xs text-gray-500 font-mono">
                          Asked at: {q.companies.join(', ')}
                        </p>
                      )}

                      {/* Link to original */}
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 font-mono underline"
                      >
                        View on QuantGuide →
                      </a>

                      {/* Solution Toggle */}
                      {sol && (
                        <div className="mt-4">
                          <button
                            onClick={() => setShowSolution(isSolutionShown ? null : q.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono rounded transition-colors"
                          >
                            {isSolutionShown ? 'Hide Solution' : 'Show Solution'}
                          </button>

                          {isSolutionShown && (
                            <div className="mt-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                              <div
                                className="prose prose-invert prose-sm max-w-none font-mono text-sm leading-relaxed whitespace-pre-wrap"
                                style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem' }}
                              >
                                {sol.solution}
                              </div>
                              {sol.answer && (
                                <div className="mt-4 pt-3 border-t border-gray-700">
                                  <span className="text-xs text-gray-400 font-mono">Answer: </span>
                                  <span className="text-sm text-green-400 font-mono font-bold">{sol.answer}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {!sol && (
                        <p className="text-xs text-gray-600 font-mono italic mt-2">
                          Solution not yet available
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 font-mono text-sm">No questions match your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
