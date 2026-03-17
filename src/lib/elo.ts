/**
 * Cálculo de ELO — mesmo algoritmo do backend (pingrank-api/src/services/elo.service.ts)
 * Usado no front apenas para preview antes de confirmar a partida.
 */

export type MatchResult = 'win' | 'loss' | 'draw'

export interface EloChangeResult {
  player1Change: number
  player2Change: number
}

function getKFactor(gamesPlayed: number): number {
  if (gamesPlayed < 10) return 32
  if (gamesPlayed < 30) return 24
  return 16
}

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

export function calculateElo(
  eloP1: number,
  eloP2: number,
  scoreP1: number,
  scoreP2: number,
  gamesPlayedP1 = 30,
  gamesPlayedP2 = 30
): EloChangeResult {
  const k1 = getKFactor(gamesPlayedP1)
  const k2 = getKFactor(gamesPlayedP2)

  const expected1 = expectedScore(eloP1, eloP2)
  const expected2 = expectedScore(eloP2, eloP1)

  let actual1: number, actual2: number
  if (scoreP1 > scoreP2) {
    actual1 = 1; actual2 = 0
  } else if (scoreP2 > scoreP1) {
    actual1 = 0; actual2 = 1
  } else {
    actual1 = 0.5; actual2 = 0.5
  }

  const change1 = Math.round(k1 * (actual1 - expected1))
  const change2 = Math.round(k2 * (actual2 - expected2))

  return { player1Change: change1, player2Change: change2 }
}
