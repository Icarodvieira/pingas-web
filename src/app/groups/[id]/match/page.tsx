'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { PrimaryButton, ThemeToggle } from '@/components/shared'
import { MatchCard } from '@/components/matches'
import { calculateElo } from '@/lib/elo'

// TODO: substituir por useQuery(() => api.get(`/groups/${id}`)) — membros reais do grupo
const groupMembers = [
  { id: '1', name: 'Ícaro Santos', elo: 1847, gamesPlayed: 47 },
  { id: '2', name: 'Pedro Silva',  elo: 1923, gamesPlayed: 52 },
  { id: '3', name: 'Ana Costa',    elo: 1782, gamesPlayed: 38 },
  { id: '4', name: 'Carlos Lima',  elo: 1654, gamesPlayed: 29 },
  { id: '5', name: 'Julia Mendes', elo: 1598, gamesPlayed: 24 },
]

// TODO: substituir por useQuery(() => api.get(`/groups/${id}/matches?limit=5`))
const recentMatches = [
  { player1Name: 'Pedro Silva', player1Score: 11, player1EloChange: 8,  player2Name: 'Ícaro Santos', player2Score: 7,  player2EloChange: -8,  date: 'Hoje, 14:30' },
  { player1Name: 'Ícaro Santos', player1Score: 11, player1EloChange: 12, player2Name: 'Ana Costa',   player2Score: 9,  player2EloChange: -12, date: 'Hoje, 13:15' },
  { player1Name: 'Carlos Lima',  player1Score: 11, player1EloChange: 15, player2Name: 'Julia Mendes', player2Score: 8,  player2EloChange: -15, date: 'Ontem, 18:45' },
]

type Member = typeof groupMembers[0]

export default function RegisterMatchPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [player1, setPlayer1] = useState<Member | null>(null)
  const [player2, setPlayer2] = useState<Member | null>(null)
  const [score1, setScore1] = useState('')
  const [score2, setScore2] = useState('')
  const [showP1Select, setShowP1Select] = useState(false)
  const [showP2Select, setShowP2Select] = useState(false)
  const [loading, setLoading] = useState(false)

  const s1 = parseInt(score1) || 0
  const s2 = parseInt(score2) || 0
  const hasScores = score1 !== '' && score2 !== ''

  const eloPreview =
    player1 && player2 && hasScores
      ? calculateElo(player1.elo, player2.elo, s1, s2, player1.gamesPlayed, player2.gamesPlayed)
      : null

  const canSubmit = player1 && player2 && hasScores && player1.id !== player2.id

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      // TODO: await api.post('/matches', { groupId: id, player1Id: player1.id, player2Id: player2.id, scoreP1: s1, scoreP2: s2 })
      router.push(`/groups/${id}`)
    } finally {
      setLoading(false)
    }
  }

  const PlayerSelector = ({
    selected, onSelect, exclude, show, setShow,
  }: {
    selected: Member | null
    onSelect: (m: Member) => void
    exclude: Member | null
    show: boolean
    setShow: (v: boolean) => void
  }) => (
    <div className="flex-1 relative">
      <button
        onClick={() => setShow(!show)}
        className="w-full p-4 bg-surface rounded-xl text-left hover:bg-surface-elevated transition-all border-2 border-transparent focus:border-accent-primary"
      >
        {selected ? (
          <div>
            <p className="font-semibold text-foreground">{selected.name}</p>
            <p className="text-xs text-text-muted font-mono">ELO {selected.elo}</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Selecionar</span>
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </div>
        )}
      </button>

      {show && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl shadow-lg border-2 border-border z-10 max-h-60 overflow-y-auto">
          {groupMembers
            .filter((m) => m.id !== exclude?.id)
            .map((member) => (
              <button
                key={member.id}
                onClick={() => { onSelect(member); setShow(false) }}
                className="w-full p-3 text-left hover:bg-background transition-all"
              >
                <p className="font-semibold text-foreground">{member.name}</p>
                <p className="text-xs text-text-muted font-mono">ELO {member.elo}</p>
              </button>
            ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-surface border-b-2 border-border px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.push(`/groups/${id}`)}
            className="p-2 -ml-2 hover:bg-background rounded-xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <ThemeToggle />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Nova Partida</h1>
      </div>

      <div className="px-6 py-6">
        {/* Seleção de jogadores */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wide">Jogadores</h2>
          <div className="flex items-center gap-3">
            <PlayerSelector
              selected={player1} onSelect={setPlayer1} exclude={player2}
              show={showP1Select} setShow={setShowP1Select}
            />
            <div className="px-3 py-2 bg-accent-primary/20 rounded-lg flex-shrink-0">
              <span className="font-bold text-accent-primary text-sm">VS</span>
            </div>
            <PlayerSelector
              selected={player2} onSelect={setPlayer2} exclude={player1}
              show={showP2Select} setShow={setShowP2Select}
            />
          </div>
        </div>

        {/* Placar */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wide">Placar</h2>
          <div className="flex items-center gap-3">
            <input
              type="number" value={score1} onChange={(e) => setScore1(e.target.value)}
              placeholder="0" min="0"
              className="flex-1 text-center text-4xl font-bold font-mono bg-surface rounded-xl p-6 text-foreground focus:outline-none focus:ring-2 focus:ring-accent-primary border-2 border-transparent focus:border-accent-primary"
            />
            <span className="text-2xl font-bold text-text-muted flex-shrink-0">—</span>
            <input
              type="number" value={score2} onChange={(e) => setScore2(e.target.value)}
              placeholder="0" min="0"
              className="flex-1 text-center text-4xl font-bold font-mono bg-surface rounded-xl p-6 text-foreground focus:outline-none focus:ring-2 focus:ring-accent-primary border-2 border-transparent focus:border-accent-primary"
            />
          </div>
        </div>

        {/* Preview ELO */}
        {eloPreview && (
          <div className="mb-8 p-4 bg-accent-primary/10 rounded-xl border-2 border-accent-primary/20">
            <h3 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wide">Mudança de ELO</h3>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-sm text-text-muted mb-1 truncate max-w-[100px]">{player1?.name}</p>
                <p className={`text-2xl font-bold font-mono ${eloPreview.player1Change > 0 ? 'text-success' : eloPreview.player1Change < 0 ? 'text-danger' : 'text-text-muted'}`}>
                  {eloPreview.player1Change > 0 ? '+' : ''}{eloPreview.player1Change}
                </p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <p className="text-sm text-text-muted mb-1 truncate max-w-[100px]">{player2?.name}</p>
                <p className={`text-2xl font-bold font-mono ${eloPreview.player2Change > 0 ? 'text-success' : eloPreview.player2Change < 0 ? 'text-danger' : 'text-text-muted'}`}>
                  {eloPreview.player2Change > 0 ? '+' : ''}{eloPreview.player2Change}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirmar */}
        <PrimaryButton onClick={handleSubmit} disabled={!canSubmit || loading} fullWidth size="lg">
          {loading ? 'Salvando...' : 'Confirmar Partida'}
        </PrimaryButton>

        {/* Partidas recentes */}
        <div className="mt-12">
          <h2 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wide">Partidas Recentes</h2>
          <div className="space-y-3">
            {recentMatches.map((match, i) => (
              <MatchCard key={i} {...match} currentUserName="Ícaro Santos" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
