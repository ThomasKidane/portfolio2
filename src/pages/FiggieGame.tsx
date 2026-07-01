import { useState, useCallback } from 'react'
import { evaluate, SUITS, SUIT_SYMBOLS, SUIT_COLORS, PARTNER, type Suit } from '../lib/figgie'

type GamePhase = 'setup' | 'predict' | 'results'

interface Player {
  name: string
  hand: Record<Suit, number>
  prediction: Record<Suit, number>
  score: number
  totalScore: number
}

interface RoundResult {
  round: number
  players: { name: string; score: number }[]
}

function dealHands(numPlayers: 4 | 5): Record<Suit, number>[] {
  const counts: Record<Suit, number> = { S: 0, C: 0, H: 0, D: 0 }

  // Random assignment of (12,10,10,8) to suits
  const deckCounts = [12, 10, 10, 8]
  const shuffledSuits = [...SUITS].sort(() => Math.random() - 0.5)
  shuffledSuits.forEach((s, i) => { counts[s] = deckCounts[i] })

  // Build deck
  const deck: Suit[] = []
  for (const s of SUITS) {
    for (let i = 0; i < counts[s]; i++) deck.push(s)
  }

  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]
  }

  // Deal
  const handSize = numPlayers === 4 ? 10 : 8
  const hands: Record<Suit, number>[] = []
  for (let p = 0; p < numPlayers; p++) {
    const hand: Record<Suit, number> = { S: 0, C: 0, H: 0, D: 0 }
    for (let i = 0; i < handSize; i++) {
      hand[deck[p * handSize + i]]++
    }
    hands.push(hand)
  }

  return hands
}

export function FiggieGame() {
  const [phase, setPhase] = useState<GamePhase>('setup')
  const [numPlayers, setNumPlayers] = useState<4 | 5>(4)
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2', 'Player 3', 'Player 4'])
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [roundHistory, setRoundHistory] = useState<RoundResult[]>([])
  const [roundNum, setRoundNum] = useState(0)
  const [revealAll, setRevealAll] = useState(false)

  const handSize = numPlayers === 4 ? 10 : 8

  const updatePlayerCount = (n: 4 | 5) => {
    setNumPlayers(n)
    const names = Array.from({ length: n }, (_, i) => playerNames[i] || `Player ${i + 1}`)
    setPlayerNames(names)
  }

  const startRound = useCallback(() => {
    const hands = dealHands(numPlayers)
    const newPlayers: Player[] = playerNames.slice(0, numPlayers).map((name, i) => ({
      name,
      hand: hands[i],
      prediction: { S: 25, C: 25, H: 25, D: 25 },
      score: 0,
      totalScore: players[i]?.totalScore || 0,
    }))
    setPlayers(newPlayers)
    setCurrentPlayer(0)
    setRevealAll(false)
    setRoundNum(prev => prev + 1)
    setPhase('predict')
  }, [numPlayers, playerNames, players])

  const updatePrediction = (suit: Suit, value: number) => {
    setPlayers(prev => {
      const updated = [...prev]
      updated[currentPlayer] = {
        ...updated[currentPlayer],
        prediction: { ...updated[currentPlayer].prediction, [suit]: value }
      }
      return updated
    })
  }

  const submitPrediction = () => {
    if (currentPlayer < numPlayers - 1) {
      setCurrentPlayer(prev => prev + 1)
    } else {
      scoreRound()
    }
  }

  const scoreRound = () => {
    const scored = players.map(p => {
      const result = evaluate(p.hand, handSize as 8 | 10)
      const predTotal = SUITS.reduce((sum, s) => sum + p.prediction[s], 0)
      let brierScore = 0
      for (const s of SUITS) {
        const predicted = p.prediction[s] / predTotal
        const actual = result.pGoal[s]
        brierScore += (predicted - actual) ** 2
      }
      return { ...p, score: brierScore, totalScore: p.totalScore + brierScore }
    })
    setPlayers(scored)
    setRoundHistory(prev => [...prev, {
      round: roundNum,
      players: scored.map(p => ({ name: p.name, score: p.score }))
    }])
    setPhase('results')
  }

  const predTotal = phase === 'predict'
    ? SUITS.reduce((sum, s) => sum + (players[currentPlayer]?.prediction[s] || 0), 0)
    : 0

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#60a5fa',
            }}
          >
            Figgie Calibration Game
          </h1>
          <p className="text-xs font-mono text-gray-500 mt-1">
            Predict goal suit posteriors. Lowest Brier score wins.
          </p>
        </div>

        {/* Setup Phase */}
        {phase === 'setup' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-mono text-gray-400 mb-3 uppercase tracking-wider">Players</h2>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => updatePlayerCount(4)}
                  className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                    numPlayers === 4 ? 'bg-blue-600 text-white' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  4 players
                </button>
                <button
                  onClick={() => updatePlayerCount(5)}
                  className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                    numPlayers === 5 ? 'bg-blue-600 text-white' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  5 players
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: numPlayers }, (_, i) => (
                  <input
                    key={i}
                    type="text"
                    value={playerNames[i] || ''}
                    onChange={e => {
                      const names = [...playerNames]
                      names[i] = e.target.value
                      setPlayerNames(names)
                    }}
                    placeholder={`Player ${i + 1}`}
                    className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                ))}
              </div>
            </div>

            <button
              onClick={startRound}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm rounded transition-colors"
            >
              Deal Cards →
            </button>

            {/* Leaderboard */}
            {roundHistory.length > 0 && (
              <Leaderboard players={players} roundHistory={roundHistory} />
            )}
          </div>
        )}

        {/* Prediction Phase */}
        {phase === 'predict' && players[currentPlayer] && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-mono text-white font-bold">
                {players[currentPlayer].name}'s Turn
              </h2>
              <span className="text-xs font-mono text-gray-500">
                Round {roundNum} • Player {currentPlayer + 1}/{numPlayers}
              </span>
            </div>

            {/* Hand Display */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <p className="text-xs font-mono text-gray-400 mb-3 uppercase tracking-wider">Your Hand ({handSize} cards)</p>
              <div className="flex gap-4 justify-center">
                {SUITS.map(suit => (
                  <div key={suit} className="flex flex-col items-center gap-1">
                    <span
                      className="text-4xl"
                      style={{ color: SUIT_COLORS[suit] === 'red' ? '#ef4444' : '#e5e7eb' }}
                    >
                      {SUIT_SYMBOLS[suit]}
                    </span>
                    <span className="text-2xl font-mono font-bold text-white">{players[currentPlayer].hand[suit]}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-mono text-gray-600 mt-3 text-center">
                Partners: ♠↔♣ (black) • ♥↔♦ (red) • Goal = partner of 12-card suit
              </p>
            </div>

            {/* Prediction Input */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <p className="text-xs font-mono text-gray-400 mb-4 uppercase tracking-wider">
                Your prediction: P(goal suit) — must sum to 100
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SUITS.map(suit => (
                  <div key={suit} className="flex flex-col items-center gap-2">
                    <span
                      className="text-2xl"
                      style={{ color: SUIT_COLORS[suit] === 'red' ? '#ef4444' : '#e5e7eb' }}
                    >
                      {SUIT_SYMBOLS[suit]}
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={players[currentPlayer].prediction[suit]}
                        onChange={e => updatePrediction(suit, Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-center text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-xs font-mono text-gray-500">%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className={`text-xs font-mono ${predTotal === 100 ? 'text-green-500' : 'text-yellow-400'}`}>
                  Sum: {predTotal}% {predTotal !== 100 && '(will be normalized)'}
                </span>
              </div>
            </div>

            <button
              onClick={submitPrediction}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm rounded transition-colors"
            >
              {currentPlayer < numPlayers - 1 ? 'Submit & Next Player →' : 'Submit & Reveal Results →'}
            </button>
          </div>
        )}

        {/* Results Phase */}
        {phase === 'results' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-mono text-white font-bold">Round {roundNum} Results</h2>
              <button
                onClick={() => setRevealAll(!revealAll)}
                className="text-xs font-mono text-blue-400 hover:text-blue-300 underline"
              >
                {revealAll ? 'Hide details' : 'Show all hands'}
              </button>
            </div>

            {/* Scores */}
            <div className="space-y-3">
              {[...players].sort((a, b) => a.score - b.score).map((player, rank) => {
                const result = evaluate(player.hand, handSize as 8 | 10)
                const predTotal = SUITS.reduce((sum, s) => sum + player.prediction[s], 0)
                return (
                  <div key={player.name} className={`bg-gray-900 border rounded-lg p-4 ${rank === 0 ? 'border-green-700' : 'border-gray-800'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        {rank === 0 && <span className="text-yellow-400">👑</span>}
                        <span className="font-mono text-sm text-white font-bold">{player.name}</span>
                      </div>
                      <span className={`font-mono text-sm font-bold ${rank === 0 ? 'text-green-400' : 'text-gray-300'}`}>
                        {player.score.toFixed(4)} loss
                      </span>
                    </div>

                    {revealAll && (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-4 text-xs font-mono">
                          <span className="text-gray-500">Hand:</span>
                          {SUITS.map(s => (
                            <span key={s} style={{ color: SUIT_COLORS[s] === 'red' ? '#ef4444' : '#d1d5db' }}>
                              {SUIT_SYMBOLS[s]}{player.hand[s]}
                            </span>
                          ))}
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {SUITS.map(s => (
                            <div key={s} className="text-center">
                              <span className="text-xs" style={{ color: SUIT_COLORS[s] === 'red' ? '#ef4444' : '#d1d5db' }}>
                                {SUIT_SYMBOLS[s]}
                              </span>
                              <div className="text-xs font-mono text-gray-400">
                                pred: {(player.prediction[s] / predTotal * 100).toFixed(0)}%
                              </div>
                              <div className="text-xs font-mono text-blue-400">
                                true: {(result.pGoal[s] * 100).toFixed(1)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Cumulative Leaderboard */}
            <Leaderboard players={players} roundHistory={roundHistory} />

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={startRound}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm rounded transition-colors"
              >
                Next Round →
              </button>
              <button
                onClick={() => { setPhase('setup'); setRoundHistory([]); setPlayers([]); setRoundNum(0) }}
                className="px-6 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 text-gray-300 font-mono text-sm rounded transition-colors"
              >
                Reset Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Leaderboard({ players, roundHistory }: { players: Player[]; roundHistory: RoundResult[] }) {
  const sorted = [...players].sort((a, b) => a.totalScore - b.totalScore)
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <h3 className="text-sm font-mono text-gray-400 mb-3 uppercase tracking-wider">
        Leaderboard ({roundHistory.length} rounds)
      </h3>
      <div className="space-y-2">
        {sorted.map((p, i) => (
          <div key={p.name} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-600 w-4">{i + 1}.</span>
              <span className="text-sm font-mono text-gray-200">{p.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-gray-500">
                avg: {(p.totalScore / roundHistory.length).toFixed(4)}
              </span>
              <span className="text-sm font-mono text-white font-bold">
                {p.totalScore.toFixed(4)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
