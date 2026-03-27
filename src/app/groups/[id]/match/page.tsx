'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import { PrimaryButton, ThemeToggle } from '@/components/shared'
import { InfiniteScrollIndicator } from '@/components/shared/InfiniteScrollIndicator'
import { MatchCard } from '@/components/matches'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { api } from '@/lib/api'
import { calculateElo } from '@/lib/elo'
import { getInitials } from '@/lib/utils'

type Member = {
  id: string
  name: string
  elo: number
  gamesPlayed: number
}

type RecentMatch = {
  id: string
  player1Name: string
  player1Avatar?: string | null
  player1Score: number
  player1EloChange: number
  player2Name: string
  player2Avatar?: string | null
  player2Score: number
  player2EloChange: number
  date: string
}

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

function formatMatchDate(value?: string) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  if (date.toDateString() === now.toDateString()) {
    return `Hoje, ${timeFormatter.format(date)}`
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return `Ontem, ${timeFormatter.format(date)}`
  }

  return shortDateFormatter.format(date)
}

function normalizeIdForApi(value: string) {
  return /^\d+$/.test(value) ? Number(value) : value
}

function mapGroupMember(member: any): Member | null {
  const player = member?.player ?? member
  const id = member?.playerId ?? player?.id ?? member?.id
  const name = player?.name ?? member?.name

  if (id == null || !name) return null

  return {
    id: String(id),
    name,
    elo: Number(member?.eloRating ?? member?.elo ?? player?.eloRating ?? player?.elo ?? 0),
    gamesPlayed: Number(
      member?.gamesPlayed ??
      member?.totalGames ??
      member?.stats?.totalGames ??
      player?.stats?.totalGames ??
      (Number(member?.wins ?? 0) + Number(member?.losses ?? 0) + Number(member?.draws ?? 0))
    ),
  }
}

function mapRecentMatch(match: any, index: number): RecentMatch | null {
  const player1Name = match?.player1?.name ?? match?.player1Name
  const player2Name = match?.player2?.name ?? match?.player2Name

  if (!player1Name || !player2Name) return null

  return {
    id: String(match?.id ?? `${match?.playedAt ?? 'match'}-${index}`),
    player1Name,
    player1Avatar: match?.player1?.avatarUrl ?? match?.player1Avatar ?? null,
    player1Score: Number(match?.scoreP1 ?? match?.player1Score ?? 0),
    player1EloChange: Number(match?.eloChangeP1 ?? match?.player1EloChange ?? 0),
    player2Name,
    player2Avatar: match?.player2?.avatarUrl ?? match?.player2Avatar ?? null,
    player2Score: Number(match?.scoreP2 ?? match?.player2Score ?? 0),
    player2EloChange: Number(match?.eloChangeP2 ?? match?.player2EloChange ?? 0),
    date: formatMatchDate(match?.playedAt ?? match?.date),
  }
}

function PlayerSelector({
  members,
  selected,
  onSelect,
  exclude,
  show,
  setShow,
  label,
  isLoading,
  hasError,
}: {
  members: Member[]
  selected: Member | null
  onSelect: (member: Member) => void
  exclude: Member | null
  show: boolean
  setShow: (value: boolean) => void
  label: string
  isLoading: boolean
  hasError: boolean
}) {
  const availableMembers = members.filter((member) => member.id !== exclude?.id)

  return (
    <div className="flex-1 relative">
      <p className="text-xs text-text-muted font-semibold uppercase tracking-wide mb-2 text-center">{label}</p>
      <button
        onClick={() => setShow(!show)}
        className={`w-full p-3 bg-surface rounded-xl text-center hover:bg-surface-elevated transition-all border-2 ${
          selected ? 'border-accent-primary/40' : 'border-transparent'
        }`}
      >
        {selected ? (
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
              <span className="text-accent-primary font-bold text-sm">{getInitials(selected.name)}</span>
            </div>
            <p className="font-semibold text-foreground text-sm">{selected.name.split(' ')[0]}</p>
            {selected.gamesPlayed < 10 ? (
              <span className="text-[10px] text-warning font-semibold bg-warning/10 px-1.5 py-0.5 rounded-full">
                Calibração {selected.gamesPlayed}/10
              </span>
            ) : (
              <p className="text-xs text-text-muted font-mono">{selected.elo} ELO</p>
            )}
            <p className="text-[11px] text-text-muted">{selected.gamesPlayed} jogos</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center">
              <Plus className="w-4 h-4 text-text-muted" />
            </div>
            <span className="text-text-muted text-sm">
              {isLoading ? 'Carregando...' : hasError ? 'Indisponivel' : 'Selecionar'}
            </span>
          </div>
        )}
      </button>

      {show && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl shadow-xl border-2 border-border z-20 max-h-56 overflow-y-auto">
          {availableMembers.length > 0 ? (
            availableMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => {
                  onSelect(member)
                  setShow(false)
                }}
                className="w-full px-4 py-3 text-left hover:bg-surface-elevated transition-all flex items-center gap-3"
              >
                {/* <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-primary font-bold text-xs">{getInitials(member.name)}</span>
                </div> */}
                <div>
                  <p className="font-semibold text-foreground text-sm">{member.name}</p>
                  {member.gamesPlayed < 10 ? (
                    <p className="text-xs text-warning font-semibold font-mono">
                      Calibração · {member.gamesPlayed}/10 jogos
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted font-mono">
                      ELO {member.elo} · {member.gamesPlayed} jogos
                    </p>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-text-muted">
              {isLoading
                ? 'Carregando jogadores do grupo...'
                : hasError
                  ? 'Nao foi possivel carregar os jogadores.'
                  : 'Nenhum jogador disponivel.'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ScoreControl({ value, onChange, playerName, isWinning }: {
  value: number
  onChange: (value: number) => void
  playerName?: string
  isWinning: boolean
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-3">
      {playerName && (
        <p className="text-xs text-text-muted font-semibold truncate max-w-full text-center">
          {playerName.split(' ')[0]}
        </p>
      )}
      <button
        onClick={() => onChange(value + 1)}
        className="w-14 h-14 rounded-full bg-accent-primary text-white flex items-center justify-center hover:bg-accent-primary-hover active:scale-95 transition-all shadow-md"
      >
        <Plus className="w-6 h-6" />
      </button>
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
        isWinning ? 'bg-accent-primary/20 ring-2 ring-accent-primary' : 'bg-surface'
      }`}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          className={`w-full h-full text-center text-4xl font-bold font-mono bg-transparent focus:outline-none ${
            isWinning ? 'text-accent-primary' : 'text-foreground'
          }`}
        />
      </div>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-14 h-14 rounded-full bg-surface text-foreground flex items-center justify-center hover:bg-surface-elevated active:scale-95 transition-all border-2 border-border"
      >
        <Minus className="w-6 h-6" />
      </button>
    </div>
  )
}

export default function RegisterMatchPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const id = params.id as string

  const {
    data: groupMembers = [],
    isLoading: isLoadingMembers,
    isError: hasMemberLoadError,
  } = useQuery<Member[]>({
    queryKey: ['group-members', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await api.get(`/groups/${id}`)
      const group = response.data?.data ?? response.data
      const rawMembers = Array.isArray(group?.members)
        ? group.members
        : Array.isArray(group?.players)
          ? group.players
          : []

      return rawMembers
        .map(mapGroupMember)
        .filter((member: Member | null): member is Member => member !== null)
    },
  })

  const {
    items: infiniteMatches,
    isLoading: isLoadingInfiniteMatches,
    hasMore: hasMoreMatches,
    observerTarget: matchesObserverTarget,
    loadMore: loadMoreMatches,
    reset: resetMatches,
  } = useInfiniteScroll({ initialLimit: 5 })

  const hasMatchesLoadError = false

  // Carrega matches sempre que o observer aciona (inclui carga inicial via startLoading no mount)
  useEffect(() => {
    if (!isLoadingInfiniteMatches || !id) return

    const offset = infiniteMatches.length

    const fetchMoreMatches = async () => {
      try {
        const response = await api.get(`/groups/${id}/matches?limit=5&offset=${offset}`)
        const payload = response.data?.data ?? response.data
        const rawMatches = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : []

        const newMatches = rawMatches
          .map(mapRecentMatch)
          .filter((match: RecentMatch | null): match is RecentMatch => match !== null)

        loadMoreMatches(newMatches)
      } catch (error) {
        console.error('Erro ao carregar mais partidas:', error)
        loadMoreMatches([])
      }
    }

    fetchMoreMatches()
  }, [isLoadingInfiniteMatches, id, infiniteMatches.length, loadMoreMatches])

  const [player1, setPlayer1] = useState<Member | null>(null)
  const [player2, setPlayer2] = useState<Member | null>(null)
  const [score1, setScore1] = useState(0)
  const [score2, setScore2] = useState(0)
  const [showP1Select, setShowP1Select] = useState(false)
  const [showP2Select, setShowP2Select] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const hasScore = score1 > 0 || score2 > 0
  const canSubmit = player1 && player2 && hasScore

  const eloPreview =
    player1 && player2 && hasScore
      ? calculateElo(player1.elo, player2.elo, score1, score2, player1.gamesPlayed, player2.gamesPlayed)
      : null

  const handleSubmit = async () => {
    if (!canSubmit) return

    setSubmitError('')
    setLoading(true)
    try {
      await api.post('/matches', {
        groupId: normalizeIdForApi(id),
        player1Id: normalizeIdForApi(player1.id),
        player2Id: normalizeIdForApi(player2.id),
        scoreP1: score1,
        scoreP2: score2,
      })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['group-members', id] }),
        queryClient.invalidateQueries({ queryKey: ['group-ranking', id] }),
        queryClient.invalidateQueries({ queryKey: ['group', id] }),
        queryClient.invalidateQueries({ queryKey: ['player-groups'], exact: false }),
      ])

      resetMatches()

      setPlayer1(null)
      setPlayer2(null)
      setScore1(0)
      setScore2(0)
    } catch (error) {
      if (isAxiosError(error)) {
        const message =
          error.response?.data?.message ??
          error.response?.data?.error ??
          'Nao foi possivel registrar a partida.'

        setSubmitError(Array.isArray(message) ? message.join(', ') : String(message))
        return
      }

      setSubmitError('Nao foi possivel registrar a partida.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-surface border-b-2 border-border px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => router.push(`/groups/${id}`)} className="p-2 -ml-2 hover:bg-background rounded-xl transition-all">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <ThemeToggle />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Nova Partida</h1>
      </div>

      <div className="px-6 py-6 space-y-8">
        <div>
          <h2 className="text-xs font-semibold text-text-muted mb-4 uppercase tracking-wide">Jogadores</h2>
          <div className="flex items-start gap-4">
            <PlayerSelector
              members={groupMembers}
              selected={player1}
              onSelect={setPlayer1}
              exclude={player2}
              show={showP1Select}
              setShow={setShowP1Select}
              label="Jogador 1"
              isLoading={isLoadingMembers}
              hasError={hasMemberLoadError}
            />
            <div className="flex-shrink-0 mt-8">
              <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <span className="font-bold text-accent-primary text-xs">VS</span>
              </div>
            </div>
            <PlayerSelector
              members={groupMembers}
              selected={player2}
              onSelect={setPlayer2}
              exclude={player1}
              show={showP2Select}
              setShow={setShowP2Select}
              label="Jogador 2"
              isLoading={isLoadingMembers}
              hasError={hasMemberLoadError}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-text-muted mb-4 uppercase tracking-wide">Placar</h2>
          <div className="flex items-center gap-4">
            <ScoreControl value={score1} onChange={setScore1} playerName={player1?.name} isWinning={score1 > score2} />
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-text-muted">-</span>
              {score1 === score2 && hasScore && (
                <span className="text-xs text-warning font-semibold">Empate</span>
              )}
            </div>
            <ScoreControl value={score2} onChange={setScore2} playerName={player2?.name} isWinning={score2 > score1} />
          </div>
        </div>

        {eloPreview && score1 !== score2 && (
          <div className="p-4 bg-accent-primary/10 rounded-xl border-2 border-accent-primary/20">
            <h3 className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wide">Variacao de ELO</h3>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-sm text-text-muted mb-1">{player1?.name.split(' ')[0]}</p>
                <p className={`text-3xl font-bold font-mono ${eloPreview.player1Change > 0 ? 'text-success' : 'text-danger'}`}>
                  {eloPreview.player1Change > 0 ? '+' : ''}{eloPreview.player1Change}
                </p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-sm text-text-muted mb-1">{player2?.name.split(' ')[0]}</p>
                <p className={`text-3xl font-bold font-mono ${eloPreview.player2Change > 0 ? 'text-success' : 'text-danger'}`}>
                  {eloPreview.player2Change > 0 ? '+' : ''}{eloPreview.player2Change}
                </p>
              </div>
            </div>
          </div>
        )}

        {score1 === score2 && hasScore && (
          <div className="p-4 bg-warning/10 rounded-xl border-2 border-warning/20 text-center">
            <p className="text-sm text-warning font-semibold">
              Placar empatado - confirme apenas se foi realmente um empate
            </p>
          </div>
        )}

        <PrimaryButton onClick={handleSubmit} disabled={!canSubmit || loading} fullWidth size="lg">
          {loading ? 'Salvando...' : 'Confirmar Partida'}
        </PrimaryButton>

        {submitError && (
          <div className="p-4 bg-danger/10 rounded-xl border-2 border-danger/20 text-center">
            <p className="text-sm text-danger font-semibold">{submitError}</p>
          </div>
        )}

        <div>
          <h2 className="text-xs font-semibold text-text-muted mb-4 uppercase tracking-wide">Histórico</h2>
          <div className="space-y-3">
            {infiniteMatches.length > 0 ? (
              infiniteMatches.map((match) => (
                <MatchCard key={match.id} {...match} />
              ))
            ) : isLoadingInfiniteMatches && infiniteMatches.length === 0 ? (
              <div className="bg-surface rounded-xl p-4 text-sm text-text-muted">
                Carregando partidas...
              </div>
            ) : hasMatchesLoadError ? (
              <div className="bg-surface rounded-xl p-4 text-sm text-text-muted">
                Nao foi possivel carregar o histórico.
              </div>
            ) : (
              <div className="bg-surface rounded-xl p-4 text-sm text-text-muted">
                Nenhuma partida registrada ainda.
              </div>
            )}
            <div ref={matchesObserverTarget} className="py-4 flex items-center justify-center">
              <InfiniteScrollIndicator
                isLoading={isLoadingInfiniteMatches}
                hasMore={hasMoreMatches}
                itemCount={infiniteMatches.length}
                loadingMessage="Carregando mais partidas..."
                endMessage="Fim do histórico"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
