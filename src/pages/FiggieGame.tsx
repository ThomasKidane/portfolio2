import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { evaluate, SUITS, SUIT_SYMBOLS, SUIT_COLORS, PARTNER, type Suit } from '../lib/figgie'

type Phase = 'join' | 'waiting' | 'predict' | 'results'

interface Lobby {
  id: string
  code: string
  num_players: number
  phase: string
  round: number
  deck_assignment: Record<Suit, number> | null
}

interface Player {
  id: string
  lobby_id: string
  name: string
  hand: Record<Suit, number> | null
  prediction: Record<Suit, number> | null
  total_score: number
  last_round_score: number | null
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function dealHands(numPlayers: number): { assignment: Record<Suit, number>; hands: Record<Suit, number>[] } {
  const deckCounts = [12, 10, 10, 8]
  const shuffledSuits = [...SUITS].sort(() => Math.random() - 0.5)
  const assignment = {} as Record<Suit, number>
  shuffledSuits.forEach((s, i) => { assignment[s] = deckCounts[i] })

  const deck: Suit[] = []
  for (const s of SUITS) {
    for (let i = 0; i < assignment[s]; i++) deck.push(s)
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]
  }

  const handSize = numPlayers === 5 ? 8 : 10
  const hands: Record<Suit, number>[] = []
  for (let p = 0; p < numPlayers; p++) {
    const hand: Record<Suit, number> = { S: 0, C: 0, H: 0, D: 0 }
    for (let i = 0; i < handSize; i++) {
      hand[deck[p * handSize + i]]++
    }
    hands.push(hand)
  }
  return { assignment, hands }
}

export function FiggieGame() {
  const [phase, setPhase] = useState<Phase>('join')
  const [lobbyCode, setLobbyCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [numPlayers, setNumPlayers] = useState<4 | 5>(4)
  const [lobby, setLobby] = useState<Lobby | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<Record<Suit, number>>({ S: 25, C: 25, H: 25, D: 25 })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const myPlayer = players.find(p => p.id === myPlayerId)
  const handSize = lobby?.num_players === 5 ? 8 : 10

  // Subscribe to lobby changes
  useEffect(() => {
    if (!lobby?.id) return

    const lobbyChannel = supabase
      .channel(`lobby-${lobby.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'figgie_lobbies', filter: `id=eq.${lobby.id}` },
        (payload) => { if (payload.new) setLobby(payload.new as Lobby) }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'figgie_players', filter: `lobby_id=eq.${lobby.id}` },
        () => { fetchPlayers() }
      )
      .subscribe()

    return () => { supabase.removeChannel(lobbyChannel) }
  }, [lobby?.id])

  // Sync phase from lobby
  useEffect(() => {
    if (!lobby) return
    if (lobby.phase === 'waiting') setPhase('waiting')
    else if (lobby.phase === 'predict') { setPhase('predict'); setSubmitted(false); setPrediction({ S: 25, C: 25, H: 25, D: 25 }) }
    else if (lobby.phase === 'results') setPhase('results')
  }, [lobby?.phase, lobby?.round])

  const fetchPlayers = async () => {
    if (!lobby?.id) return
    const { data } = await supabase.from('figgie_players').select('*').eq('lobby_id', lobby.id).order('joined_at')
    if (data) setPlayers(data)
  }

  const createLobby = async () => {
    if (!playerName.trim()) { setError('Enter your name'); return }
    setError(null)
    const code = generateCode()
    const { data: lobbyData, error: lobbyErr } = await supabase
      .from('figgie_lobbies')
      .insert({ code, num_players: numPlayers, phase: 'waiting', round: 0 })
      .select()
      .single()
    if (lobbyErr || !lobbyData) { setError('Failed to create lobby'); return }

    const { data: playerData, error: playerErr } = await supabase
      .from('figgie_players')
      .insert({ lobby_id: lobbyData.id, name: playerName.trim() })
      .select()
      .single()
    if (playerErr || !playerData) { setError('Failed to join'); return }

    setLobby(lobbyData)
    setMyPlayerId(playerData.id)
    setPlayers([playerData])
    setPhase('waiting')
  }

  const joinLobby = async () => {
    if (!playerName.trim()) { setError('Enter your name'); return }
    if (!lobbyCode.trim()) { setError('Enter lobby code'); return }
    setError(null)

    const { data: lobbyData, error: lobbyErr } = await supabase
      .from('figgie_lobbies')
      .select('*')
      .eq('code', lobbyCode.trim().toUpperCase())
      .single()
    if (lobbyErr || !lobbyData) { setError('Lobby not found'); return }
    if (lobbyData.phase !== 'waiting') { setError('Game already in progress'); return }

    const { data: existingPlayers } = await supabase.from('figgie_players').select('*').eq('lobby_id', lobbyData.id)
    if (existingPlayers && existingPlayers.length >= lobbyData.num_players) { setError('Lobby is full'); return }

    const { data: playerData, error: playerErr } = await supabase
      .from('figgie_players')
      .insert({ lobby_id: lobbyData.id, name: playerName.trim() })
      .select()
      .single()
    if (playerErr || !playerData) { setError('Failed to join'); return }

    setLobby(lobbyData)
    setMyPlayerId(playerData.id)
    setPlayers([...(existingPlayers || []), playerData])
    setPhase('waiting')
  }

  const startRound = async () => {
    if (!lobby) return
    const { assignment, hands } = dealHands(lobby.num_players)

    // Update each player's hand
    for (let i = 0; i < players.length; i++) {
      await supabase.from('figgie_players')
        .update({ hand: hands[i], prediction: null, last_round_score: null })
        .eq('id', players[i].id)
    }

    await supabase.from('figgie_lobbies')
      .update({ phase: 'predict', round: lobby.round + 1, deck_assignment: assignment })
      .eq('id', lobby.id)
  }

  const submitPrediction = async () => {
    if (!myPlayerId) return
    await supabase.from('figgie_players')
      .update({ prediction })
      .eq('id', myPlayerId)
    setSubmitted(true)
    await checkAllSubmitted()
  }

  const checkAllSubmitted = useCallback(async () => {
    if (!lobby) return
    const { data } = await supabase.from('figgie_players').select('*').eq('lobby_id', lobby.id)
    if (!data) return
    const allSubmitted = data.every(p => p.prediction !== null)
    if (allSubmitted) {
      // Prevent double-scoring: check if already scored this round
      if (data.some(p => p.last_round_score !== null)) return

      for (const p of data) {
        if (!p.hand || !p.prediction) continue
        const result = evaluate(p.hand, (lobby.num_players === 5 ? 8 : 10) as 8 | 10)
        const predTotal = SUITS.reduce((sum, s) => sum + (p.prediction as Record<Suit, number>)[s], 0)
        let kl = 0
        for (const s of SUITS) {
          const predicted = Math.max((p.prediction as Record<Suit, number>)[s] / predTotal, 0.001)
          const actual = result.pGoal[s]
          if (actual > 0) {
            kl += actual * Math.log(actual / predicted)
          }
        }
        const newTotal = p.total_score + kl
        await supabase.from('figgie_players')
          .update({ last_round_score: kl, total_score: newTotal })
          .eq('id', p.id)
      }
      await supabase.from('figgie_lobbies').update({ phase: 'results' }).eq('id', lobby.id)
    }
  }, [lobby])

  // Poll for all submitted (in case realtime misses)
  useEffect(() => {
    if (phase !== 'predict' || !submitted) return
    const interval = setInterval(checkAllSubmitted, 2000)
    return () => clearInterval(interval)
  }, [phase, submitted, checkAllSubmitted])

  const predTotal = SUITS.reduce((sum, s) => sum + prediction[s], 0)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '1.75rem', fontWeight: '700', color: '#60a5fa' }}>
            Figgie Multiplayer
          </h1>
          <p className="text-xs font-mono text-gray-500 mt-1">
            Real-time calibration game. Lowest KL divergence wins.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950 border border-red-800 rounded text-xs font-mono text-red-300">{error}</div>
        )}

        {/* JOIN PHASE */}
        {phase === 'join' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-mono text-gray-400 mb-3">Create a new lobby</h3>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setNumPlayers(4)}
                    className={`px-3 py-1.5 rounded font-mono text-xs ${numPlayers === 4 ? 'bg-blue-600 text-white' : 'bg-gray-800 border border-gray-700 text-gray-400'}`}>
                    4 players
                  </button>
                  <button onClick={() => setNumPlayers(5)}
                    className={`px-3 py-1.5 rounded font-mono text-xs ${numPlayers === 5 ? 'bg-blue-600 text-white' : 'bg-gray-800 border border-gray-700 text-gray-400'}`}>
                    5 players
                  </button>
                </div>
                <button onClick={createLobby}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm rounded transition-colors">
                  Create Lobby
                </button>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-mono text-gray-400 mb-3">Join existing lobby</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="CODE"
                    value={lobbyCode}
                    onChange={e => setLobbyCode(e.target.value.toUpperCase())}
                    maxLength={4}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 uppercase tracking-widest text-center"
                  />
                  <button onClick={joinLobby}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-mono text-sm rounded transition-colors">
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WAITING PHASE */}
        {phase === 'waiting' && lobby && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 text-center">
              <p className="text-xs font-mono text-gray-400 mb-2">Lobby Code</p>
              <p className="text-4xl font-mono font-bold text-blue-400 tracking-widest">{lobby.code}</p>
              <p className="text-xs font-mono text-gray-500 mt-2">Share this code with friends</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <p className="text-xs font-mono text-gray-400 mb-3 uppercase tracking-wider">
                Players ({players.length}/{lobby.num_players})
              </p>
              <div className="space-y-2">
                {players.map(p => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-mono text-sm text-white">{p.name}</span>
                    {p.id === myPlayerId && <span className="text-xs font-mono text-gray-500">(you)</span>}
                  </div>
                ))}
                {Array.from({ length: lobby.num_players - players.length }, (_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded border border-dashed border-gray-700">
                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                    <span className="font-mono text-sm text-gray-600">Waiting...</span>
                  </div>
                ))}
              </div>
            </div>

            {players.length >= 2 && players[0]?.id === myPlayerId && (
              <button onClick={startRound}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm rounded transition-colors">
                Deal Cards — Start Round {lobby.round + 1}
              </button>
            )}
            {players[0]?.id !== myPlayerId && (
              <p className="text-xs font-mono text-gray-500 text-center">Waiting for host to start...</p>
            )}
          </div>
        )}

        {/* PREDICT PHASE */}
        {phase === 'predict' && lobby && myPlayer && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Round {lobby.round}</span>
              <span className="text-xs font-mono text-gray-600">{lobby.code}</span>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <p className="text-xs font-mono text-gray-400 mb-3 uppercase tracking-wider">Your Hand ({handSize} cards)</p>
              <div className="flex gap-6 justify-center">
                {SUITS.map(suit => (
                  <div key={suit} className="flex flex-col items-center gap-1">
                    <span className="text-4xl" style={{ color: SUIT_COLORS[suit] === 'red' ? '#ef4444' : '#e5e7eb' }}>
                      {SUIT_SYMBOLS[suit]}
                    </span>
                    <span className="text-2xl font-mono font-bold text-white">{myPlayer.hand?.[suit] ?? 0}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-mono text-gray-600 mt-3 text-center">
                Partners: ♠↔♣ • ♥↔♦ • Goal = partner of 12-card suit
              </p>
            </div>

            {!submitted ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-4">
                <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                  Predict P(goal suit) — must sum to 100
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {SUITS.map(suit => (
                    <div key={suit} className="flex flex-col items-center gap-2">
                      <span className="text-2xl" style={{ color: SUIT_COLORS[suit] === 'red' ? '#ef4444' : '#e5e7eb' }}>
                        {SUIT_SYMBOLS[suit]}
                      </span>
                      <input
                        type="number"
                        min={0} max={100}
                        value={prediction[suit]}
                        onChange={e => setPrediction(prev => ({ ...prev, [suit]: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-16 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-center text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-mono ${predTotal === 100 ? 'text-green-500' : 'text-yellow-400'}`}>
                    Sum: {predTotal}%{predTotal !== 100 && ' (will normalize)'}
                  </span>
                  <button onClick={submitPrediction}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm rounded transition-colors">
                    Lock In
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 border border-green-800 rounded-lg p-5 text-center">
                <p className="text-sm font-mono text-green-400">✓ Prediction submitted</p>
                <p className="text-xs font-mono text-gray-500 mt-2">
                  Waiting for others... ({players.filter(p => p.prediction !== null).length}/{players.length})
                </p>
              </div>
            )}
          </div>
        )}

        {/* RESULTS PHASE */}
        {phase === 'results' && lobby && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-mono text-white font-bold">Round {lobby.round} Results</h2>
              <span className="text-xs font-mono text-gray-600">{lobby.code}</span>
            </div>

            <div className="space-y-3">
              {[...players].sort((a, b) => (a.last_round_score ?? 99) - (b.last_round_score ?? 99)).map((player, rank) => {
                const result = player.hand ? evaluate(player.hand as Record<Suit, number>, handSize as 8 | 10) : null
                const pred = player.prediction as Record<Suit, number> | null
                const pTotal = pred ? SUITS.reduce((sum, s) => sum + pred[s], 0) : 1
                return (
                  <div key={player.id} className={`bg-gray-900 border rounded-lg p-4 ${rank === 0 ? 'border-green-700' : 'border-gray-800'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        {rank === 0 && <span>👑</span>}
                        <span className="font-mono text-sm text-white font-bold">{player.name}</span>
                        {player.id === myPlayerId && <span className="text-xs font-mono text-gray-500">(you)</span>}
                      </div>
                      <span className={`font-mono text-sm font-bold ${rank === 0 ? 'text-green-400' : 'text-gray-300'}`}>
                        {player.last_round_score?.toFixed(4) ?? '—'} nats
                      </span>
                    </div>
                    {result && pred && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {SUITS.map(s => (
                          <div key={s} className="text-center">
                            <span style={{ color: SUIT_COLORS[s] === 'red' ? '#ef4444' : '#d1d5db' }}>{SUIT_SYMBOLS[s]}</span>
                            <div className="text-xs font-mono text-gray-400">
                              {(pred[s] / pTotal * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs font-mono text-blue-400">
                              {(result.pGoal[s] * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Leaderboard */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <h3 className="text-sm font-mono text-gray-400 mb-3 uppercase tracking-wider">
                Leaderboard (after {lobby.round} rounds)
              </h3>
              <div className="space-y-2">
                {[...players].sort((a, b) => a.total_score - b.total_score).map((p, i) => (
                  <div key={p.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-600 w-4">{i + 1}.</span>
                      <span className="text-sm font-mono text-gray-200">{p.name}</span>
                    </div>
                    <span className="text-sm font-mono text-white font-bold">{p.total_score.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>

            {players[0]?.id === myPlayerId && (
              <button onClick={startRound}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm rounded transition-colors">
                Next Round →
              </button>
            )}
            {players[0]?.id !== myPlayerId && (
              <p className="text-xs font-mono text-gray-500 text-center">Waiting for host to deal next round...</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
