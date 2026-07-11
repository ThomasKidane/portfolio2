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
type GameMode = 'classic' | 'fullMarket'

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
  game_mode: GameMode | null
}

interface QuoteEntry {
  bid?: number
  ask?: number
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
  quotes: Record<Suit, QuoteEntry | null> | null
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
  ante: number
  totalRounds: number
}

const DEFAULT_PARAMS: GameParams = {
  penaltyInterval: 14,
  penaltyAmount: 2,
  maxSpread: MAX_SPREAD,
  startingCash: STARTING_CASH,
  roundDuration: 180,
  goalCardValue: GOAL_CARD_VALUE,
  ante: 10,
  totalRounds: 5,
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
  const [quoteSuit, setQuoteSuit] = useState<Suit>('S')
  const [params, setParams] = useState<GameParams>(DEFAULT_PARAMS)
  const [paramInputs, setParamInputs] = useState({
    penaltyInterval: String(DEFAULT_PARAMS.penaltyInterval),
    penaltyAmount: String(DEFAULT_PARAMS.penaltyAmount),
    maxSpread: String(DEFAULT_PARAMS.maxSpread),
    startingCash: String(DEFAULT_PARAMS.startingCash),
    roundDuration: String(DEFAULT_PARAMS.roundDuration),
    goalCardValue: String(DEFAULT_PARAMS.goalCardValue),
    ante: String(DEFAULT_PARAMS.ante),
    totalRounds: String(DEFAULT_PARAMS.totalRounds),
  })

  const commitParams = () => {
    setParams({
      penaltyInterval: Math.max(1, parseInt(paramInputs.penaltyInterval) || DEFAULT_PARAMS.penaltyInterval),
      penaltyAmount: Math.max(1, parseInt(paramInputs.penaltyAmount) || DEFAULT_PARAMS.penaltyAmount),
      maxSpread: Math.max(1, parseInt(paramInputs.maxSpread) || DEFAULT_PARAMS.maxSpread),
      startingCash: Math.max(10, parseInt(paramInputs.startingCash) || DEFAULT_PARAMS.startingCash),
      roundDuration: Math.max(30, parseInt(paramInputs.roundDuration) || DEFAULT_PARAMS.roundDuration),
      goalCardValue: Math.max(1, parseInt(paramInputs.goalCardValue) || DEFAULT_PARAMS.goalCardValue),
      ante: Math.max(0, parseInt(paramInputs.ante) || DEFAULT_PARAMS.ante),
      totalRounds: Math.max(1, parseInt(paramInputs.totalRounds) || DEFAULT_PARAMS.totalRounds),
    })
  }
  const [showRules, setShowRules] = useState(false)
  const [prevScores, setPrevScores] = useState<Record<string, number>>({})
  const [gameMode, setGameMode] = useState<GameMode>('classic')
  const [initialHands, setInitialHands] = useState<Record<string, Record<Suit, number>>>({})
  const [quoteTimer, setQuoteTimer] = useState<number>(20)
  const [replayIndex, setReplayIndex] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const penaltyRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const quoteTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const myPlayer = players.find(p => p.id === myPlayerId)
  const myAssignedSuit = lobby?.suit_assignments && myPlayerId
    ? lobby.suit_assignments[myPlayerId] : null

  // Persist session to localStorage so refresh doesn't kick you out
  useEffect(() => {
    if (lobby && myPlayerId) {
      localStorage.setItem('figgie-market-session', JSON.stringify({ lobbyId: lobby.id, playerId: myPlayerId, playerName, gameMode }))
    }
  }, [lobby?.id, myPlayerId, playerName])

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem('figgie-market-session')
    if (!saved) return
    try {
      const { lobbyId, playerId, playerName: savedName, gameMode: savedMode } = JSON.parse(saved)
      if (lobbyId && playerId) {
        setPlayerName(savedName || '')
        if (savedMode) setGameMode(savedMode)
        // Re-fetch lobby and player data
        supabase.from('figgie_market_lobbies').select('*').eq('id', lobbyId).single()
          .then(({ data: lobbyData }) => {
            if (!lobbyData) { localStorage.removeItem('figgie-market-session'); return }
            setLobby(lobbyData)
            setMyPlayerId(playerId)
            supabase.from('figgie_market_players').select('*').eq('lobby_id', lobbyId).order('joined_at')
              .then(({ data: playersData }) => {
                if (playersData) setPlayers(playersData)
              })
            supabase.from('figgie_market_trades').select('*').eq('lobby_id', lobbyId).order('created_at', { ascending: false }).limit(50)
              .then(({ data: tradesData }) => {
                if (tradesData) setTrades(tradesData)
              })
            if (lobbyData.phase === 'waiting') setPhase('waiting')
            else if (lobbyData.phase === 'trading') setPhase('trading')
            else if (lobbyData.phase === 'results') setPhase('results')
          })
      }
    } catch { localStorage.removeItem('figgie-market-session') }
  }, [])

  // Penalty countdown timer state
  const [penaltyCountdown, setPenaltyCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (!lobby?.id) return
    const channel = supabase
      .channel(`market-${lobby.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'figgie_market_lobbies', filter: `id=eq.${lobby.id}` },
        (payload) => { if (payload.new) setLobby(payload.new as LobbyData) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'figgie_market_players', filter: `lobby_id=eq.${lobby.id}` },
        () => { fetchPlayers() })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'figgie_market_trades', filter: `lobby_id=eq.${lobby.id}` },
        (payload) => {
          if (payload.new) {
            const trade = payload.new as TradeRecord
            setTrades(prev => [trade, ...prev].slice(0, 200))
            // Full Market mode: +5s when your quote gets traded
            if (gameMode === 'fullMarket') {
              const me = players.find(p => p.id === myPlayerId)
              if (me && (trade.buyer_name === me.name || trade.seller_name === me.name)) {
                setQuoteTimer(prev => prev + 5)
              }
            }
          }
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [lobby?.id])

  // Sync game mode from lobby data (so all players play same mode)
  useEffect(() => {
    if (lobby?.game_mode) setGameMode(lobby.game_mode)
  }, [lobby?.game_mode])

  useEffect(() => {
    if (!lobby) return
    if (lobby.phase === 'waiting') setPhase('waiting')
    else if (lobby.phase === 'trading') {
      setPhase('trading')
      // Save initial hands for delta display (for non-host players joining the round)
      if (players.length > 0) {
        const currentInitHands = initialHands
        const roundChanged = players.some(p => p.hand && (!currentInitHands[p.id] || p.trade_volume === 0))
        if (Object.keys(currentInitHands).length === 0 || roundChanged) {
          const initH: Record<string, Record<Suit, number>> = {}
          players.forEach(p => { if (p.hand) initH[p.id] = { ...p.hand } })
          if (Object.keys(initH).length > 0) setInitialHands(initH)
        }
      }
    }
    else if (lobby.phase === 'results') {
      setPhase('results')
      // Fetch full trade history and fresh player data for accurate results
      supabase.from('figgie_market_trades').select('*').eq('lobby_id', lobby.id).order('created_at', { ascending: false }).limit(200)
        .then(({ data }) => { if (data) setTrades(data) })
      fetchPlayers()
    }
  }, [lobby?.phase, lobby?.round])

  const endRoundCalledRef = useRef(false)

  useEffect(() => {
    if (phase !== 'trading' || !lobby?.round_start_time) return
    endRoundCalledRef.current = false
    const roundMs = params.roundDuration * 1000
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - new Date(lobby.round_start_time!).getTime()
      const remaining = Math.max(0, Math.ceil((roundMs - elapsed) / 1000))
      setTimeLeft(remaining)
      if (remaining <= 0 && !endRoundCalledRef.current) {
        endRoundCalledRef.current = true
        endRound()
      }
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, lobby?.round_start_time])

  useEffect(() => {
    if (phase !== 'trading' || !myPlayerId || !myAssignedSuit || gameMode !== 'classic') return
    const penaltyIntervalMs = params.penaltyInterval * 1000
    penaltyRef.current = setInterval(async () => {
      const me = players.find(p => p.id === myPlayerId)
      if (!me) return
      const hasAssignedQuote = me.quotes?.[myAssignedSuit] != null
      if (hasAssignedQuote) { setPenaltyCountdown(null); return }
      const lastTime = me.last_quote_time ? new Date(me.last_quote_time).getTime() : (lobby?.round_start_time ? new Date(lobby.round_start_time).getTime() : Date.now())
      const elapsed = Date.now() - lastTime
      const remaining = Math.max(0, Math.ceil((penaltyIntervalMs - elapsed) / 1000))
      setPenaltyCountdown(remaining)
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
    }, 1000)
    return () => { if (penaltyRef.current) clearInterval(penaltyRef.current) }
  }, [phase, myPlayerId, myAssignedSuit, players])

  // Full Market mode: quote timer (20s base, +5s per trade received)
  useEffect(() => {
    if (phase !== 'trading' || gameMode !== 'fullMarket' || !myPlayerId) return
    quoteTimerRef.current = setInterval(() => {
      setQuoteTimer(prev => {
        if (prev <= 0) return 0
        return prev - 1
      })
    }, 1000)
    return () => { if (quoteTimerRef.current) clearInterval(quoteTimerRef.current) }
  }, [phase, gameMode, myPlayerId])

  // Full Market: apply penalty every penalty interval while timer is at 0 and obligations unmet
  const fullMarketPenaltyRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (gameMode !== 'fullMarket' || phase !== 'trading' || !myPlayerId || quoteTimer > 0) {
      if (fullMarketPenaltyRef.current) { clearInterval(fullMarketPenaltyRef.current); fullMarketPenaltyRef.current = null }
      return
    }
    fullMarketPenaltyRef.current = setInterval(async () => {
      const me = players.find(p => p.id === myPlayerId)
      if (!me || !me.hand) return
      const missingQuotes = SUITS.some(s => {
        const hasCards = me.hand![s] > 0
        const quote = me.quotes?.[s]
        if (hasCards) return !quote || quote.bid == null || quote.ask == null
        return !quote || (quote.bid == null && quote.ask == null)
      })
      if (missingQuotes) {
        const newDrained = me.penalty_drained + params.penaltyAmount
        const newCash = me.cash - params.penaltyAmount
        await supabase.from('figgie_market_players')
          .update({ penalty_drained: newDrained, cash: newCash })
          .eq('id', myPlayerId)
        await supabase.from('figgie_market_lobbies')
          .update({ penalty_pot: (lobby?.penalty_pot || 0) + params.penaltyAmount })
          .eq('id', lobby?.id)
      }
    }, params.penaltyInterval * 1000)
    return () => { if (fullMarketPenaltyRef.current) clearInterval(fullMarketPenaltyRef.current) }
  }, [quoteTimer, phase, gameMode, myPlayerId])


  const fetchPlayers = async () => {
    if (!lobby?.id) return
    const { data } = await supabase.from('figgie_market_players').select('*').eq('lobby_id', lobby.id).order('joined_at')
    if (data) setPlayers(data)
  }

  const leaveGame = () => {
    localStorage.removeItem('figgie-market-session')
    setLobby(null)
    setMyPlayerId(null)
    setPlayers([])
    setTrades([])
    setPhase('join')
  }

  const createLobby = async () => {
    if (!playerName.trim()) { setError('Enter your name'); return }
    setError(null)
    const code = generateCode()
    const { data: lobbyData, error: err } = await supabase
      .from('figgie_market_lobbies')
      .insert({ code, num_players: numPlayers, phase: 'waiting', round: 0, penalty_pot: 0, game_mode: gameMode })
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
    const scores: Record<string, number> = {}
    players.forEach(p => { scores[p.id] = p.total_score })
    setPrevScores(scores)
    const { assignment, hands, goalSuit } = dealMarketHands(lobby.num_players)
    const playerIds = players.map(p => p.id)
    const suitAssignments = assignMarketSuits(playerIds, lobby.num_players)
    const cashAfterAnte = params.startingCash - params.ante
    // Save initial hands for delta display
    const initHands: Record<string, Record<Suit, number>> = {}
    for (let i = 0; i < players.length; i++) {
      initHands[players[i].id] = { ...hands[i] }
      await supabase.from('figgie_market_players')
        .update({ hand: hands[i], cash: cashAfterAnte, trade_volume: 0, penalty_drained: 0, quote_bid: null, quote_ask: null, quote_suit: null, quotes: {}, last_quote_time: null })
        .eq('id', players[i].id)
    }
    setInitialHands(initHands)
    const antePot = params.ante * players.length
    await supabase.from('figgie_market_lobbies')
      .update({ phase: 'trading', round: lobby.round + 1, deck_assignment: assignment, goal_suit: goalSuit, round_start_time: new Date().toISOString(), suit_assignments: suitAssignments, penalty_pot: antePot })
      .eq('id', lobby.id)
    setTrades([])
    setTimeLeft(params.roundDuration)
    setQuoteTimer(20)
    setReplayIndex(null)
  }

  const resetAndStart = async () => {
    if (!lobby) return
    for (const p of players) {
      await supabase.from('figgie_market_players').update({ total_score: 0 }).eq('id', p.id)
    }
    await supabase.from('figgie_market_lobbies').update({ round: 0 }).eq('id', lobby.id)
    await startRound()
  }


  const postQuote = async () => {
    if (!myPlayerId || !lobby) return
    const bid = bidInput.trim() !== '' ? parseInt(bidInput) : null
    const ask = askInput.trim() !== '' ? parseInt(askInput) : null
    if (bid === null && ask === null) { setError('Enter at least a bid or ask'); return }
    if (bid !== null && bid < 0) { setError('Bid must be non-negative'); return }
    if (ask !== null && ask < 0) { setError('Ask must be non-negative'); return }
    if (bid !== null && ask !== null) {
      if (bid >= ask) { setError('Bid must be less than ask'); return }
      if (ask - bid > params.maxSpread) { setError(`Spread cannot exceed ${params.maxSpread}`); return }
    }
    const me = players.find(p => p.id === myPlayerId)
    if (!me) return
    if (ask !== null && me.hand && me.hand[quoteSuit] <= 0) { setError(`You have no ${SUIT_SYMBOLS[quoteSuit]} cards to sell — remove ask or post bid-only`); return }
    if (bid !== null && me.cash < bid) { setError(`Insufficient cash to back bid of $${bid}`); return }
    // Full Market: must provide two-sided quote for suits you hold
    if (gameMode === 'fullMarket' && me.hand && me.hand[quoteSuit] > 0) {
      if (bid === null || ask === null) { setError(`Full Market: two-sided quote required for ${SUIT_SYMBOLS[quoteSuit]} (you hold cards)`); return }
    }
    setError(null)
    const currentQuotes = me?.quotes || {}
    const quoteEntry: { bid?: number; ask?: number } = {}
    if (bid !== null) quoteEntry.bid = bid
    if (ask !== null) quoteEntry.ask = ask
    const updatedQuotes = { ...currentQuotes, [quoteSuit]: quoteEntry }
    const isAssignedSuit = quoteSuit === myAssignedSuit
    await supabase.from('figgie_market_players')
      .update({
        quotes: updatedQuotes,
        ...(isAssignedSuit ? { last_quote_time: new Date().toISOString() } : {}),
      })
      .eq('id', myPlayerId)
  }

  const cancelQuote = async (suit: Suit) => {
    if (!myPlayerId) return
    const me = players.find(p => p.id === myPlayerId)
    const currentQuotes = { ...(me?.quotes || {}) }
    delete currentQuotes[suit]
    await supabase.from('figgie_market_players')
      .update({ quotes: currentQuotes })
      .eq('id', myPlayerId)
  }

  const hitBid = async (quoter: PlayerData, suit: Suit) => {
    if (!myPlayerId || !lobby) return
    if (myPlayerId === quoter.id) return
    const quote = quoter.quotes?.[suit]
    if (!quote) return
    const me = players.find(p => p.id === myPlayerId)
    if (!me || !me.hand || me.hand[suit] <= 0) { setError('You have no cards of that suit to sell'); return }
    const price = quote.bid
    setError(null)
    const newMyHand = { ...me.hand, [suit]: me.hand[suit] - 1 }
    const quoterHand = quoter.hand ? { ...quoter.hand, [suit]: quoter.hand[suit] + 1 } : null
    const quoterQuotes = { ...(quoter.quotes || {}) }
    delete quoterQuotes[suit]
    await supabase.from('figgie_market_players').update({ hand: newMyHand, cash: me.cash + price, trade_volume: me.trade_volume + 1 }).eq('id', myPlayerId)
    await supabase.from('figgie_market_players').update({ hand: quoterHand, cash: quoter.cash - price, trade_volume: quoter.trade_volume + 1, quotes: quoterQuotes }).eq('id', quoter.id)
    await supabase.from('figgie_market_trades').insert({ lobby_id: lobby.id, buyer_name: quoter.name, seller_name: me.name, suit, price })
  }

  const liftAsk = async (quoter: PlayerData, suit: Suit) => {
    if (!myPlayerId || !lobby) return
    if (myPlayerId === quoter.id) return
    const quote = quoter.quotes?.[suit]
    if (!quote) return
    const me = players.find(p => p.id === myPlayerId)
    if (!me || me.cash < quote.ask) { setError('Insufficient cash'); return }
    const price = quote.ask
    if (!quoter.hand || quoter.hand[suit] <= 0) { setError('Quoter has no cards to sell'); return }
    setError(null)
    const newMyHand = me.hand ? { ...me.hand, [suit]: me.hand[suit] + 1 } : null
    const quoterHand = { ...quoter.hand, [suit]: quoter.hand[suit] - 1 }
    const quoterQuotes = { ...(quoter.quotes || {}) }
    delete quoterQuotes[suit]
    await supabase.from('figgie_market_players').update({ hand: newMyHand, cash: me.cash - price, trade_volume: me.trade_volume + 1 }).eq('id', myPlayerId)
    await supabase.from('figgie_market_players').update({ hand: quoterHand, cash: quoter.cash + price, trade_volume: quoter.trade_volume + 1, quotes: quoterQuotes }).eq('id', quoter.id)
    await supabase.from('figgie_market_trades').insert({ lobby_id: lobby.id, buyer_name: me.name, seller_name: quoter.name, suit, price })
  }

  const endRound = useCallback(async () => {
    if (!lobby || lobby.phase !== 'trading') return
    // Only the host (first player) should execute scoring to prevent duplication
    if (players[0]?.id !== myPlayerId) return
    const { data: pls } = await supabase.from('figgie_market_players').select('*').eq('lobby_id', lobby.id)
    if (!pls) return
    // Fetch fresh lobby to get accurate penalty_pot
    const { data: freshLobby } = await supabase.from('figgie_market_lobbies').select('*').eq('id', lobby.id).single()
    if (!freshLobby) return
    const pot = freshLobby.penalty_pot
    const goalCounts = pls.map(p => (p.hand as Record<Suit, number>)?.[freshLobby.goal_suit!] || 0)
    const maxGoal = Math.max(...goalCounts)
    const winners = pls.filter(p => ((p.hand as Record<Suit, number>)?.[freshLobby.goal_suit!] || 0) === maxGoal)
    const potPerWinner = pot / winners.length

    for (const p of pls) {
      const cardValue = ((p.hand as Record<Suit, number>)?.[freshLobby.goal_suit!] || 0) * params.goalCardValue
      const isWinner = ((p.hand as Record<Suit, number>)?.[freshLobby.goal_suit!] || 0) === maxGoal
      const potShare = isWinner ? potPerWinner : 0
      const roundScore = p.cash + cardValue + potShare - params.startingCash
      await supabase.from('figgie_market_players')
        .update({ total_score: p.total_score + roundScore })
        .eq('id', p.id)
    }
    await supabase.from('figgie_market_lobbies').update({ phase: 'results' }).eq('id', lobby.id)
  }, [lobby, params, players, myPlayerId])


  return (
    <div className="min-h-screen bg-white">
      <div className="border-b-2 border-dotted border-blue-500 pb-6 pt-10 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1.2rem', color: '#4169E1', letterSpacing: '0.05em' }}>
              FIGGIE MARKET
            </h1>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
              Spread obligation trading game &bull; {params.penaltyInterval}s quote timer &bull; Max spread: {params.maxSpread}
            </p>
          </div>
          {phase !== 'join' && (
            <button onClick={leaveGame} className="px-3 py-1.5 border-2 border-dotted border-red-300 text-red-500 hover:bg-red-50 text-xs rounded transition-colors" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>
              LEAVE
            </button>
          )}
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
                  <p><strong>Ante:</strong> Each player puts <strong>${params.ante}</strong> into the pot at the start of each round. The pot (ante + accumulated penalties) is awarded to the player with the most goal suit cards at settlement. Ties split evenly.</p>
                  <p><strong>Scoring:</strong> After {params.roundDuration}s, each goal-suit card is worth <strong>${params.goalCardValue}</strong>. The pot goes to whoever holds the most goal cards. Your P&L = cash + card value + pot share − (starting cash − ante).</p>
                  <p><strong>Strategy:</strong> Information leaks through your quotes. If you know the goal suit, you must still quote it tightly — revealing your edge. Trade actively to earn pot share.</p>
                </div>
              )}
            </div>

            {/* Game mode selector */}
            <div className="border-2 border-dotted border-purple-200 rounded-lg p-5 space-y-3">
              <p className="text-xs text-purple-600 mb-1" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>GAME MODE</p>
              <div className="flex gap-3">
                <button onClick={() => setGameMode('classic')}
                  className={`flex-1 px-4 py-3 rounded border-2 border-dotted text-xs transition-colors ${gameMode === 'classic' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
                  style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>
                  CLASSIC
                </button>
                <button onClick={() => setGameMode('fullMarket')}
                  className={`flex-1 px-4 py-3 rounded border-2 border-dotted text-xs transition-colors ${gameMode === 'fullMarket' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
                  style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>
                  FULL MARKET
                </button>
              </div>
              <p className="text-xs text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>
                {gameMode === 'classic'
                  ? 'Each player is assigned one suit to quote. Penalty every interval without a quote on your assigned suit.'
                  : 'Two-sided market required for all suits you hold. One-sided for empty suits. 20s to quote all, +5s per trade on your quotes.'}
              </p>
            </div>

            {/* Game parameters */}
            <div className="border-2 border-dotted border-gray-200 rounded-lg p-5 space-y-4">
              <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>GAME PARAMETERS</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1" style={{ fontFamily: 'Georgia, serif' }}>Penalty timer (s)</label>
                  <input type="text" value={paramInputs.penaltyInterval} onChange={e => setParamInputs(p => ({ ...p, penaltyInterval: e.target.value }))} onBlur={commitParams}
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1" style={{ fontFamily: 'Georgia, serif' }}>Penalty drain ($)</label>
                  <input type="text" value={paramInputs.penaltyAmount} onChange={e => setParamInputs(p => ({ ...p, penaltyAmount: e.target.value }))} onBlur={commitParams}
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1" style={{ fontFamily: 'Georgia, serif' }}>Max spread</label>
                  <input type="text" value={paramInputs.maxSpread} onChange={e => setParamInputs(p => ({ ...p, maxSpread: e.target.value }))} onBlur={commitParams}
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1" style={{ fontFamily: 'Georgia, serif' }}>Starting cash ($)</label>
                  <input type="text" value={paramInputs.startingCash} onChange={e => setParamInputs(p => ({ ...p, startingCash: e.target.value }))} onBlur={commitParams}
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1" style={{ fontFamily: 'Georgia, serif' }}>Round duration (s)</label>
                  <input type="text" value={paramInputs.roundDuration} onChange={e => setParamInputs(p => ({ ...p, roundDuration: e.target.value }))} onBlur={commitParams}
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1" style={{ fontFamily: 'Georgia, serif' }}>Goal card value ($)</label>
                  <input type="text" value={paramInputs.goalCardValue} onChange={e => setParamInputs(p => ({ ...p, goalCardValue: e.target.value }))} onBlur={commitParams}
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1" style={{ fontFamily: 'Georgia, serif' }}>Ante per player ($)</label>
                  <input type="text" value={paramInputs.ante} onChange={e => setParamInputs(p => ({ ...p, ante: e.target.value }))} onBlur={commitParams}
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1" style={{ fontFamily: 'Georgia, serif' }}>Total rounds</label>
                  <input type="text" value={paramInputs.totalRounds} onChange={e => setParamInputs(p => ({ ...p, totalRounds: e.target.value }))} onBlur={commitParams}
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <button onClick={() => { setParams(DEFAULT_PARAMS); setParamInputs({ penaltyInterval: String(DEFAULT_PARAMS.penaltyInterval), penaltyAmount: String(DEFAULT_PARAMS.penaltyAmount), maxSpread: String(DEFAULT_PARAMS.maxSpread), startingCash: String(DEFAULT_PARAMS.startingCash), roundDuration: String(DEFAULT_PARAMS.roundDuration), goalCardValue: String(DEFAULT_PARAMS.goalCardValue), ante: String(DEFAULT_PARAMS.ante), totalRounds: String(DEFAULT_PARAMS.totalRounds) }) }} className="text-xs text-blue-500 hover:text-blue-700 underline" style={{ fontFamily: 'Georgia, serif' }}>
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
            <div className="text-center">
              <span className={`text-xs px-3 py-1 rounded ${gameMode === 'fullMarket' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>
                MODE: {gameMode === 'fullMarket' ? 'FULL MARKET' : 'CLASSIC'}
              </span>
            </div>
            {players[0]?.id !== myPlayerId && (
              <p className="text-center text-xs text-gray-400" style={{ fontFamily: 'Georgia, serif' }}>Waiting for host to start...</p>
            )}
          </div>
        )}


        {phase === 'trading' && lobby && myPlayer && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>Round {lobby.round}/{params.totalRounds}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${gameMode === 'fullMarket' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.35rem' }}>
                  {gameMode === 'fullMarket' ? 'FULL MKT' : 'CLASSIC'}
                </span>
              </div>
              <span className={`text-sm font-bold ${timeLeft <= 30 ? 'text-red-600' : 'text-gray-700'}`} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.6rem' }}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-gray-400" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>POT: ${lobby.penalty_pot}</span>
            </div>

            {/* Penalty countdown warning */}
            {gameMode === 'classic' && penaltyCountdown !== null && penaltyCountdown > 0 && (
              <div className="border-2 border-dotted border-orange-300 bg-orange-50 rounded-lg p-2 text-center">
                <span className="text-xs text-orange-700" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>
                  ⚠ PENALTY IN {penaltyCountdown}s — Quote your {SUIT_SYMBOLS[myAssignedSuit!]} market!
                </span>
              </div>
            )}
            {penaltyCountdown === 0 && gameMode === 'classic' && (
              <div className="border-2 border-dotted border-red-400 bg-red-50 rounded-lg p-2 text-center animate-pulse">
                <span className="text-xs text-red-700" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>
                  💸 DRAINING ${params.penaltyAmount}/interval — Quote {SUIT_SYMBOLS[myAssignedSuit!]} NOW!
                </span>
              </div>
            )}
            {gameMode === 'fullMarket' && quoteTimer <= 5 && quoteTimer > 0 && (
              <div className="border-2 border-dotted border-orange-300 bg-orange-50 rounded-lg p-2 text-center">
                <span className="text-xs text-orange-700" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>
                  ⚠ QUOTE TIMER: {quoteTimer}s — Fill all obligations!
                </span>
              </div>
            )}
            {gameMode === 'fullMarket' && quoteTimer === 0 && (
              <div className="border-2 border-dotted border-red-400 bg-red-50 rounded-lg p-2 text-center animate-pulse">
                <span className="text-xs text-red-700" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>
                  💸 QUOTE EXPIRED — Penalty draining! Fill all markets!
                </span>
              </div>
            )}

            {/* My hand + cash */}
            <div className="border-2 border-dotted border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-400" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>YOUR HAND</p>
                <div className="flex items-center gap-3">
                  {gameMode === 'fullMarket' && (
                    <span className={`text-xs font-bold ${quoteTimer <= 5 ? 'text-red-600 animate-pulse' : 'text-orange-500'}`} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>
                      QT: {quoteTimer}s
                    </span>
                  )}
                  <p className="text-sm font-bold text-green-700" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.55rem' }}>${myPlayer.cash}</p>
                </div>
              </div>
              <div className="flex gap-6 justify-center">
                {SUITS.map(s => {
                  const current = myPlayer.hand?.[s] ?? 0
                  const initial = initialHands[myPlayerId!]?.[s] ?? current
                  const delta = current - initial
                  return (
                    <div key={s} className="flex flex-col items-center">
                      <span className="text-2xl" style={{ color: SUIT_COLORS[s] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[s]}</span>
                      <span className="text-xl font-bold text-gray-800">{current}</span>
                      {delta !== 0 && (
                        <span className={`text-xs font-bold ${delta > 0 ? 'text-green-600' : 'text-red-500'}`} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>
                          {delta > 0 ? '+' : ''}{delta}
                        </span>
                      )}
                      {delta === 0 && <span className="text-xs text-gray-300" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>&nbsp;</span>}
                    </div>
                  )
                })}
              </div>
              {gameMode === 'classic' && (
                <p className="text-xs text-center text-gray-400 mt-2" style={{ fontFamily: 'Georgia, serif' }}>
                  Obligated suit: <span className="font-bold" style={{ color: SUIT_COLORS[myAssignedSuit!] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[myAssignedSuit!]}</span>
                  {myPlayer.quotes?.[myAssignedSuit!] ? <span className="text-green-600 ml-2">&#10003; quoted</span> : <span className="text-red-500 ml-2">&#9888; no quote!</span>}
                </p>
              )}
              {gameMode === 'fullMarket' && (
                <div className="text-xs text-center text-gray-400 mt-2 flex justify-center gap-2 flex-wrap" style={{ fontFamily: 'Georgia, serif' }}>
                  {SUITS.map(s => {
                    const hasCards = (myPlayer.hand?.[s] ?? 0) > 0
                    const quote = myPlayer.quotes?.[s]
                    const hasTwoSided = quote && quote.bid != null && quote.ask != null
                    const hasOneSided = quote && (quote.bid != null || quote.ask != null)
                    const fulfilled = hasCards ? hasTwoSided : hasOneSided
                    return (
                      <span key={s} className={fulfilled ? 'text-green-600' : 'text-red-500'}>
                        <span style={{ color: SUIT_COLORS[s] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[s]}</span>
                        {fulfilled ? '✓' : '✗'}
                        <span className="text-gray-400 text-[9px]">({hasCards ? '2s' : '1s'})</span>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Post quote - any suit - one-sided allowed */}
            <div className="border-2 border-dotted border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>
                POST QUOTE (bid-only, ask-only, or both)
              </p>
              <div className="flex gap-2 items-end">
                <div className="flex gap-1">
                  {SUITS.map(s => (
                    <button key={s} onClick={() => setQuoteSuit(s)}
                      className={`w-8 h-8 rounded flex items-center justify-center text-lg border-2 border-dotted transition-colors ${quoteSuit === s ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      style={{ color: SUIT_COLORS[s] === 'red' ? '#dc2626' : '#1f2937' }}>
                      {SUIT_SYMBOLS[s]}
                    </button>
                  ))}
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Bid</label>
                  <input type="text" inputMode="numeric" value={bidInput} onChange={e => setBidInput(e.target.value)} placeholder="—"
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Ask</label>
                  <input type="text" inputMode="numeric" value={askInput} onChange={e => setAskInput(e.target.value)} placeholder="—"
                    className="w-full border-2 border-dotted border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <button onClick={postQuote} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>QUOTE</button>
              </div>
              {/* My active quotes */}
              {myPlayer.quotes && Object.keys(myPlayer.quotes).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUITS.map(s => {
                    const q = myPlayer.quotes?.[s]
                    if (!q) return null
                    return (
                      <div key={s} className="flex items-center gap-1 px-2 py-1 bg-gray-50 border-2 border-dotted border-gray-200 rounded text-xs">
                        <span style={{ color: SUIT_COLORS[s] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[s]}</span>
                        <span className="text-gray-600">{q.bid ?? '—'}/{q.ask ?? '—'}</span>
                        <button onClick={() => cancelQuote(s)} className="text-red-400 hover:text-red-600 ml-1">&times;</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ALL MARKETS - show all 4 suits simultaneously */}
            <div className="border-2 border-dotted border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-3" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>ALL MARKETS</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {SUITS.map(s => {
                  const quotesForSuit = players.filter(p => p.quotes?.[s])
                  const bids = quotesForSuit.filter(p => p.quotes![s]!.bid != null).sort((a, b) => (b.quotes![s]!.bid || 0) - (a.quotes![s]!.bid || 0))
                  const asks = quotesForSuit.filter(p => p.quotes![s]!.ask != null).sort((a, b) => (a.quotes![s]!.ask || 0) - (b.quotes![s]!.ask || 0))
                  const bestBidPlayer = bids[0]
                  const bestAskPlayer = asks[0]
                  const bestBid = bestBidPlayer?.quotes?.[s]?.bid
                  const bestAsk = bestAskPlayer?.quotes?.[s]?.ask
                  return (
                    <div key={s} className="border-2 border-dotted border-gray-100 rounded-lg p-3">
                      <div className="text-center mb-2">
                        <span className="text-2xl" style={{ color: SUIT_COLORS[s] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[s]}</span>
                      </div>
                      {/* Best bid/ask action buttons */}
                      <div className="space-y-1 mb-2">
                        {bestBid != null && bestBidPlayer && bestBidPlayer.id !== myPlayerId ? (
                          <button onClick={() => hitBid(bestBidPlayer, s)} className="w-full px-1 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs rounded border border-red-200 transition-colors" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>
                            SELL @ {bestBid}
                          </button>
                        ) : bestBid != null ? (
                          <div className="w-full px-1 py-1 bg-gray-50 text-gray-400 text-xs rounded border border-gray-200 text-center" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>BID {bestBid} (you)</div>
                        ) : (
                          <div className="text-xs text-gray-300 py-1 text-center">no bids</div>
                        )}
                        {bestAsk != null && bestAskPlayer && bestAskPlayer.id !== myPlayerId ? (
                          <button onClick={() => liftAsk(bestAskPlayer, s)} className="w-full px-1 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded border border-green-200 transition-colors" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>
                            BUY @ {bestAsk}
                          </button>
                        ) : bestAsk != null ? (
                          <div className="w-full px-1 py-1 bg-gray-50 text-gray-400 text-xs rounded border border-gray-200 text-center" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>ASK {bestAsk} (you)</div>
                        ) : (
                          <div className="text-xs text-gray-300 py-1 text-center">no asks</div>
                        )}
                      </div>
                      {/* Order depth */}
                      <div className="space-y-0.5 max-h-24 overflow-y-auto">
                        {bids.map(p => (
                          <div key={`bid-${p.id}`} className="flex justify-between text-xs px-1">
                            <span className="text-gray-400 truncate max-w-[60px]">{p.name}{p.id === myPlayerId ? '*' : ''}</span>
                            <span className="text-green-600 font-mono">{p.quotes![s]!.bid}</span>
                          </div>
                        ))}
                        {asks.map(p => (
                          <div key={`ask-${p.id}`} className="flex justify-between text-xs px-1">
                            <span className="text-gray-400 truncate max-w-[60px]">{p.name}{p.id === myPlayerId ? '*' : ''}</span>
                            <span className="text-red-600 font-mono">{p.quotes![s]!.ask}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
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
            {lobby.round >= params.totalRounds ? (
              <div className="text-center border-2 border-dotted border-yellow-300 bg-yellow-50 rounded-lg p-6">
                <p className="text-xs text-yellow-600 mb-2" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.55rem' }}>GAME OVER</p>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Georgia, serif' }}>
                  Final round complete ({params.totalRounds} rounds played)
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-gray-400" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>ROUND {lobby.round}/{params.totalRounds} COMPLETE</p>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: 'Georgia, serif' }}>
                Goal suit was: <span className="font-bold text-lg" style={{ color: SUIT_COLORS[lobby.goal_suit!] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[lobby.goal_suit!]}</span> (worth ${params.goalCardValue}/card)
              </p>
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                Pot: ${lobby.penalty_pot} (ante + penalties) &bull; awarded to most goal cards
              </p>
            </div>

            <div className="border-2 border-dotted border-gray-200 rounded-lg p-5">
              <p className="text-xs text-gray-400 mb-3" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>ROUND {lobby.round} RESULTS</p>
              <div className="space-y-3">
                {[...players].sort((a, b) => b.total_score - a.total_score).map((p, i) => {
                  const goalCards = (p.hand as Record<Suit, number>)?.[lobby.goal_suit!] || 0
                  const cardVal = goalCards * params.goalCardValue
                  const maxGoalCards = Math.max(...players.map(pl => (pl.hand as Record<Suit, number>)?.[lobby.goal_suit!] || 0))
                  const winnersCount = players.filter(pl => ((pl.hand as Record<Suit, number>)?.[lobby.goal_suit!] || 0) === maxGoalCards).length
                  const isWinner = goalCards === maxGoalCards
                  const potShare = isWinner ? lobby.penalty_pot / winnersCount : 0
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
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>
                        <span className="text-red-400">Ante: -${params.ante}</span>
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

            {/* Trade Review - Chess style replay */}
            <div className="border-2 border-dotted border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>TRADE REPLAY ({trades.length} trades)</p>
                {trades.length > 0 && (
                  <button
                    onClick={() => setReplayIndex(replayIndex !== null ? null : 0)}
                    className={`px-3 py-1 text-xs rounded border-2 border-dotted transition-colors ${replayIndex !== null ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
                    style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>
                    {replayIndex !== null ? 'EXIT REPLAY' : '▶ REPLAY'}
                  </button>
                )}
              </div>
              {replayIndex !== null && trades.length > 0 && (() => {
                const sortedTrades = [...trades].reverse()
                const currentTrade = sortedTrades[replayIndex]
                // Reconstruct hands at this point: start from initialHands and apply trades up to replayIndex
                const replayHands: Record<string, Record<Suit, number>> = {}
                players.forEach(p => {
                  replayHands[p.name] = { ...(initialHands[p.id] || { S: 0, H: 0, D: 0, C: 0 }) }
                })
                for (let i = 0; i <= replayIndex; i++) {
                  const t = sortedTrades[i]
                  if (replayHands[t.buyer_name]) replayHands[t.buyer_name][t.suit] = (replayHands[t.buyer_name][t.suit] || 0) + 1
                  if (replayHands[t.seller_name]) replayHands[t.seller_name][t.suit] = Math.max(0, (replayHands[t.seller_name][t.suit] || 0) - 1)
                }
                return (
                  <div className="space-y-3">
                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => setReplayIndex(Math.max(0, replayIndex - 1))} disabled={replayIndex === 0}
                        className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-30 hover:bg-gray-50">◀</button>
                      <span className="text-sm font-bold text-gray-700" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>
                        {replayIndex + 1} / {sortedTrades.length}
                      </span>
                      <button onClick={() => setReplayIndex(Math.min(sortedTrades.length - 1, replayIndex + 1))} disabled={replayIndex === sortedTrades.length - 1}
                        className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-30 hover:bg-gray-50">▶</button>
                    </div>
                    {/* Current trade */}
                    <div className="text-center text-sm bg-gray-50 rounded p-2" style={{ fontFamily: 'Georgia, serif' }}>
                      <span className="text-lg" style={{ color: SUIT_COLORS[currentTrade.suit] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[currentTrade.suit]}</span>
                      {' '}<span className="font-semibold text-green-700">{currentTrade.buyer_name}</span> bought from <span className="font-semibold text-red-700">{currentTrade.seller_name}</span> @ <span className="font-bold">${currentTrade.price}</span>
                    </div>
                    {/* Reconstructed hands */}
                    <div className="grid grid-cols-2 gap-2">
                      {players.map(p => {
                        const hand = replayHands[p.name] || { S: 0, H: 0, D: 0, C: 0 }
                        const initH = initialHands[p.id] || { S: 0, H: 0, D: 0, C: 0 }
                        return (
                          <div key={p.id} className={`p-2 rounded border border-dotted ${p.name === currentTrade.buyer_name ? 'border-green-300 bg-green-50' : p.name === currentTrade.seller_name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                            <p className="text-xs font-bold text-gray-700 mb-1" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.35rem' }}>{p.name}</p>
                            <div className="flex gap-2 justify-center">
                              {SUITS.map(s => (
                                <div key={s} className="text-center">
                                  <span className="text-sm" style={{ color: SUIT_COLORS[s] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[s]}</span>
                                  <div className="text-sm font-bold">{hand[s]}</div>
                                  {hand[s] - initH[s] !== 0 && (
                                    <div className={`text-[8px] font-bold ${hand[s] - initH[s] > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                      {hand[s] - initH[s] > 0 ? '+' : ''}{hand[s] - initH[s]}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
              {replayIndex === null && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {trades.length === 0 && <p className="text-xs text-gray-400" style={{ fontFamily: 'Georgia, serif' }}>No trades this round</p>}
                  {[...trades].reverse().map((t, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1 text-xs border-b border-dotted border-gray-100" style={{ fontFamily: 'Georgia, serif' }}>
                      <span className="text-gray-400 w-5 text-right">{i + 1}.</span>
                      <span className="text-lg" style={{ color: SUIT_COLORS[t.suit] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[t.suit]}</span>
                      <span className="text-gray-600">
                        <span className="font-semibold text-green-700">{t.buyer_name}</span> bought from <span className="font-semibold text-red-700">{t.seller_name}</span>
                      </span>
                      <span className="ml-auto font-bold text-gray-800">${t.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* End of Round: Hand Reveal */}
            <div className="border-2 border-dotted border-purple-200 rounded-lg p-5">
              <p className="text-xs text-gray-400 mb-3" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>HAND REVEAL</p>
              <div className="space-y-3">
                {players.map(p => {
                  const initH = initialHands[p.id] || { S: 0, H: 0, D: 0, C: 0 }
                  const finalH = p.hand || { S: 0, H: 0, D: 0, C: 0 }
                  return (
                    <div key={p.id} className="flex items-center gap-4 p-2 border border-dotted border-gray-100 rounded">
                      <span className="text-xs font-bold w-24 truncate text-gray-700" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>{p.name}</span>
                      <div className="flex-1">
                        <div className="flex gap-3">
                          {SUITS.map(s => (
                            <div key={s} className="text-center flex-1">
                              <span className="text-sm" style={{ color: SUIT_COLORS[s] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[s]}</span>
                              <div className="text-xs text-gray-500">{initH[s]}</div>
                              <div className="text-xs font-bold text-gray-800">→ {finalH[s]}</div>
                              {finalH[s] - initH[s] !== 0 && (
                                <div className={`text-[9px] font-bold ${finalH[s] - initH[s] > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  {finalH[s] - initH[s] > 0 ? '+' : ''}{finalH[s] - initH[s]}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {lobby.goal_suit && (
                <p className="text-xs text-center text-gray-500 mt-3" style={{ fontFamily: 'Georgia, serif' }}>
                  Goal suit was: <span className="font-bold text-lg" style={{ color: SUIT_COLORS[lobby.goal_suit] === 'red' ? '#dc2626' : '#1f2937' }}>{SUIT_SYMBOLS[lobby.goal_suit]}</span>
                </p>
              )}
            </div>

            <div className={`border-2 border-dotted rounded-lg p-5 ${lobby.round >= params.totalRounds ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}>
              <p className="text-xs text-gray-400 mb-3" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>
                {lobby.round >= params.totalRounds ? 'FINAL STANDINGS' : `LEADERBOARD (${lobby.round}/${params.totalRounds} ROUNDS)`}
              </p>
              <div className="space-y-2">
                {[...players].sort((a, b) => b.total_score - a.total_score).map((p, i) => {
                  const prevScore = prevScores[p.id] ?? 0
                  const roundDelta = p.total_score - prevScore
                  return (
                    <div key={p.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {lobby.round >= params.totalRounds && i === 0 && <span className="text-lg">&#x1F3C6;</span>}
                        <span className={`text-sm ${lobby.round >= params.totalRounds && i === 0 ? 'text-yellow-700 font-bold' : 'text-gray-700'}`} style={{ fontFamily: 'Georgia, serif' }}>
                          {i + 1}. {p.name}
                        </span>
                        {p.id === myPlayerId && <span className="text-xs text-gray-400">(you)</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs ${roundDelta >= 0 ? 'text-green-500' : 'text-red-500'}`} style={{ fontFamily: 'Georgia, serif' }}>
                          {roundDelta >= 0 ? '+' : ''}{roundDelta.toFixed(0)} this round
                        </span>
                        <span className={`text-sm font-bold ${lobby.round >= params.totalRounds && i === 0 ? 'text-yellow-700' : 'text-gray-800'}`} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>
                          {p.total_score >= 0 ? '+' : ''}{p.total_score.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {lobby.round < params.totalRounds && players[0]?.id === myPlayerId && (
              <button onClick={startRound} className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.55rem' }}>
                NEXT ROUND ({lobby.round + 1}/{params.totalRounds})
              </button>
            )}
            {lobby.round < params.totalRounds && players[0]?.id !== myPlayerId && (
              <p className="text-center text-xs text-gray-400" style={{ fontFamily: 'Georgia, serif' }}>Waiting for host to start next round...</p>
            )}
            {lobby.round >= params.totalRounds && players[0]?.id === myPlayerId && (
              <button onClick={resetAndStart} className="w-full px-4 py-3 border-2 border-dotted border-blue-300 text-blue-600 hover:bg-blue-50 text-xs rounded transition-colors" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.55rem' }}>
                PLAY AGAIN (NEW SET)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
