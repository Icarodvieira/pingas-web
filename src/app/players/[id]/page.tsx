'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { BottomNav, Badge, PlayerAvatar, ThemeToggle } from '@/components/shared'
import { InfiniteScrollIndicator } from '@/components/shared/InfiniteScrollIndicator'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function PlayerProfilePage() {
  const router = useRouter()
  const params = useParams()
  const playerId = Number(params.id)

  const [player, setPlayer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  const {
    items: matches,
    isLoading: isLoadingMatches,
    hasMore,
    observerTarget,
    loadMore,
  } = useInfiniteScroll({ initialLimit: 5 })

  useEffect(() => {
    api.get('/auth/me').then((res) => {
      setCurrentUserId(res.data.player.id)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!playerId) return
    setIsLoading(true)
    api.get(`/players/${playerId}`)
      .then((res) => setPlayer(res.data))
      .catch(() => setPlayer(null))
      .finally(() => setIsLoading(false))
  }, [playerId])

  useEffect(() => {
    if (!playerId) return
    api.get(`/players/${playerId}/matches?limit=5&offset=0`).then((res) => {
      loadMore(res.data.data)
    })
  }, [playerId, loadMore])

  useEffect(() => {
    if (!isLoadingMatches || !playerId) return
    const offset = matches.length
    api.get(`/players/${playerId}/matches?limit=5&offset=${offset}`)
      .then((res) => loadMore(res.data.data))
      .catch(() => loadMore([]))
  }, [isLoadingMatches, playerId, matches.length, loadMore])

  const isOwnProfile = currentUserId === playerId

  const statItems = [
    { label: 'Partidas', value: player?.stats?.totalGames ?? '-', color: 'text-foreground' },
    { label: 'Vitórias',  value: player?.stats?.totalWins ?? '-',  color: 'text-success' },
    { label: 'Derrotas',  value: player?.stats?.totalLosses ?? '-', color: 'text-danger' },
    { label: 'Winrate',   value: player ? `${player.stats.winrate}%` : '-', color: 'text-foreground' },
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-surface border-b-2 border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-background rounded-xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <ThemeToggle />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {isLoading ? 'Carregando...' : player?.name ?? 'Jogador'}
        </h1>
        {isOwnProfile && (
          <p className="text-xs text-accent-primary mt-1">Você</p>
        )}
      </div>

      {isLoading ? (
        <div className="px-6 py-12 text-center">
          <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-text-muted mt-4">Carregando perfil...</p>
        </div>
      ) : !player ? (
        <div className="px-6 py-12 text-center">
          <p className="text-text-muted">Jogador não encontrado.</p>
        </div>
      ) : (
        <>
          {/* Avatar + Stats */}
          <div className="px-6 py-8 bg-surface border-b-2 border-border">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-4">
                <PlayerAvatar name={player.name} avatarUrl={player.avatarUrl} size="lg" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-1">{player.name}</h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {statItems.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Grupos */}
          <div className="px-6 py-6 border-b-2 border-border">
            <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wide">Grupos</h3>
            <div className="flex flex-col gap-2">
              {player.groups.map((group: any) => (
                <div
                  key={group.groupId}
                  className="bg-surface rounded-2xl p-4 border-2 border-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground mb-1">{group.groupName}</p>
                      {group.isCalibrating ? (
                        <p className="text-xs text-text-muted">Calibração: {group.gamesPlayed}/10</p>
                      ) : (
                        <p className="text-xs text-text-muted">#{group.position} de {group.memberCount}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {group.isCalibrating ? (
                        <p className="text-xs text-text-muted font-semibold max-w-[100px] text-right leading-tight">
                          Calibração em andamento
                        </p>
                      ) : (
                        <>
                          <p className="text-xl font-bold font-mono text-foreground">{group.eloRating}</p>
                          <p className="text-xs text-text-muted">ELO</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(player.groups ?? []).length === 0 && (
                <p className="text-sm text-text-muted">Nenhum grupo.</p>
              )}
            </div>
          </div>

          {/* Histórico */}
          <div className="px-6 pb-6 pt-6">
            <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wide">Histórico</h3>
            <div className="flex flex-col gap-2">
              {matches.map((match: any, i: number) => {
                const isPlayer1 = match.player1Id === playerId
                const opponent = isPlayer1 ? match.player2 : match.player1
                const myScore = isPlayer1 ? match.scoreP1 : match.scoreP2
                const oppScore = isPlayer1 ? match.scoreP2 : match.scoreP1
                const eloChange = isPlayer1 ? match.eloChangeP1 : match.eloChangeP2
                const result = myScore > oppScore ? 'win' : myScore < oppScore ? 'loss' : 'draw'
                const date = new Date(match.playedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

                return (
                  <div key={i} className="bg-surface rounded-xl p-4 hover:bg-surface-elevated transition-all">
                    <div className="flex items-center gap-3">
                      <Link href={`/players/${opponent.id}`}>
                        <PlayerAvatar name={opponent.name} avatarUrl={opponent.avatarUrl} size="sm" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/players/${opponent.id}`}>
                          <p className="font-semibold text-foreground truncate hover:text-accent-primary transition-colors">
                            {opponent.name}
                          </p>
                        </Link>
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

            <div ref={observerTarget} className="py-8 flex items-center justify-center">
              <InfiniteScrollIndicator
                isLoading={isLoadingMatches}
                hasMore={hasMore}
                itemCount={matches.length}
                loadingMessage="Carregando mais partidas..."
                endMessage="Fim do histórico"
                emptyMessage="Nenhuma partida encontrada"
              />
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  )
}
