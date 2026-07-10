import { SUITS, PARTNER, type Suit } from './figgie'

export interface Quote {
  playerId: string
  suit: Suit
  bid: number
  ask: number
  timestamp: number
}

export interface Trade {
  id: string
  buyerId: string
  sellerId: string
  suit: Suit
  price: number
  timestamp: number
}

export interface MarketPlayer {
  id: string
  name: string
  hand: Record<Suit, number>
  assignedSuit: Suit
  cash: number
  penaltyDrained: number
  tradeVolume: number
  lastQuoteTime: number | null
  activeQuote: Quote | null
}

export interface MarketGameState {
  assignment: Record<Suit, number>
  goalSuit: Suit
  players: MarketPlayer[]
  trades: Trade[]
  penaltyPot: number
  startTime: number
  roundDuration: number
}

export const PENALTY_INTERVAL_MS = 14000
export const PENALTY_AMOUNT = 2
export const MAX_SPREAD = 4
export const STARTING_CASH = 100
export const ROUND_DURATION_MS = 180000
export const GOAL_CARD_VALUE = 10

export function assignMarketSuits(playerIds: string[], numPlayers: number): Record<string, Suit> {
  const shuffled = [...SUITS].sort(() => Math.random() - 0.5)
  const assignments: Record<string, Suit> = {}

  for (let i = 0; i < playerIds.length; i++) {
    assignments[playerIds[i]] = shuffled[i % 4]
  }
  return assignments
}

export function validateQuote(bid: number, ask: number): string | null {
  if (bid < 0 || ask < 0) return 'Prices must be non-negative'
  if (bid >= ask) return 'Bid must be less than ask'
  if (ask - bid > MAX_SPREAD) return `Spread cannot exceed ${MAX_SPREAD}`
  if (!Number.isInteger(bid) || !Number.isInteger(ask)) return 'Prices must be integers'
  return null
}

export function executeTrade(
  buyer: MarketPlayer,
  seller: MarketPlayer,
  suit: Suit,
  price: number
): { buyer: MarketPlayer; seller: MarketPlayer } | string {
  if (buyer.cash < price) return 'Buyer has insufficient cash'
  if (seller.hand[suit] <= 0) return 'Seller has no cards of this suit'

  const newBuyer = {
    ...buyer,
    cash: buyer.cash - price,
    hand: { ...buyer.hand, [suit]: buyer.hand[suit] + 1 },
    tradeVolume: buyer.tradeVolume + 1,
  }
  const newSeller = {
    ...seller,
    cash: seller.cash + price,
    hand: { ...seller.hand, [suit]: seller.hand[suit] - 1 },
    tradeVolume: seller.tradeVolume + 1,
  }
  return { buyer: newBuyer, seller: newSeller }
}

export function calculatePenalties(
  player: MarketPlayer,
  currentTime: number
): { penalty: number; newLastQuoteTime: number | null } {
  if (player.lastQuoteTime === null) {
    const elapsed = currentTime - 0
    const intervals = Math.floor(elapsed / PENALTY_INTERVAL_MS)
    return { penalty: intervals * PENALTY_AMOUNT, newLastQuoteTime: player.lastQuoteTime }
  }

  const timeSinceQuote = currentTime - player.lastQuoteTime
  if (timeSinceQuote > PENALTY_INTERVAL_MS) {
    const intervals = Math.floor(timeSinceQuote / PENALTY_INTERVAL_MS)
    return { penalty: intervals * PENALTY_AMOUNT, newLastQuoteTime: player.lastQuoteTime }
  }
  return { penalty: 0, newLastQuoteTime: player.lastQuoteTime }
}

export function calculateFinalScores(state: MarketGameState): Record<string, { cardValue: number; cashValue: number; potShare: number; total: number }> {
  const totalVolume = state.players.reduce((sum, p) => sum + p.tradeVolume, 0)
  const scores: Record<string, { cardValue: number; cashValue: number; potShare: number; total: number }> = {}

  for (const player of state.players) {
    const cardValue = player.hand[state.goalSuit] * GOAL_CARD_VALUE
    const potShare = totalVolume > 0
      ? (player.tradeVolume / totalVolume) * state.penaltyPot
      : state.penaltyPot / state.players.length
    const total = player.cash + cardValue + potShare - STARTING_CASH

    scores[player.id] = {
      cardValue,
      cashValue: player.cash,
      potShare: Math.round(potShare * 100) / 100,
      total: Math.round(total * 100) / 100,
    }
  }
  return scores
}

export function dealMarketHands(numPlayers: number): { assignment: Record<Suit, number>; hands: Record<Suit, number>[]; goalSuit: Suit } {
  const deckCounts = [12, 10, 10, 8]
  const shuffledSuits = [...SUITS].sort(() => Math.random() - 0.5)
  const assignment = {} as Record<Suit, number>
  shuffledSuits.forEach((s, i) => { assignment[s] = deckCounts[i] })

  const twelveSuit = SUITS.find(s => assignment[s] === 12)!
  const goalSuit = PARTNER[twelveSuit]

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
  return { assignment, hands, goalSuit }
}
