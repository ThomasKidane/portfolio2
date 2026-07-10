import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import questionsData from '../data/quant-questions.json'
import prompts from '../data/quant-prompts.json'
import { solutions } from '../data/quant-solutions'
import { LatexRenderer } from '../components/LatexRenderer'

interface QuantGuideQuestion {
  id: string
  title: string
  difficulty: string
  topic: string
  isPremium: boolean
  companies: string[]
  tags: string[]
  url: string
}

interface QuantableQuestion {
  id: string
  title: string
  difficulty: string
  url: string
  problem: string
  hint: string
  solution: string
  hasHint: boolean
}

interface Playlist {
  id: number
  name: string
  url: string
  questions: string[]
}

const quantGuideQuestions: QuantGuideQuestion[] = questionsData.questions
const questionPrompts: Record<string, string> = prompts

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const allTopics = [...new Set(quantGuideQuestions.map(q => q.topic))].sort()
const allCompanies = [...new Set(quantGuideQuestions.flatMap(q => q.companies))].sort()
const allTags = [...new Set(quantGuideQuestions.flatMap(q => q.tags))].sort()

export function Quant() {
  const [activeTab, setActiveTab] = useState<'quantguide' | 'quantable'>('quantguide')
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [playlistFilter, setPlaylistFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showSolution, setShowSolution] = useState<string | null>(null)
  const [quantableQuestions, setQuantableQuestions] = useState<QuantableQuestion[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [quantableLoading, setQuantableLoading] = useState(false)
  const [solvedSet, setSolvedSet] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('quant-solved')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch { return new Set() }
  })

  useEffect(() => {
    if (activeTab === 'quantable' && quantableQuestions.length === 0 && !quantableLoading) {
      setQuantableLoading(true)
      fetch('/quantable-questions.json')
        .then(r => r.json())
        .then(data => {
          setQuantableQuestions(data.questions)
          setPlaylists(data.playlists || [])
          setQuantableLoading(false)
        })
        .catch(() => setQuantableLoading(false))
    }
  }, [activeTab, quantableQuestions.length, quantableLoading])

  const filteredQuantGuide = useMemo(() => {
    return quantGuideQuestions.filter(q => {
      if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false
      if (topicFilter && q.topic !== topicFilter) return false
      if (companyFilter && !q.companies.includes(companyFilter)) return false
      if (tagFilter && !q.tags.includes(tagFilter)) return false
      return true
    })
  }, [search, topicFilter, companyFilter, tagFilter])

  const filteredQuantable = useMemo(() => {
    const selectedPlaylist = playlists.find(p => p.name === playlistFilter)
    const playlistTitles = selectedPlaylist ? new Set(selectedPlaylist.questions) : null

    return quantableQuestions.filter(q => {
      if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false
      if (difficultyFilter && q.difficulty !== difficultyFilter) return false
      if (playlistTitles && !playlistTitles.has(q.title)) return false
      return true
    })
  }, [search, difficultyFilter, quantableQuestions, playlistFilter, playlists])

  const toggleSolved = (id: string) => {
    setSolvedSet(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('quant-solved', JSON.stringify([...next]))
      return next
    })
  }

  const currentFiltered = activeTab === 'quantguide' ? filteredQuantGuide : filteredQuantable
  const solvedCount = currentFiltered.filter(q => solvedSet.has(q.id)).length

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-2 border-dotted border-blue-500 pb-8 pt-12 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <Link to="/" className="text-sm text-gray-400 hover:text-blue-600 transition-colors mb-4 inline-block" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.6rem' }}>
            ← BACK
          </Link>
          <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1.5rem', color: '#4169E1', letterSpacing: '0.05em', lineHeight: '1.6' }}>
            QUANT PRACTICE
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#666', marginTop: '0.75rem', lineHeight: '1.6' }}>
            {currentFiltered.length} questions &bull; {solvedCount} solved &bull; {currentFiltered.length - solvedCount} remaining
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-6">
        <div className="flex gap-1 border-b-2 border-dotted border-gray-200">
          <button
            onClick={() => { setActiveTab('quantguide'); setExpandedId(null); setShowSolution(null) }}
            className={`px-4 py-2 text-xs transition-colors border-b-2 -mb-[2px] ${
              activeTab === 'quantguide'
                ? 'border-blue-500 text-blue-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
            style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.55rem' }}
          >
            QUANTGUIDE ({quantGuideQuestions.length})
          </button>
          <button
            onClick={() => { setActiveTab('quantable'); setExpandedId(null); setShowSolution(null) }}
            className={`px-4 py-2 text-xs transition-colors border-b-2 -mb-[2px] ${
              activeTab === 'quantable'
                ? 'border-blue-500 text-blue-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
            style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.55rem' }}
          >
            QUANTABLE ({quantableQuestions.length || '...'})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-4 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border-2 border-dotted border-gray-300 rounded px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 bg-white"
            style={{ fontFamily: 'Georgia, serif' }}
          />
          {activeTab === 'quantguide' ? (
            <>
              <select
                value={topicFilter}
                onChange={e => setTopicFilter(e.target.value)}
                className="border-2 border-dotted border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                <option value="">All Topics</option>
                {allTopics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={companyFilter}
                onChange={e => setCompanyFilter(e.target.value)}
                className="border-2 border-dotted border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                <option value="">All Companies</option>
                {allCompanies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={tagFilter}
                onChange={e => setTagFilter(e.target.value)}
                className="border-2 border-dotted border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                <option value="">All Tags</option>
                {allTags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </>
          ) : (
            <>
              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="border-2 border-dotted border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="extreme">Extreme</option>
              </select>
              <select
                value={playlistFilter}
                onChange={e => setPlaylistFilter(e.target.value)}
                className="border-2 border-dotted border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                <option value="">All Playlists</option>
                {playlists.map(p => <option key={p.id} value={p.name}>{p.name} ({p.questions.length})</option>)}
              </select>
              <div />
            </>
          )}
        </div>
      </div>

      {/* Question List */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-4">
        <div className="space-y-2">
          {activeTab === 'quantguide' && filteredQuantGuide.map(q => {
            const slug = slugify(q.title)
            const sol = solutions[slug]
            const isExpanded = expandedId === q.id
            const isSolutionShown = showSolution === q.id
            const isSolved = solvedSet.has(q.id)

            return (
              <div
                key={q.id}
                className={`border-2 border-dotted rounded-lg transition-all ${
                  isSolved ? 'border-green-400 bg-green-50/50' : 'border-gray-200 bg-white'
                }`}
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50/30 rounded-lg"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                >
                  <button
                    onClick={e => { e.stopPropagation(); toggleSolved(q.id) }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSolved ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {isSolved && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-800 truncate block" style={{ fontFamily: 'Georgia, serif' }}>
                      {q.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {q.companies.slice(0, 2).map(c => (
                      <span key={c} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>
                        {c}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded capitalize" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>
                      {q.topic}
                    </span>
                  </div>

                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t-2 border-dotted border-gray-200">
                    <div className="pt-3 space-y-3">
                      {questionPrompts[slug] && (
                        <div className="p-4 bg-gray-50 rounded-lg border-2 border-dotted border-gray-200">
                          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>QUESTION</p>
                          <LatexRenderer text={questionPrompts[slug]} className="text-sm text-gray-700 leading-relaxed" />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {q.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded" style={{ fontFamily: 'Georgia, serif' }}>
                            {tag}
                          </span>
                        ))}
                        {q.isPremium && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>
                            PREMIUM
                          </span>
                        )}
                      </div>

                      {q.companies.length > 0 && (
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>
                          Asked at: {q.companies.join(', ')}
                        </p>
                      )}

                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        View on QuantGuide →
                      </a>

                      {sol && (
                        <div className="mt-4">
                          <button
                            onClick={() => setShowSolution(isSolutionShown ? null : q.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                            style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}
                          >
                            {isSolutionShown ? 'HIDE SOLUTION' : 'SHOW SOLUTION'}
                          </button>

                          {isSolutionShown && (
                            <div className="mt-3 p-4 bg-gray-50 rounded-lg border-2 border-dotted border-blue-200">
                              <LatexRenderer text={sol.solution} className="text-sm text-gray-700 leading-relaxed" />
                              {sol.answer && (
                                <div className="mt-4 pt-3 border-t-2 border-dotted border-gray-200">
                                  <span className="text-xs text-gray-400" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>ANSWER: </span>
                                  <LatexRenderer text={`$${sol.answer}$`} className="inline text-sm text-green-600 font-bold" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {!sol && (
                        <p className="text-xs text-gray-400 italic mt-2" style={{ fontFamily: 'Georgia, serif' }}>
                          Solution not yet available
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {activeTab === 'quantable' && quantableLoading && (
            <div className="text-center py-12">
              <p className="text-gray-400" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.6rem' }}>
                LOADING QUESTIONS...
              </p>
            </div>
          )}

          {activeTab === 'quantable' && !quantableLoading && filteredQuantable.map(q => {
            const isExpanded = expandedId === q.id
            const isSolutionShown = showSolution === q.id
            const isSolved = solvedSet.has(q.id)

            const diffColors: Record<string, string> = {
              easy: 'bg-green-100 text-green-700',
              medium: 'bg-yellow-100 text-yellow-700',
              hard: 'bg-red-100 text-red-700',
              extreme: 'bg-purple-100 text-purple-700',
            }

            return (
              <div
                key={q.id}
                className={`border-2 border-dotted rounded-lg transition-all ${
                  isSolved ? 'border-green-400 bg-green-50/50' : 'border-gray-200 bg-white'
                }`}
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50/30 rounded-lg"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                >
                  <button
                    onClick={e => { e.stopPropagation(); toggleSolved(q.id) }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSolved ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {isSolved && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-800 truncate block" style={{ fontFamily: 'Georgia, serif' }}>
                      {q.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 text-xs rounded capitalize ${diffColors[q.difficulty] || 'bg-gray-100 text-gray-600'}`} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>
                      {q.difficulty}
                    </span>
                  </div>

                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t-2 border-dotted border-gray-200">
                    <div className="pt-3 space-y-3">
                      <div className="p-4 bg-gray-50 rounded-lg border-2 border-dotted border-gray-200">
                        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>QUESTION</p>
                        <LatexRenderer
                          text={q.problem}
                          className="text-sm text-gray-700 leading-relaxed"
                        />
                      </div>

                      {q.hint && (
                        <div className="p-3 bg-yellow-50 rounded-lg border-2 border-dotted border-yellow-200">
                          <p className="text-xs text-yellow-600 mb-1" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>HINT</p>
                          <p className="text-sm text-yellow-800" style={{ fontFamily: 'Georgia, serif' }}>{q.hint}</p>
                        </div>
                      )}

                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        View on Quantable →
                      </a>

                      {q.solution && (
                        <div className="mt-4">
                          <button
                            onClick={() => setShowSolution(isSolutionShown ? null : q.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                            style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}
                          >
                            {isSolutionShown ? 'HIDE SOLUTION' : 'SHOW SOLUTION'}
                          </button>

                          {isSolutionShown && (
                            <div className="mt-3 p-4 bg-gray-50 rounded-lg border-2 border-dotted border-blue-200">
                              <LatexRenderer
                                text={q.solution}
                                className="text-sm text-gray-700 leading-relaxed"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {currentFiltered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.6rem' }}>
              NO QUESTIONS MATCH YOUR FILTERS
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
