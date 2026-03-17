'use client'

import { BottomNav, Badge, ThemeToggle } from '@/components/shared'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'

// TODO: substituir por useQuery(() => api.get('/players/me'))
const playerStats = {
  name: 'Ícaro Vieira',
  avatar: undefined as string | undefined,
  totalMatches: 47,
  wins: 28,
  losses: 17,
  draws: 2,
  winrate: 59.6,
}

// TODO: substituir por useQuery(() => api.get('/players/me/groups'))
const playerGroups = [
  { id: '1', name: 'Escritório SP',       elo: 1847, position: 2, memberCount: 12 },
  { id: '2', name: 'Time de Engenharia',  elo: 1923, position: 1, memberCount: 8 },
  { id: '3', name: 'Design Squad',        elo: 1654, position: 4, memberCount: 6 },
]

// TODO: substituir por useQuery(() => api.get('/players/me/matches?limit=5'))
const recentMatches = [
  { opponent: 'Pedro Silva',  score: '7-11',  result: 'loss' as const, eloChange: -8,  date: 'Hoje' },
  { opponent: 'Ana Costa',    score: '11-9',  result: 'win'  as const, eloChange: 12,  date: 'Hoje' },
  { opponent: 'Carlos Lima',  score: '11-6',  result: 'win'  as const, eloChange: 15,  date: 'Ontem' },
  { opponent: 'Julia Mendes', score: '8-11',  result: 'loss' as const, eloChange: -10, date: '15 Mar' },
  { opponent: 'Bruno Reis',   score: '11-11', result: 'draw' as const, eloChange: 0,   date: '14 Mar' },
]

// TODO: substituir por useQuery(() => api.get('/players/me/elo-history'))
const eloHistory = [
  { date: '10 Mar', elo: 1650 }, { date: '11 Mar', elo: 1680 },
  { date: '12 Mar', elo: 1695 }, { date: '13 Mar', elo: 1720 },
  { date: '14 Mar', elo: 1720 }, { date: '15 Mar', elo: 1710 },
  { date: '16 Mar', elo: 1735 }, { date: '17 Mar', elo: 1760 },
  { date: '18 Mar', elo: 1785 }, { date: '19 Mar', elo: 1805 },
  { date: '20 Mar', elo: 1820 }, { date: '21 Mar', elo: 1847 },
]

const statItems = [
  { label: 'Partidas', value: playerStats.totalMatches, color: 'text-foreground' },
  { label: 'Vitórias',  value: playerStats.wins,         color: 'text-success' },
  { label: 'Derrotas',  value: playerStats.losses,        color: 'text-danger' },
  { label: 'Winrate',   value: `${playerStats.winrate}%`, color: 'text-foreground' },
]

export default function ProfilePage() {
  const initials = getInitials(playerStats.name)

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
          {playerStats.avatar ? (
            <img src={playerStats.avatar} alt={playerStats.name} className="w-24 h-24 rounded-full object-cover mb-4" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-accent-primary/20 flex items-center justify-center mb-4">
              <span className="text-accent-primary font-bold text-3xl">{initials}</span>
            </div>
          )}
          <h2 className="text-2xl font-bold text-foreground mb-1">{playerStats.name}</h2>
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

      {/* ELO Evolution chart */}
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

      {/* Meus grupos */}
      <div className="px-6 py-6">
        <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wide">Meus Grupos</h3>
        <div className="space-y-3">
          {playerGroups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <div className="bg-surface rounded-xl p-4 hover:bg-surface-elevated transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-1">{group.name}</p>
                    <p className="text-xs text-text-muted">#{group.position} de {group.memberCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold font-mono text-foreground">{group.elo}</p>
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
        <div className="space-y-3">
          {recentMatches.map((match, i) => (
            <div key={i} className="bg-surface rounded-xl p-4 hover:bg-surface-elevated transition-all">
              <div className="flex items-center gap-4">
                {/* Opponent avatar */}
                <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-primary font-bold text-xs">{getInitials(match.opponent)}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{match.opponent}</p>
                  <p className="text-xs text-text-muted">{match.date}</p>
                </div>

                {/* Score */}
                <p className="font-mono font-semibold text-foreground">{match.score}</p>

                {/* Badge + ELO */}
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={match.result}>
                    {match.result === 'win' ? 'V' : match.result === 'loss' ? 'D' : 'E'}
                  </Badge>
                  <p className={`text-xs font-bold font-mono ${match.eloChange > 0 ? 'text-success' : match.eloChange < 0 ? 'text-danger' : 'text-text-muted'}`}>
                    {match.eloChange > 0 ? '+' : ''}{match.eloChange}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
