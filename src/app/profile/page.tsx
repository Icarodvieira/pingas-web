'use client'

import { BottomNav, Badge, ThemeToggle } from '@/components/shared'
import { api } from '@/lib/api'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type Me = {
  id: number
  email: string
  createdAt: string
  player: {
    id: number
    name: string
  }
}

type PlayerStats = {
  id: number
  name: string
  stats: {
    totalGames: number
    totalWins: number
    totalLosses: number
    totalDraws: number
    winrate: number
  }
  groups: {
    groupId: number
    groupName: string
    eloRating: number
    wins: number
    losses: number
    draws: number
  }[]
}

type RawMatch = {
  id: number
  scoreP1: number
  scoreP2: number
  eloChangeP1: number
  eloChangeP2: number
  playedAt: string
  player1: { id: number; name: string }
  player2: { id: number; name: string }
  winner: { id: number; name: string } | null
}

type RecentMatch = {
  opponent: string
  score: string
  result: 'win' | 'loss' | 'draw'
  eloChange: number
  date: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function transformMatch(match: RawMatch, currentPlayerId: number): RecentMatch {
  const isPlayer1 = match.player1.id === currentPlayerId
  const opponent = isPlayer1 ? match.player2.name : match.player1.name
  const myScore = isPlayer1 ? match.scoreP1 : match.scoreP2
  const opponentScore = isPlayer1 ? match.scoreP2 : match.scoreP1
  const myEloChange = isPlayer1 ? match.eloChangeP1 : match.eloChangeP2

  let result: 'win' | 'loss' | 'draw'
  if (!match.winner) {
    result = 'draw'
  } else if (match.winner.id === currentPlayerId) {
    result = 'win'
  } else {
    result = 'loss'
  }

  return {
    opponent,
    score: `${myScore}-${opponentScore}`,
    result,
    eloChange: myEloChange,
    date: formatDate(match.playedAt),
  }
}

// ─── Placeholder ELO history (ainda não existe endpoint) ─────────────────────
const eloHistory = [
  { date: '10 Mar', elo: 1650 }, { date: '11 Mar', elo: 1680 },
  { date: '12 Mar', elo: 1695 }, { date: '13 Mar', elo: 1720 },
  { date: '14 Mar', elo: 1720 }, { date: '15 Mar', elo: 1710 },
  { date: '16 Mar', elo: 1735 }, { date: '17 Mar', elo: 1760 },
  { date: '18 Mar', elo: 1785 }, { date: '19 Mar', elo: 1805 },
  { date: '20 Mar', elo: 1820 }, { date: '21 Mar', elo: 1847 },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  // 1. Busca o usuário logado para obter o playerId
  const { data: me, isLoading: loadingMe } = useQuery<Me>({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data),
  })

  const playerId = me?.player?.id

  // 2. Busca os dados do player — só executa depois que tiver o playerId
  const { data: playerStats, isLoading: loadingStats } = useQuery<PlayerStats>({
    queryKey: ['player', playerId],
    queryFn: () => api.get(`/players/${playerId}`).then((r) => r.data),
    enabled: !!playerId,
  })

  // 3. Busca as partidas recentes — também depende do playerId
  const { data: rawMatches, isLoading: loadingMatches } = useQuery<RawMatch[]>({
    queryKey: ['player', playerId, 'matches'],
    queryFn: () =>
  api.get(`/players/${playerId}/matches`).then((r) =>
    Array.isArray(r.data) ? r.data : r.data.data ?? []
  ),
    enabled: !!playerId,
  })

  // Transforma as partidas brutas no formato que o componente precisa
  const recentMatches: RecentMatch[] =
  Array.isArray(rawMatches) && playerId
    ? rawMatches.slice(0, 5).map((m) => transformMatch(m, playerId))
    : []

  const isLoading = loadingMe || loadingStats

  // Loading state global
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-muted text-sm">Carregando perfil...</p>
      </div>
    )
  }

  // Se não tiver dados após o carregamento, algo deu errado
  if (!playerStats || !me) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-danger text-sm">Erro ao carregar perfil.</p>
      </div>
    )
  }

  const { stats, groups } = playerStats
  const initials = getInitials(playerStats.name)

  const statItems = [
    { label: 'Partidas', value: stats.totalGames,           color: 'text-foreground' },
    { label: 'Vitórias', value: stats.totalWins,            color: 'text-success' },
    { label: 'Derrotas', value: stats.totalLosses,          color: 'text-danger' },
    { label: 'Winrate',  value: `${stats.winrate}%`,        color: 'text-foreground' },
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-surface border-b-2 border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
          <ThemeToggle />
        </div>
      </div>

      {/* Player info + stats */}
      <div className="px-6 py-8 bg-surface border-b-2 border-border">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-accent-primary/20 flex items-center justify-center mb-4">
            <span className="text-accent-primary font-bold text-3xl">{initials}</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">{playerStats.name}</h2>
          <p className="text-sm text-text-muted">{me.email}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-4">
          {statItems.map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
              <p className="text-xs text-text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ELO Evolution chart — TODO: endpoint /players/:id/elo-history */}
      <div className="px-6 py-6 bg-surface border-b-2 border-border">
        <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wide">
          Evolução ELO — últimos 30 dias
        </h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={eloHistory}>
              <YAxis domain={['dataMin - 50', 'dataMax + 50']} hide />
              <Line
                type="monotone"
                dataKey="elo"
                stroke="var(--accent-primary)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-text-muted">{eloHistory[0].date}</p>
          <p className="text-sm font-bold font-mono text-accent-primary">
            ELO atual: {eloHistory[eloHistory.length - 1].elo}
          </p>
          <p className="text-xs text-text-muted">{eloHistory[eloHistory.length - 1].date}</p>
        </div>
      </div>

      {/* Meus grupos — vem de playerStats.groups */}
      <div className="px-6 py-6">
        <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wide">Meus Grupos</h3>
        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <Link key={group.groupId} href={`/groups/${group.groupId}`}>
              <div className="bg-surface rounded-xl p-4 hover:bg-surface-elevated transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-1">{group.groupName}</p>
                    <p className="text-xs text-text-muted">{group.wins}V — {group.losses}D</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold font-mono text-foreground">{group.eloRating}</p>
                    <p className="text-xs text-text-muted">ELO</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Histórico recente */}
      <div className="px-6 pb-6">
        <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wide">Histórico Recente</h3>

        {loadingMatches && (
          <p className="text-text-muted text-sm text-center py-4">Carregando partidas...</p>
        )}

        {!loadingMatches && recentMatches.length === 0 && (
          <p className="text-text-muted text-sm text-center py-4">Nenhuma partida ainda.</p>
        )}

        <div className="flex flex-col gap-2">
          {recentMatches.map((match, i) => (
            <div key={i} className="bg-surface rounded-xl p-4 hover:bg-surface-elevated transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-primary font-bold text-xs">{getInitials(match.opponent)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{match.opponent}</p>
                  <p className="text-xs text-text-muted">{match.date}</p>
                </div>

                <p className="w-14 text-center font-mono font-semibold text-foreground flex-shrink-0">
                  {match.score}
                </p>

                <div className="w-7 flex justify-center flex-shrink-0">
                  <Badge variant={match.result}>
                    {match.result === 'win' ? 'V' : match.result === 'loss' ? 'D' : 'E'}
                  </Badge>
                </div>

                <p className={`w-10 text-center text-xs font-bold font-mono flex-shrink-0 ${
                  match.eloChange > 0 ? 'text-success' :
                  match.eloChange < 0 ? 'text-danger' :
                  'text-text-muted'
                }`}>
                  {match.eloChange > 0 ? '+' : ''}{match.eloChange}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}