const SUITS = ['S', 'C', 'H', 'D'] as const
type Suit = typeof SUITS[number]

const PARTNER: Record<Suit, Suit> = { S: 'C', C: 'S', H: 'D', D: 'H' }
const SUIT_NAMES: Record<Suit, string> = { S: 'Spades', C: 'Clubs', H: 'Hearts', D: 'Diamonds' }
const SUIT_COLORS: Record<Suit, string> = { S: 'black', C: 'black', H: 'red', D: 'red' }
const SUIT_SYMBOLS: Record<Suit, string> = { S: '♠', C: '♣', H: '♥', D: '♦' }

const COUNTS = [12, 10, 10, 8] as const

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  if (k === 0 || k === n) return 1
  let result = 1
  for (let i = 0; i < Math.min(k, n - k); i++) {
    result = result * (n - i) / (i + 1)
  }
  return Math.round(result)
}

function getAssignments(): Record<Suit, number>[] {
  const seen = new Set<string>()
  const out: Record<Suit, number>[] = []
  const perms = permutations(COUNTS)
  for (const p of perms) {
    const key = p.join(',')
    if (!seen.has(key)) {
      seen.add(key)
      const assignment = {} as Record<Suit, number>
      SUITS.forEach((s, i) => { assignment[s] = p[i] })
      out.push(assignment)
    }
  }
  return out
}

function permutations(arr: readonly number[]): number[][] {
  if (arr.length <= 1) return [[...arr]]
  const result: number[][] = []
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)]
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm])
    }
  }
  return result
}

export interface EvalResult {
  pGoal: Record<Suit, number>
  pCount: { 8: number; 10: number }
  eGoalCount: number
  valuePerCard: Record<Suit, number>
}

export function evaluate(hand: Record<Suit, number>, handSize: 8 | 10 = 10): EvalResult {
  const total = SUITS.reduce((sum, s) => sum + hand[s], 0)
  if (total !== handSize) throw new Error(`Hand must have exactly ${handSize} cards`)

  const assignments = getAssignments()
  const post: Record<string, number> = {}

  for (const a of assignments) {
    let L = 1
    for (const s of SUITS) {
      L *= comb(a[s], hand[s])
    }
    if (L === 0) continue
    const twelve = SUITS.find(s => a[s] === 12)!
    const goal = PARTNER[twelve]
    const key = `${goal},${a[goal]}`
    post[key] = (post[key] || 0) + L
  }

  const Z = Object.values(post).reduce((a, b) => a + b, 0)
  const pGoal = { S: 0, C: 0, H: 0, D: 0 } as Record<Suit, number>
  const pCount = { 8: 0, 10: 0 }

  for (const [key, v] of Object.entries(post)) {
    const [goal, G] = key.split(',')
    pGoal[goal as Suit] += v / Z
    pCount[parseInt(G) as 8 | 10] += v / Z
  }

  const eGoalCount = 8 * pCount[8] + 10 * pCount[10]
  const valuePerCard = {} as Record<Suit, number>
  for (const s of SUITS) {
    valuePerCard[s] = pGoal[s] * 200 / eGoalCount
  }

  return { pGoal, pCount, eGoalCount, valuePerCard }
}

export { SUITS, SUIT_NAMES, SUIT_COLORS, SUIT_SYMBOLS, PARTNER }
export type { Suit }
