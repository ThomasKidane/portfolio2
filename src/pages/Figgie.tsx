import { useState, useMemo } from 'react'
import { evaluate, SUITS, SUIT_NAMES, SUIT_SYMBOLS, SUIT_COLORS, PARTNER, type Suit, type EvalResult } from '../lib/figgie'

export function Figgie() {
  const [players, setPlayers] = useState<4 | 5>(4)
  const handSize = players === 4 ? 10 : 8
  const [hand, setHand] = useState<Record<Suit, number>>({ S: 4, C: 3, H: 2, D: 1 })
  const [error, setError] = useState<string | null>(null)

  const total = SUITS.reduce((sum, s) => sum + hand[s], 0)

  const result: EvalResult | null = useMemo(() => {
    if (total !== handSize) {
      setError(`Hand must have exactly ${handSize} cards (currently ${total})`)
      return null
    }
    setError(null)
    try {
      return evaluate(hand, handSize as 8 | 10)
    } catch (e) {
      setError((e as Error).message)
      return null
    }
  }, [hand, total, handSize])

  const bestGoal = result
    ? SUITS.reduce((best, s) => result.pGoal[s] > result.pGoal[best] ? s : best, SUITS[0])
    : null

  const updateSuit = (suit: Suit, delta: number) => {
    const newVal = hand[suit] + delta
    if (newVal < 0 || newVal > handSize) return
    setHand(prev => ({ ...prev, [suit]: newVal }))
  }

  const switchPlayers = (p: 4 | 5) => {
    setPlayers(p)
    const newHandSize = p === 4 ? 10 : 8
    if (total > newHandSize) {
      setHand({ S: Math.floor(newHandSize / 4), C: Math.floor(newHandSize / 4), H: Math.floor(newHandSize / 4), D: newHandSize - 3 * Math.floor(newHandSize / 4) })
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
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
            Figgie Evaluator
          </h1>
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.75rem',
              color: '#6b7280',
              marginTop: '0.5rem',
            }}
          >
            Bayesian posterior for goal suit given your 10-card hand
          </p>
        </div>

        {/* Rules Summary */}
        <div className="mb-8 p-4 bg-gray-900 border border-gray-800 rounded-lg">
          <p className="text-xs text-gray-400 font-mono leading-relaxed">
            Deck: (12, 10, 10, 8) cards assigned randomly to 4 suits. The 12-card suit's partner
            (same color) is the <span className="text-blue-400">goal suit</span>.
            Pot pays $200 split among goal-suit card holders.
            Partners: <span className="text-gray-300">♠↔♣</span> (black), <span className="text-red-400">♥↔♦</span> (red).
          </p>
        </div>

        {/* Player Count Toggle */}
        <div className="mb-6">
          <h2 className="text-sm font-mono text-gray-400 mb-3 uppercase tracking-wider">Players</h2>
          <div className="flex gap-2">
            <button
              onClick={() => switchPlayers(4)}
              className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                players === 4
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              4 players (10 cards)
            </button>
            <button
              onClick={() => switchPlayers(5)}
              className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                players === 5
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              5 players (8 cards)
            </button>
          </div>
        </div>

        {/* Hand Input */}
        <div className="mb-8">
          <h2 className="text-sm font-mono text-gray-400 mb-4 uppercase tracking-wider">Your Hand</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SUITS.map(suit => (
              <div
                key={suit}
                className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col items-center gap-2"
              >
                <span
                  className="text-3xl"
                  style={{ color: SUIT_COLORS[suit] === 'red' ? '#ef4444' : '#e5e7eb' }}
                >
                  {SUIT_SYMBOLS[suit]}
                </span>
                <span className="text-xs font-mono text-gray-400">{SUIT_NAMES[suit]}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateSuit(suit, -1)}
                    className="w-8 h-8 rounded bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 font-mono text-lg transition-colors"
                  >
                    −
                  </button>
                  <span className="text-2xl font-mono font-bold w-6 text-center text-white">
                    {hand[suit]}
                  </span>
                  <button
                    onClick={() => updateSuit(suit, 1)}
                    className="w-8 h-8 rounded bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 font-mono text-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between items-center">
            <span className={`text-xs font-mono ${total === handSize ? 'text-green-500' : 'text-red-400'}`}>
              Total: {total}/{handSize}
            </span>
            {error && <span className="text-xs font-mono text-red-400">{error}</span>}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Goal Suit Probabilities */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <h2 className="text-sm font-mono text-gray-400 mb-4 uppercase tracking-wider">
                Goal Suit Probability
              </h2>
              <div className="space-y-3">
                {SUITS.map(suit => {
                  const prob = result.pGoal[suit]
                  const isBest = suit === bestGoal
                  return (
                    <div key={suit} className="flex items-center gap-3">
                      <span
                        className="text-lg w-6"
                        style={{ color: SUIT_COLORS[suit] === 'red' ? '#ef4444' : '#e5e7eb' }}
                      >
                        {SUIT_SYMBOLS[suit]}
                      </span>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-800 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isBest ? 'bg-blue-500' : 'bg-gray-600'
                            }`}
                            style={{ width: `${prob * 100}%` }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-white">
                            {(prob * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      {isBest && (
                        <span className="text-xs font-mono text-blue-400 whitespace-nowrap">← likely goal</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Value & Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <h2 className="text-sm font-mono text-gray-400 mb-3 uppercase tracking-wider">
                  Goal Count Distribution
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-gray-400">P(8 goal cards)</span>
                    <span className="text-sm font-mono text-white font-bold">
                      {(result.pCount[8] * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-gray-400">P(10 goal cards)</span>
                    <span className="text-sm font-mono text-white font-bold">
                      {(result.pCount[10] * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-gray-400">E[goal count]</span>
                      <span className="text-sm font-mono text-blue-400 font-bold">
                        {result.eGoalCount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <h2 className="text-sm font-mono text-gray-400 mb-3 uppercase tracking-wider">
                  Value Per Card
                </h2>
                <div className="space-y-2">
                  {SUITS.map(suit => (
                    <div key={suit} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span style={{ color: SUIT_COLORS[suit] === 'red' ? '#ef4444' : '#e5e7eb' }}>
                          {SUIT_SYMBOLS[suit]}
                        </span>
                        <span className="text-xs font-mono text-gray-400">{SUIT_NAMES[suit]}</span>
                      </span>
                      <span className={`text-sm font-mono font-bold ${
                        suit === bestGoal ? 'text-green-400' : 'text-gray-300'
                      }`}>
                        ${result.valuePerCard[suit].toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Heuristic */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <p className="text-xs font-mono text-gray-500">
                <span className="text-gray-400">Heuristic:</span> longest suit = {
                  SUIT_SYMBOLS[SUITS.reduce((a, b) => hand[a] >= hand[b] ? a : b, SUITS[0])]
                } → suspect goal = {
                  SUIT_SYMBOLS[PARTNER[SUITS.reduce((a, b) => hand[a] >= hand[b] ? a : b, SUITS[0])]]
                } (partner of 12-card suit)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
