'use client'

import { TrendingUp, TrendingDown, Minus, Users } from 'lucide-react'
import Link from 'next/link'
import { PlayerAvatar } from '@/components/shared'

// ─── GroupCard ────────────────────────────────────────────────────────────────
interface GroupCardProps {
  id: string
  name: string
  memberCount: number
  userPosition: number
  userElo: number
}

export function GroupCard({ id, name, memberCount, userPosition, userElo }: GroupCardProps) {
  return (
    <Link href={`/groups/${id}`}>
      <div className="bg-surface rounded-xl p-4 hover:bg-surface-elevated transition-all hover:scale-[1.02] active:scale-100 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-lg text-foreground">{name}</h3>
          <div className="flex items-center gap-1 text-text-muted text-sm">
            <Users className="w-4 h-4" />
            <span>{memberCount}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted mb-1">Sua posição</p>
            <p className="text-2xl font-bold font-mono text-accent-primary">
              #{userPosition}
              <span className="text-sm text-text-muted ml-1">de {memberCount}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted mb-1">ELO</p>
            <p className="text-xl font-bold font-mono text-foreground">{userElo}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── RankingRow ───────────────────────────────────────────────────────────────
interface RankingRowProps {
  position: number
  avatarUrl?: string
  name: string
  elo: number
  wins: number
  losses: number
  change?: number
  isCurrentUser?: boolean
}

export function RankingRow({ position, avatarUrl, name, elo, wins, losses, change, isCurrentUser = false }: RankingRowProps) {
  const positionDisplay = (pos: number) => {
    if (pos === 1) return '🥇'
    if (pos === 2) return '🥈'
    if (pos === 3) return '🥉'
    return String(pos)
  }

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isCurrentUser ? 'bg-accent-primary/10 ring-2 ring-accent-primary' : 'bg-surface hover:bg-surface-elevated'}`}>
      {/* Posição */}
      <div className="w-10 flex-shrink-0 text-center">
        <span className="text-2xl font-bold font-mono text-foreground">
          {positionDisplay(position)}
        </span>
      </div>

      {/* Avatar */}
      <PlayerAvatar
        name={name}
        avatarUrl={avatarUrl}
        size="sm"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{name}</p>
        <p className="text-xs text-text-muted">{wins}V — {losses}D</p>
      </div>

      {/* ELO + variação */}
      <div className="flex-shrink-0 text-right">
        <p className="text-xl font-bold font-mono text-foreground">{elo}</p>
        {change !== undefined && change !== 0 && (
          <div className={`inline-flex items-center gap-1 mt-1 ${change > 0 ? 'text-success' : 'text-danger'}`}>
            {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span className="text-xs font-bold font-mono">{change > 0 ? '+' : ''}{change}</span>
          </div>
        )}
        {change === 0 && (
          <div className="inline-flex items-center gap-1 mt-1 text-text-muted">
            <Minus className="w-3 h-3" />
            <span className="text-xs font-bold font-mono">0</span>
          </div>
        )}
      </div>
    </div>
  )
}
