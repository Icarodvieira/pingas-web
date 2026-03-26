'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/shared'
import { PlayerAvatar } from '@/components/shared/PlayerAvatar'

// ─── MatchCard ────────────────────────────────────────────────────────────────
interface MatchCardProps {
  player1Name: string
  player1Avatar?: string
  player1Score: number
  player1EloChange: number
  player2Name: string
  player2Avatar?: string
  player2Score: number
  player2EloChange: number
  date: string
  currentUserName?: string
}

export function MatchCard({ player1Name, player1Avatar, player1Score, player1EloChange, player2Name, player2Avatar, player2Score, player2EloChange, date, currentUserName }: MatchCardProps) {
  const p1Won = player1Score > player2Score
  const p2Won = player2Score > player1Score
  const isDraw = player1Score === player2Score

  return (
    <div className="bg-surface rounded-xl p-4 hover:bg-surface-elevated transition-all overflow-hidden">
      <p className="text-xs text-text-muted mb-3">{date}</p>
      <div className="flex items-center justify-between gap-2 min-w-0">
        {/* Player 1 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <PlayerAvatar name={player1Name} avatarUrl={player1Avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <p className={`font-semibold truncate text-sm ${p1Won ? 'text-success' : 'text-foreground'} ${currentUserName === player1Name ? 'underline' : ''}`}>
              {player1Name}
            </p>
            <div className={`flex items-center gap-1 text-xs ${player1EloChange > 0 ? 'text-success' : 'text-danger'}`}>
              {player1EloChange > 0 ? <TrendingUp className="w-3 h-3 flex-shrink-0" /> : <TrendingDown className="w-3 h-3 flex-shrink-0" />}
              <span className="font-mono font-bold">{player1EloChange > 0 ? '+' : ''}{player1EloChange}</span>
            </div>
          </div>
        </div>

        {/* Placar */}
        <div className="flex items-center gap-1 px-2 py-1 bg-background rounded-lg flex-shrink-0">
          <span className={`text-lg font-bold font-mono ${p1Won ? 'text-success' : isDraw ? 'text-text-muted' : 'text-foreground'}`}>{player1Score}</span>
          <span className="text-text-muted font-bold">—</span>
          <span className={`text-lg font-bold font-mono ${p2Won ? 'text-success' : isDraw ? 'text-text-muted' : 'text-foreground'}`}>{player2Score}</span>
        </div>

        {/* Player 2 */}
        <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse">
          <PlayerAvatar name={player2Name} avatarUrl={player2Avatar} size="sm" />
          <div className="min-w-0 flex-1 text-right">
            <p className={`font-semibold truncate text-sm ${p2Won ? 'text-success' : 'text-foreground'} ${currentUserName === player2Name ? 'underline' : ''}`}>
              {player2Name}
            </p>
            <div className={`flex items-center gap-1 justify-end text-xs ${player2EloChange > 0 ? 'text-success' : 'text-danger'}`}>
              {player2EloChange > 0 ? <TrendingUp className="w-3 h-3 flex-shrink-0" /> : <TrendingDown className="w-3 h-3 flex-shrink-0" />}
              <span className="font-mono font-bold">{player2EloChange > 0 ? '+' : ''}{player2EloChange}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PlayerCard ───────────────────────────────────────────────────────────────
interface PlayerCardProps {
  avatarUrl?: string
  name: string
  elo: number
  wins?: number
  losses?: number
  change?: number
  compact?: boolean
}

export function PlayerCard({ avatarUrl, name, elo, wins, losses, change, compact = false }: PlayerCardProps) {

  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'p-4 bg-surface rounded-xl'}`}>
      <div className="relative">
        <PlayerAvatar name={name} avatarUrl={avatarUrl} size="sm" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{name}</p>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span className="font-mono font-bold text-foreground">{elo}</span>
          {wins !== undefined && losses !== undefined && (
            <span className="text-xs">{wins}V — {losses}D</span>
          )}
        </div>
      </div>

      {change !== undefined && change !== 0 && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${change > 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span className="text-xs font-bold font-mono">{Math.abs(change)}</span>
        </div>
      )}
    </div>
  )
}
