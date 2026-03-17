'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/shared'
import { getInitials } from '@/lib/utils'

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

  const Avatar = ({ name, url, size = 10 }: { name: string, url?: string, size?: number }) => (
    url ? (
      <img src={url} alt={name} className={`w-${size} h-${size} rounded-full object-cover`} />
    ) : (
      <div className={`w-${size} h-${size} rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0`}>
        <span className="text-accent-primary font-bold text-xs">{getInitials(name)}</span>
      </div>
    )
  )

  return (
    <div className="bg-surface rounded-xl p-4 hover:bg-surface-elevated transition-all">
      <p className="text-xs text-text-muted mb-3">{date}</p>
      <div className="flex items-center justify-between gap-4">
        {/* Player 1 */}
        <div className="flex items-center gap-3 flex-1">
          <Avatar name={player1Name} url={player1Avatar} />
          <div className="min-w-0 flex-1">
            <p className={`font-semibold truncate ${p1Won ? 'text-success' : 'text-foreground'} ${currentUserName === player1Name ? 'underline' : ''}`}>
              {player1Name}
            </p>
            <div className={`flex items-center gap-1 text-xs ${player1EloChange > 0 ? 'text-success' : 'text-danger'}`}>
              {player1EloChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="font-mono font-bold">{player1EloChange > 0 ? '+' : ''}{player1EloChange}</span>
            </div>
          </div>
        </div>

        {/* Placar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg">
          <span className={`text-2xl font-bold font-mono ${p1Won ? 'text-success' : isDraw ? 'text-text-muted' : 'text-foreground'}`}>{player1Score}</span>
          <span className="text-text-muted font-bold">—</span>
          <span className={`text-2xl font-bold font-mono ${p2Won ? 'text-success' : isDraw ? 'text-text-muted' : 'text-foreground'}`}>{player2Score}</span>
        </div>

        {/* Player 2 */}
        <div className="flex items-center gap-3 flex-1 flex-row-reverse">
          <Avatar name={player2Name} url={player2Avatar} />
          <div className="min-w-0 flex-1 text-right">
            <p className={`font-semibold truncate ${p2Won ? 'text-success' : 'text-foreground'} ${currentUserName === player2Name ? 'underline' : ''}`}>
              {player2Name}
            </p>
            <div className={`flex items-center gap-1 justify-end text-xs ${player2EloChange > 0 ? 'text-success' : 'text-danger'}`}>
              {player2EloChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
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
  const initials = getInitials(name)

  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'p-4 bg-surface rounded-xl'}`}>
      <div className="relative">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <span className="text-accent-primary font-bold">{initials}</span>
          </div>
        )}
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
