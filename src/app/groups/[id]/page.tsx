'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { BottomNav, FAB, ThemeToggle } from '@/components/shared'
import { RankingRow, CalibrationRow } from '@/components/groups'
import { api } from '@/lib/api'

type Period = 'Semana' | 'Mês' | 'Geral'

type GroupData = {
  name: string
  memberCount: number
}

type RankingRowData = {
  position: number | null
  name: string
  avatarUrl?: string
  elo: number
  wins: number
  losses: number
  gamesPlayed: number
  isCalibrating: boolean
  // change?: number
  isCurrentUser?: boolean
}

function mapGroup(group: any): GroupData {
  const members = Array.isArray(group?.members)
    ? group.members
    : Array.isArray(group?.players)
      ? group.players
      : []

  return {
    name: group?.name ?? 'Grupo',
    memberCount: Number(group?.memberCount ?? members.length ?? 0),
  }
}

function mapRankingRow(row: any, index: number, currentUserId?: number): RankingRowData | null {
  const player = row?.player ?? row
  const playerId = row?.playerId ?? player?.id ?? row?.id
  const name = player?.name ?? row?.name

  if (!name) return null

  return {
    position: row?.position ?? null,
    name,
    avatarUrl: player?.avatarUrl ?? row?.avatarUrl,
    elo: Number(row?.eloRating ?? row?.elo ?? player?.eloRating ?? player?.elo ?? 0),
    wins: Number(row?.wins ?? row?.totalWins ?? row?.stats?.totalWins ?? player?.stats?.totalWins ?? 0),
    losses: Number(row?.losses ?? row?.totalLosses ?? row?.stats?.totalLosses ?? player?.stats?.totalLosses ?? 0),
    gamesPlayed: Number(row?.gamesPlayed ?? 0),
    isCalibrating: Boolean(row?.isCalibrating ?? false),
    // change: Number(row?.change ?? row?.eloChange ?? row?.eloDelta ?? 0),
    isCurrentUser: currentUserId != null && playerId === currentUserId,
  }
}

export default function GroupRankingPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [period, setPeriod] = useState<Period>('Geral')

  const { data: currentUserId } = useQuery<number | undefined>({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const response = await api.get('/auth/me')
      return response.data?.player?.id
    },
  })

  const {
    data: group,
    isLoading: isLoadingGroup,
    isError: hasGroupError,
  } = useQuery<GroupData>({
    queryKey: ['group', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await api.get(`/groups/${id}`)
      const payload = response.data?.data ?? response.data
      return mapGroup(payload)
    },
  })

  const {
    data: rankings = [],
    isLoading: isLoadingRanking,
    isError: hasRankingError,
  } = useQuery<RankingRowData[]>({
    queryKey: ['group-ranking', id, period, currentUserId],
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      const response = await api.get(`/groups/${id}/ranking`, {
        params: { period },
      })
      const payload = response.data?.data ?? response.data
      const rawRows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.ranking)
          ? payload.ranking
          : Array.isArray(payload?.rows)
            ? payload.rows
            : []

      return rawRows
        .map((row: any, index: number) => mapRankingRow(row, index, currentUserId))
        .filter((row: RankingRowData | null): row is RankingRowData => row !== null)
    },
  })

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-surface border-b-2 border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 -ml-2 hover:bg-background rounded-xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <ThemeToggle />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-1">
          {isLoadingGroup ? 'Carregando...' : group?.name ?? 'Grupo'}
        </h1>
        <p className="text-sm text-text-muted">
          {hasGroupError
            ? 'Nao foi possivel carregar os dados do grupo'
            : `${group?.memberCount ?? 0} jogadores ativos`}
        </p>
{/* 
        <div className="flex gap-2 mt-4">
          {(['Semana', 'Mês', 'Geral'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                period === p
                  ? 'bg-accent-primary text-accent-primary-foreground'
                  : 'bg-background text-text-muted hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div> */}
      </div>

      <div className="px-6 py-6 space-y-3">
        {isLoadingRanking ? (
          <div className="bg-surface rounded-xl p-4 text-sm text-text-muted">
            Carregando ranking...
          </div>
        ) : hasRankingError ? (
          <div className="bg-surface rounded-xl p-4 text-sm text-text-muted">
            Nao foi possivel carregar o ranking.
          </div>
        ) : rankings.length > 0 ? (
          <>
            {rankings
              .filter((row) => !row.isCalibrating)
              .map((row) => (
                <RankingRow
                  key={row.position}
                  position={row.position!}
                  name={row.name}
                  avatarUrl={row.avatarUrl}
                  elo={row.elo}
                  wins={row.wins}
                  losses={row.losses}
                  isCurrentUser={row.isCurrentUser}
                />
              ))}

            {rankings.some((row) => row.isCalibrating) && (
              <>
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold pt-2 px-1">
                  Em calibração
                </p>
                {rankings
                  .filter((row) => row.isCalibrating)
                  .map((row) => (
                    <CalibrationRow
                      key={row.name}
                      name={row.name}
                      avatarUrl={row.avatarUrl}
                      gamesPlayed={row.gamesPlayed}
                      isCurrentUser={row.isCurrentUser}
                    />
                  ))}
              </>
            )}
          </>
        ) : (
          <div className="bg-surface rounded-xl p-4 text-sm text-text-muted">
            Nenhum jogador encontrado neste ranking.
          </div>
        )}
      </div>

      <FAB
        onClick={() => router.push(`/groups/${id}/match`)}
        label="Registrar partida"
      />

      <BottomNav />
    </div>
  )
}
