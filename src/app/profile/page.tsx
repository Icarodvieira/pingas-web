'use client'

import { BottomNav, Badge, ThemeToggle } from '@/components/shared'
import { InfiniteScrollIndicator } from '@/components/shared/InfiniteScrollIndicator'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

// TODO: substituir por useQuery(() => api.get('/players/me/elo-history'))
const eloHistory = [
  { date: '10 Mar', elo: 1650 }, { date: '11 Mar', elo: 1680 },
  { date: '12 Mar', elo: 1695 }, { date: '13 Mar', elo: 1720 },
  { date: '14 Mar', elo: 1720 }, { date: '15 Mar', elo: 1710 },
  { date: '16 Mar', elo: 1735 }, { date: '17 Mar', elo: 1760 },
  { date: '18 Mar', elo: 1785 }, { date: '19 Mar', elo: 1805 },
  { date: '20 Mar', elo: 1820 }, { date: '21 Mar', elo: 1847 },
]


export default function ProfilePage() {
  const router = useRouter()
  const [playerId, setPlayerId] = useState<number | null>(null)
  const [player, setPlayer] = useState<any>(null)
  const {
    items: matches,
    isLoading,
    hasMore,
    observerTarget,
    loadMore,
    reset,
  } = useInfiniteScroll({ initialLimit: 5 })

  useEffect(() => {
    api.get('/auth/me').then((res) => {
      setPlayerId(res.data.player.id)
    })
  }, [])

  useEffect(() => {
    if (!playerId) return
    api.get(`/players/${playerId}`).then((res) => {
      setPlayer(res.data)
    })
  }, [playerId])

  useEffect(() => {
    if (!playerId) return
    api.get(`/players/${playerId}/matches?limit=5&offset=0`).then((res) => {
      loadMore(res.data.data)
    })
  }, [playerId, loadMore])

  useEffect(() => {
    if (!playerId || !isLoading) return

    const offset = matches.length

    api
      .get(`/players/${playerId}/matches?limit=5&offset=${offset}`)
      .then((res) => {
        loadMore(res.data.data)
      })
      .catch((error) => {
        console.error('Erro ao carregar mais partidas:', error)
      })
  }, [isLoading, playerId, matches.length, loadMore])

  const initials = getInitials(player?.name ?? '')

  const statItems = [
    { label: 'Partidas', value: player?.stats.totalGames ?? '-', color: 'text-foreground' },
    { label: 'Vitórias',  value: player?.stats.totalWins ?? '-',  color: 'text-success' },
    { label: 'Derrotas',  value: player?.stats.totalLosses ?? '-', color: 'text-danger' },
    { label: 'Winrate',   value: player ? `${player.stats.winrate}%` : '-', color: 'text-foreground' },
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
          <button
            onClick={() => router.push('/profile/edit')}
            className="w-24 h-24 rounded-full bg-accent-primary/20 flex items-center justify-center mb-4 hover:bg-accent-primary/30 transition-all active:scale-95 relative group"
          >
            <span className="text-accent-primary font-bold text-3xl">{initials}</span>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center shadow-lg group-hover:bg-accent-primary/90 transition-all">
              <svg className="w-4 h-4 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </button>
          <h2 className="text-2xl font-bold text-foreground mb-1">{player?.name ?? '...'}</h2>
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
        <div className="h-32 relative">
          <div className="absolute inset-0 blur-sm opacity-75">
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
          
          {/* Overlay com mensagem */}
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <p className="text-sm font-semibold text-text-muted">Em breve</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-text-muted">{eloHistory[0].date}</p>
          <p className="text-sm font-bold font-mono text-accent-primary">
            {/* ELO atual: {eloHistory[eloHistory.length - 1].elo} */}
          </p>
          <p className="text-xs text-text-muted">{eloHistory[eloHistory.length - 1].date}</p>
        </div>
      </div>

      {/* Meus grupos */}
      <div className="px-6 py-6">
        <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wide">Meus Grupos</h3>
        <div className="flex flex-col gap-2">
          {(player?.groups ?? []).map((group: any) => (
            <Link key={group.groupId} href={`/groups/${group.groupId}`}>
              <div className="bg-surface rounded-xl p-4 hover:bg-surface-elevated transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-1">{group.groupName}</p>
                    <p className="text-xs text-text-muted">#{group.position} de {group.memberCount}</p>
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

      {/* Histórico */}
      <div className="px-6 pb-6">
        <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wide">Histórico</h3>
        <div className="flex flex-col gap-2">
        {matches.map((match: any, i: number) => {
          const isPlayer1 = match.player1Id === playerId
          const opponent = isPlayer1 ? match.player2.name : match.player1.name
          const myScore = isPlayer1 ? match.scoreP1 : match.scoreP2
          const oppScore = isPlayer1 ? match.scoreP2 : match.scoreP1
          const eloChange = isPlayer1 ? match.eloChangeP1 : match.eloChangeP2
          const result = myScore > oppScore ? 'win' : myScore < oppScore ? 'loss' : 'draw'
          const date = new Date(match.playedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

          return (
            <div key={i} className="bg-surface rounded-xl p-4 hover:bg-surface-elevated transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-primary font-bold text-xs">{getInitials(opponent)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{opponent}</p>
                  <p className="text-xs text-text-muted">{date}</p>
                </div>
                <p className="w-14 text-center font-mono font-semibold text-foreground flex-shrink-0">
                  {myScore}-{oppScore}
                </p>
                <div className="w-7 flex justify-center flex-shrink-0">
                  <Badge variant={result}>
                    {result === 'win' ? 'V' : result === 'loss' ? 'D' : 'E'}
                  </Badge>
                </div>
                <p className={`w-10 text-center text-xs font-bold font-mono flex-shrink-0 ${
                  eloChange > 0 ? 'text-success' : eloChange < 0 ? 'text-danger' : 'text-text-muted'
                }`}>
                  {eloChange > 0 ? '+' : ''}{eloChange}
                </p>
              </div>
            </div>
          )
        })}
        </div>

        {/* Elemento observador para infinite scroll */}
        <div ref={observerTarget} className="py-8 flex items-center justify-center">
          <InfiniteScrollIndicator
            isLoading={isLoading}
            hasMore={hasMore}
            itemCount={matches.length}
            loadingMessage="Carregando mais partidas..."
            endMessage="Fim do histórico"
            emptyMessage="Nenhuma partida encontrada"
          />
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
