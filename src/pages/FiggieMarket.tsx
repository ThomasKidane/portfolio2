import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { SUITS, SUIT_SYMBOLS, SUIT_COLORS, type Suit } from '../lib/figgie'
import {
  dealMarketHands,
  assignMarketSuits,
  MAX_SPREAD,
  STARTING_CASH,
  ROUND_DURATION_MS,
  GOAL_CARD_VALUE,
} from '../lib/figgie-market'

type Phase = 'join' | 'waiting' | 'trading' | 'results'

interface LobbyData {
  id: string
  code: string
  num_players: number
  phase: string
  round: number
  deck_assignment: Record<Suit, number> | null
  goal_suit: Suit | null
  round_start_time: string | null
  suit_assignments: Record<string, Suit> | null
  penalty_pot: number
}

interface PlayerData {
  id: string
  lobby_id: string
  name: string
  hand: Record<Suit, number> | null
  cash: number
  trade_volume: number
  penalty_drained: number
  quote_bid: number | null
  quote_ask: number | null
  quote_suit: Suit | null
  last_quote_time: string | null
  total_score: number
}

interface TradeRecord {
  id: string
  lobby_id: string
  buyer_name: string
  seller_name: string
  suit: Suit
  price: number
  created_at: string
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}


interface GameParams {
  penaltyInterval: number
  penaltyAmount: number
  maxSpread: number
  startingCash: number
  roundDuration: number
  goalCardValue: number
}

const DEFAULT_PARAMS: GameParams = {
  penaltyInterval: 14,
  penaltyAmount: 2,
  maxSpread: MAX_SPREAD,
  startingCash: STARTING_CASH,
  roundDuration: 180,
  goalCardValue: GOAL_CARD_VALUE,
}

export function FiggieMarket() {
  const [phase, setPhase] = useState<Phase>('join')
  const [lobbyCode, setLobbyCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [numPlayers, setNumPlayers] = useState<4 | 5>(4)
  const [lobby, setLobby] = useState<LobbyData | null>(null)
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null)
  const [trades, setTrades] = useState<TradeRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_MS / 1000)
  const [bidInput, setBidInput] = useState('')
  const [askInput, setAskInput] = useState('')
  const [params, setParams] = useState<GameParams>(DEFAULT_PARAMS)
  const [showRules, setShowRules] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const penaltyRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const myPlayer = players.find(p => p.id === myPlayerId)
  const myAssignedSuit = lobby?.suit_assignments && myPlayerId
    ? lobby.suit_assignments[myPlayerId] : null

  useEffect(() => {
    if (!lobby?.id) return
    const channel = supabase
      .channel(`market-${lobby.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'figgie_market_lobbies', filter: `id=eq.${lobby.id}` },
        (payload) => { if (payload.new) setLobby(payload.new as LobbyData) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'figgie_market_players', filter: `lobby_id=eq.${lobby.id}` },
        () => { fetchPlayers() })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'figgie_market_trades', filter: `lobby_id=eq.${lobby.id}` },
        (payload) => { if (payload.new) setTrades(prev => [payload.new as TradeRecord, ...prev].slice(0, 50)) })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [lobby?.id])

  useEffect(() => {
    if (!lobby) return
    if (lobby.phase === 'waiting') setPhase('waiting')
    else if (lobby.phase === 'trading') setPhase('trading')
    else if (lobby.phase === 'results') setPhase('results')
  }, [lobby?.phase, lobby?.round])

  useEffect(() => {
    if (phase !== 'trading' || !lobby?.round_start_time) return
    const roundMs = params.roundDuration * 1000
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - new Date(lobby.round_start_time!).getTime()
      const remaining = Math.max(0, Math.ceil((roundMs - elapsed) / 1000))
      setTimeLeft(remaining)
      if (remaining <= 0) endRound()
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, lobby?.round_start_time])

  useEffect(() => {
    if (phase !== 'trading' || !myPlayerId || !myAssignedSuit) return
    const penaltyIntervalMs = params.penaltyInterval * 1000
    penaltyRef.current = setInterval(async () => {
      const me = players.find(p => p.id === myPlayerId)
      if (!me || me.quote_bid !== null) return
      const lastTime = me.last_quote_time ? new Date(me.last_quote_time).getTime() : (lobby?.round_start_time ? new Date(lobby.round_start_time).getTime() : Date.now())
      const elapsed = Date.now() - lastTime
      if (elapsed >= penaltyIntervalMs) {
        const newDrained = me.penalty_drained + params.penaltyAmount
        const newCash = me.cash - params.penaltyAmount
        await supabase.from('figgie_market_players')
          .update({ penalty_drained: newDrained, cash: newCash, last_quote_time: new Date().toISOString() })
          .eq('id', myPlayerId)
        await supabase.from('figgie_market_lobbies')
          .update({ penalty_pot: (lobby?.penalty_pot || 0) + params.penaltyAmount })
          .eq('id', lobby?.id)
      }
    }, 3000)
    return () => { if (penaltyRef.current) clearInterval(penaltyRef.current) }
  }, [phase, myPlayerId, myAssignedSuit, players])


  const fetchPlayers = async () => {
    if (!lobby?.id) return
    const { data } = await supabase.from('figgie_market_players').select('*').eq('lobby_id', lobby.id).order('joined_at')
    if (data) setPlayers(data)
  }

  const createLobby = async () => {
    if (!playerName.trim()) { setError('Enter your name'); return }
    setError(null)
    const code = generateCode()
    const { data: lobbyData, error: err } = await supabase
      .from('figgie_market_lobbies')
      .insert({ code, num_players: numPlayers, phase: 'waiting', round: 0, penalty_pot: 0 })
      .select().single()
    if (err || !lobbyData) { setError('Failed to create lobby'); return }
    const { data: playerData, error: pErr } = await supabase
      .from('figgie_market_players')
      .insert({ lobby_id: lobbyData.id, name: playerName.trim(), cash: params.startingCash, trade_volume: 0, penalty_drained: 0, total_score: 0 })
      .select().single()
    if (pErr || !playerData) { setError('Failed to join'); return }
    setLobby(lobbyData)
    setMyPlayerId(playerData.id)
    setPlayers([playerData])
    setPhase('waiting')
  }

  const joinLobby = async () => {
    if (!playerName.trim()) { setError('Enter your name'); return }
    if (!lobbyCode.trim()) { setError('Enter lobby code'); return }
    setError(null)
    const { data: lobbyData, error: err } = await supabase
      .from('figgie_market_lobbies').select('*').eq('code', lobbyCode.trim().toUpperCase()).single()
    if (err || !lobbyData) { setError('Lobby not found'); return }
    if (lobbyData.phase !== 'waiting') { setError('Game already started'); return }
    const { data: existing } = await supabase.from('figgie_market_players').select('*').eq('lobby_id', lobbyData.id)
    if (existing && existing.length >= lobbyData.num_players) { setError('Lobby full'); return }
    const { data: playerData, error: pErr } = await supabase
      .from('figgie_market_players')
      .insert({ lobby_id: lobbyData.id, name: playerName.trim(), cash: params.startingCash, trade_volume: 0, penalty_drained: 0, total_score: 0 })
      .select().single()
    if (pErr || !playerData) { setError('Failed to join'); return }
    setLobby(lobbyData)
    setMyPlayerId(playerData.id)
    setPlayers([...(existing || []), playerData])
    setPhase('waiting')
  }

  const startRound = async () => {
    if (!lobby) return
    const { assignment, hands, goalSuit } = dealMarketHands(lobby.num_players)
    const playerIds = players.map(p => p.id)
    const suitAssignments = assignMarketSuits(playerIds, lobby.num_players)
    for (let i = 0; i < players.length; i++) {
      await supabase.from('figgie_market_players')
        .update({ hand: hands[i], cash: params.startingCash, trade_volume: 0, penalty_drained: 0, quote_bid: null, quote_ask: null, quote_suit: null, last_quote_time: null })
        .eq('id', players[i].id)
    }
    await supabase.from('figgie_market_lobbies')
      .update({ phase: 'trading', round: lobby.round + 1, deck_assignment: assignment, goal_suit: goalSuit, round_start_time: new Date().toISOString(), suit_assignments: suitAssignments, penalty_pot: 0 })
      .eq('id', lobby.id)
    setTrades([])
    setTimeLeft(params.roundDuration)
  }


  const postQuote = async () => {
    if (!myPlayerId || !myAssignedSuit || !lobby) return
    const bid = parseInt(bidInput)
    const ask = parseInt(askInput)
    if (isNaN(bid) || isNaN(ask)) { setError('Enter valid numbers'); return }
    if (bid < 0 || ask < 0) { setError('Prices must be non-negative'); return }
    if (bid >= ask) { setError('Bid must be less than ask'); return }
    if (ask - bid > params.maxSpread) { setError(`Spread cannot exceed ${params.maxSpread}`); return }
    setError(null)
    await supabase.from('figgie_market_players')
      .update({ quote_bid: bid, quote_ask: ask, quote_suit: myAssignedSuit, last_quote_time: new Date().toISOString() })
      .eq('id', myPlayerId)
  }

  const hitBid = async (seller: PlayerData) => {
    if (!myPlayerId || !lobby || !seller.quote_bid || !seller.quote_suit) return
    if (myPlayerId === seller.id) return
    const me = players.find(p => p.id === myPlayerId)
    if (!me || !me.hand || me.hand[seller.quote_suit] <= 0) { setError('You have no cards of that suit to sell'); return }
    const price = seller.quote_bid
    const suit = seller.quote_suit
    setError(null)
    const newMyHand = { ...me.hand, [suit]: me.hand[suit] - 1 }
    const sellerHand = seller.hand ? { ...seller.hand, [suit]: seller.hand[suit] + 1 } : null
    await supabase.from('figgie_market_players').update({ hand: newMyHand, cash: me.cash + price, trade_volume: me.trade_volume + 1 }).eq('id', myPlayerId)
    await supabase.from('figgie_market_players').update({ hand: sellerHand, cash: seller.cash - price, trade_volume: seller.trade_volume + 1, quote_bid: null, quote_ask: null, quote_suit: null }).eq('id', seller.id)
    await supabase.from('figgie_market_trades').insert({ lobby_id: lobby.id, buyer_name: seller.name, seller_name: me.name, suit, price })
  }

  const liftAsk = async (buyer: PlayerData) => {
    if (!myPlayerId || !lobby || !buyer.quote_ask || !buyer.quote_suit) return
    if (myPlayerId === buyer.id) return
    const me = players.find(p => p.id === myPlayerId)
    if (!me || me.cash < buyer.quote_ask) { setError('Insufficient cash'); return }
    const suit = buyer.quote_suit
    const price = buyer.quote_ask
    const quoter = buyer
    if (!quoter.hand || quoter.hand[suit] <= 0) { setError('Quoter has no cards to sell'); return }
    setError(null)
    const newMyHand = me.hand ? { ...me.hand, [suit]: me.hand[suit] + 1 } : null
    const quoterHand = { ...quoter.hand, [suit]: quoter.hand[suit] - 1 }
    await supabase.from('figgie_market_players').update({ hand: newMyHand, cash: me.cash - price, trade_volume: me.trade_volume + 1 }).eq('id', myPlayerId)
    await supabase.from('figgie_market_players').update({ hand: quoterHand, cash: quoter.cash + price, trade_volume: quoter.trade_volume + 1, quote_bid: null, quote_ask: null, quote_suit: null }).eq('id', quoter.id)
    await supabase.from('figgie_market_trades').insert({ lobby_id: lobby.id, buyer_name: me.name, seller_name: quoter.name, suit, price })
  }

  const endRound = useCallback(async () => {
    if (!lobby || lobby.phase !== 'trading') return
    const { data: pls } = await supabase.from('figgie_market_players').select('*').eq('lobby_id', lobby.id)
    if (!pls) return
    const totalVolume = pls.reduce((s, p) => s + p.trade_volume, 0)
    const pot = lobby.penalty_pot
    for (const p of pls) {
      const cardValue = (p.hand as Record<Suit, number>)?.[lobby.goal_suit!] * params.goalCardValue || 0
      const potShare = totalVolume > 0 ? (p.trade_volume / totalVolume) * pot : pot / pls.length
      const roundScore = p.cash + cardValue + potShare - params.startingCash
      await supabase.from('figgie_market_players')
        .update({ total_score: p.total_score + roundScore })
        .eq('id', p.id)
    }
    await supabase.from('figgie_market_lobbies').update({ phase: 'results' }).eq('id', lobby.id)
  }, [lobby, params])


  return (
    <div className="min-h-screen bg-white">
      <div className="border-b-2 border-dotted border-blue-500 pb-6 pt-10 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1.2rem', color: '#4169E1', letterSpacing: '0.05em' }}>
            FIGGIE MARKET
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
            Spread obligation trading game &bull; {params.penaltyInterval}s quote timer &bull; Max spread: {params.maxSpread}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-6">
        {error && (
          <div className="mb-4 p-3 border-2 border-dotted border-red-300 bg-red-50 rounded text-sm text-red-700" style={{ fontFamily: 'Georgia, serif' }}>{error}</div>
        )}

        {phase === 'join' && (
          <div className="max-w-lg mx-auto space-y-6">
            {/* Rules toggle */}
            <div className="border-2 border-dotted border-blue-200 rounded-lg overflow-hidden">
              <button onClick={() => setShowRules(!showRules)} className="w-full flex justify-between items-center px-5 py-3 hover:bg-blue-50/50 transition-colors">
                <span className="text-xs text-blue-600" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>RULES</span>
                <svg className={`w-4 h-4 text-blue-400 transition-transform ${showRules ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showRules && (
                <div className="px-5 pb-5 space-y-3 text-sm text-gray-600 border-t-2 border-dotted border-blue-100 pt-3" style={{ fontFamily: 'Georgia, serif' }}>
                  <p><strong>Setup:</strong> A 40-card deck has 4 suits with asymmetric counts (12, 10, 10, 8). One suit is the "goal suit" — it's the partner of the 12-card suit. Partners: ♠↔♣, ♥↔♦.</p>
                  <p><strong>Hands:</strong> Cards are dealt evenly. You see only your own hand and must infer the goal suit from the distribution.</p>
                  <p><strong>Market Making:</strong> Each player is randomly assigned a suit they must continuously quote (post a bid and ask). If you fail to maintain a live quote for <strong>{params.penaltyInterval} seconds</strong>, ${params.penaltyAmount} drains from your cash into the penalty pot.</p>
                  <p><strong>Spread Constraint:</strong> Your ask minus bid cannot exceed <strong>{params.maxSpread}</strong>. This forces tight, informative prices.</p>
                  <p><strong>Trading:</strong> Other players can hit your bid (sell to you) or lift your ask (buy from you). When your quote is filled, it clears — you must re-quote within the penalty window.</p>
                  <p><strong>Scoring:</strong> After {params.roundDuration}s, each goal-suit card is worth <strong>${params.goalCardValue}</strong>. The penalty pot is distributed proportionally by trade volume. Your P&L = cash + card value + pot share − starting cash.</p>
                  <p><strong>Strategy:</strong> Information leaks through your quotes. If you know the goal suit, you must still quote it tightly — revealing your edge. Trade actively to earn pot share.</p>
                </div>
              )}
            </div>

            {/* Game parameters */}
            <div className="border-2 border-dotted border-gray-200 rounded-lg p-5 space-y-4">
              <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>GAME PARAMETERS</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1" style={{ fontFamily: 'Georgia, serif' }}>Penalty timer (s)</label>
                  <input type="number" value={params.penaltyInterval} onChange={e => setParams(p => ({ ...p, penaltyInterval: Math.max(1, parseInt(e.target.value) || 14) }))}
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1" style={{ fontFamily: 'Georgia, serif' }}>Penalty drain ($)</label>
                  <input type="number" value={params.penaltyAmount} onChange={e => setParams(p => ({ ...p, penaltyAmount: Math.max(1, parseInt(e.target.value) || 2) }))}
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1" style={{ fontFamily: 'Georgia, serif' }}>Max spread</label>
                  <input type="number" value={params.maxSpread} onChange={e => setParams(p => ({ ...p, maxSpread: Math.max(1, parseInt(e.target.value) || 4) }))}
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1" style={{ fontFamily: 'Georgia, serif' }}>Starting cash ($)</label>
                  <input type="number" value={params.startingCash} onChange={e => setParams(p => ({ ...p, startingCash: Math.max(10, parseInt(e.target.value) || 100) }))}
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1" style={{ fontFamily: 'Georgia, serif' }}>Round duration (s)</label>
                  <input type="number" value={params.roundDuration} onChange={e => setParams(p => ({ ...p, roundDuration: Math.max(30, parseInt(e.target.value) || 180) }))}
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1" style={{ fontFamily: 'Georgia, serif' }}>Goal card value ($)</label>
                  <input type="number" value={params.goalCardValue} onChange={e => setParams(p => ({ ...p, goalCardValue: Math.max(1, parseInt(e.target.value) || 10) }))}
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <button onClick={() => setParams(DEFAULT_PARAMS)} className="text-xs text-blue-500 hover:text-blue-700 underline" style={{ fontFamily: 'Georgia, serif' }}>
                Reset to defaults
              </button>
            </div>

            {/* Lobby creation / join */}
            <div className="border-2 border-dotted border-gray-200 rounded-lg p-6 space-y-4">
              <input type="text" placeholder="Your name" value={playerName} onChange={e => setPlayerName(e.target.value)}
                className="w-full border-2 border-dotted border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" style={{ fontFamily: 'Georgia, serif' }} />
              <div className="border-t-2 border-dotted border-gray-200 pt-4">
                <p className="text-xs text-gray-400 mb-3" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>CREATE LOBBY</p>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setNumPlayers(4)} className={`px-3 py-1.5 rounded text-xs border-2 border-dotted ${numPlayers === 4 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>4P</button>
                  <button onClick={() => setNumPlayers(5)} className={`px-3 py-1.5 rounded text-xs border-2 border-dotted ${numPlayers === 5 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>5P</button>
                </div>
                <button onClick={createLobby} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>CREATE</button>
              </div>
              <div className="border-t-2 border-dotted border-gray-200 pt-4">
                <p className="text-xs text-gray-400 mb-3" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>JOIN LOBBY</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="CODE" value={lobbyCode} onChange={e => setLobbyCode(e.target.value.toUpperCase())} maxLength={4}
                    className="flex-1 border-2 border-dotted border-gray-300 rounded px-3 py-2 text-sm text-center uppercase tracking-widest focus:outline-none focus:border-blue-500" style={{ fontFamily: '"Press Start 2P", monospace' }} />
                  <button onClick={joinLobby} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>JOIN</button>
                </div>
              </div>
            </div>
          </div>
        )}


        {phase === 'waiting' && lobby && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="border-2 border-dotted border-blue-300 rounded-lg p-6 text-center">
              <p className="text-xs text-gray-400 mb-2" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>LOBBY CODE</p>
              <p className="text-3xl tracking-widest text-blue-600 font-bold" style={{ fontFamily: '"Press Start 2P", monospace' }}>{lobby.code}</p>
            </div>
            <div className="border-2 border-dotted border-gray-200 rounded-lg p-5">
              <p className="text-xs text-gray-400 mb-3" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>PLAYERS ({players.length}/{lobby.num_players})</p>
              <div className="space-y-2">
                {players.map(p => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-2 border-2 border-dotted border-gray-100 rounded">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span style={{ fontFamily: 'Georgia, serif' }} className="text-sm text-gray-700">{p.name}</span>
                    {p.id === myPlayerId && <span className="text-xs text-gray-400">(you)</span>}
                  </div>
                ))}
              </div>
            </div>
            {players.length >= 2 && players[0]?.id === myPlayerId && (
              <button onClick={startRound} className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.55rem' }}>
                START TRADING ROUND
              </button>
            )}
            {players[0]?.id !== myPlayerId && (
              <p className="text-center text-xs text-gray-400" style={{ fontFamily: 'Georgia, serif' }}>Waiting for host to start...</p>
            )}
          </div>
        )}


        {phase === 'trading' && lobby && myPlayer && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>Round {lobby.round}</span>
              <span className={`text-sm font-bold ${timeLeft <= 30 ? 'text-red-600' : 'text-gray-700'}`} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.6rem' }}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-gray-400" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>POT: ${lobby.penalty_pot}</span>
            </div>

            {/* My hand + cash */}
            <div className="border-2 border-dotted border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-400" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>YOUR HAND</p>
                <p className="text-sm font-bold text-green-700" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.55rem' }}>${myPlayer.cash}</p>
              </div>
              <div className="flex gap-6 justify-center">
                {SUITS.map(s => (
                  <div key={s} className="flex flex-col items-center">
                    <span className="text-2xl" style={{ color: SUIT_COLORS[s] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[s]}</span>
                    <span className="text-xl font-bold text-gray-800">{myPlayer.hand?.[s] ?? 0}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-gray-400 mt-2" style={{ fontFamily: 'Georgia, serif' }}>
                You must quote: <span className="font-bold" style={{ color: SUIT_COLORS[myAssignedSuit!] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[myAssignedSuit!]} {myAssignedSuit}</span>
              </p>
            </div>

            {/* Post quote */}
            <div className="border-2 border-dotted border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>
                POST QUOTE ON {SUIT_SYMBOLS[myAssignedSuit!]} (max spread: {params.maxSpread})
              </p>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Bid</label>
                  <input type="number" value={bidInput} onChange={e => setBidInput(e.target.value)} placeholder="0"
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Ask</label>
                  <input type="number" value={askInput} onChange={e => setAskInput(e.target.value)} placeholder="0"
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <button onClick={postQuote} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>QUOTE</button>
              </div>
              {myPlayer.quote_bid !== null && (
                <p className="text-xs text-green-600 mt-2" style={{ fontFamily: 'Georgia, serif' }}>
                  Active: {SUIT_SYMBOLS[myAssignedSuit!]} {myPlayer.quote_bid} / {myPlayer.quote_ask}
                </p>
              )}
            </div>


            {/* Order book */}
            <div className="border-2 border-dotted border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-3" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>LIVE QUOTES</p>
              <div className="space-y-2">
                {players.filter(p => p.quote_bid !== null && p.id !== myPlayerId).map(p => (
                  <div key={p.id} className="flex items-center justify-between border-2 border-dotted border-gray-100 rounded px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" style={{ color: SUIT_COLORS[p.quote_suit!] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[p.quote_suit!]}</span>
                      <span className="text-xs text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => hitBid(p)} className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded border border-red-200 transition-colors" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>
                        SELL @ {p.quote_bid}
                      </button>
                      <span className="text-xs text-gray-400">/</span>
                      <button onClick={() => liftAsk(p)} className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs rounded border border-green-200 transition-colors" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>
                        BUY @ {p.quote_ask}
                      </button>
                    </div>
                  </div>
                ))}
                {players.filter(p => p.quote_bid !== null && p.id !== myPlayerId).length === 0 && (
                  <p className="text-xs text-gray-400 text-center" style={{ fontFamily: 'Georgia, serif' }}>No live quotes from other players</p>
                )}
              </div>
            </div>

            {/* Trade tape */}
            <div className="border-2 border-dotted border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>TRADE TAPE</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {trades.length === 0 && <p className="text-xs text-gray-400" style={{ fontFamily: 'Georgia, serif' }}>No trades yet</p>}
                {trades.map((t, i) => (
                  <div key={i} className="text-xs text-gray-600 flex gap-2" style={{ fontFamily: 'Georgia, serif' }}>
                    <span style={{ color: SUIT_COLORS[t.suit] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[t.suit]}</span>
                    <span>{t.buyer_name} bought from {t.seller_name} @ ${t.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {phase === 'results' && lobby && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-xs text-gray-400" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>ROUND {lobby.round} COMPLETE</p>
              <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: 'Georgia, serif' }}>
                Goal suit was: <span className="font-bold text-lg" style={{ color: SUIT_COLORS[lobby.goal_suit!] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[lobby.goal_suit!]}</span> (worth ${params.goalCardValue}/card)
              </p>
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                Penalty pot: ${lobby.penalty_pot} &bull; distributed by trade volume
              </p>
            </div>

            <div className="border-2 border-dotted border-gray-200 rounded-lg p-5">
              <p className="text-xs text-gray-400 mb-3" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>ROUND RESULTS</p>
              <div className="space-y-3">
                {[...players].sort((a, b) => b.total_score - a.total_score).map((p, i) => {
                  const cardVal = (p.hand as Record<Suit, number>)?.[lobby.goal_suit!] * params.goalCardValue || 0
                  const totalVol = players.reduce((s, pl) => s + pl.trade_volume, 0)
                  const potShare = totalVol > 0 ? (p.trade_volume / totalVol) * lobby.penalty_pot : lobby.penalty_pot / players.length
                  const profit = p.cash + cardVal + potShare - params.startingCash
                  return (
                    <div key={p.id} className={`border-2 border-dotted rounded-lg p-3 ${i === 0 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100'}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {i === 0 && <span>&#x1F451;</span>}
                          <span className="text-sm text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>{p.name}</span>
                          {p.id === myPlayerId && <span className="text-xs text-gray-400">(you)</span>}
                        </div>
                        <span className={`font-bold text-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>
                          {profit >= 0 ? '+' : ''}{profit.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>
                        <span>Cards: +${cardVal}</span>
                        <span>Cash: ${p.cash}</span>
                        <span>Pot: +${potShare.toFixed(0)}</span>
                        <span>Vol: {p.trade_volume}</span>
                        <span className="text-red-400">Penalty: -${p.penalty_drained}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="border-2 border-dotted border-gray-200 rounded-lg p-5">
              <p className="text-xs text-gray-400 mb-3" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>LEADERBOARD (CUMULATIVE)</p>
              <div className="space-y-2">
                {[...players].sort((a, b) => b.total_score - a.total_score).map((p, i) => (
                  <div key={p.id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>{i + 1}. {p.name}</span>
                    <span className="text-sm font-bold text-gray-800" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>{p.total_score.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>

            {players[0]?.id === myPlayerId && (
              <button onClick={startRound} className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.55rem' }}>
                NEXT ROUND
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
