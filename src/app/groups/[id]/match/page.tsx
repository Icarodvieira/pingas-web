'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import { PrimaryButton, ThemeToggle } from '@/components/shared'
import { MatchCard } from '@/components/matches'
import { calculateElo } from '@/lib/elo'
import { getInitials } from '@/lib/utils'

const groupMembers = [
  { id: '1', name: 'Ícaro Santos', elo: 1847, gamesPlayed: 47 },
  { id: '2', name: 'Pedro Silva',  elo: 1923, gamesPlayed: 52 },
  { id: '3', name: 'Ana Costa',    elo: 1782, gamesPlayed: 38 },
  { id: '4', name: 'Carlos Lima',  elo: 1654, gamesPlayed: 29 },
  { id: '5', name: 'Julia Mendes', elo: 1598, gamesPlayed: 24 },
]


const recentMatches = [
  { player1Name: 'Pedro Silva',  player1Score: 11, player1EloChange: 8,  player2Name: 'Ícaro Santos', player2Score: 7, player2EloChange: -8,  date: 'Hoje, 14:30' },
  { player1Name: 'Ícaro Santos', player1Score: 11, player1EloChange: 12, player2Name: 'Ana Costa',    player2Score: 9, player2EloChange: -12, date: 'Hoje, 13:15' },
  { player1Name: 'Carlos Lima',  player1Score: 11, player1EloChange: 15, player2Name: 'Julia Mendes', player2Score: 8, player2EloChange: -15, date: 'Ontem, 18:45' },
]

type Member = typeof groupMembers[0]

function PlayerSelector({ selected, onSelect, exclude, show, setShow, label }: {
  selected: Member | null
  onSelect: (m: Member) => void
  exclude: Member | null
  show: boolean
  setShow: (v: boolean) => void
  label: string
}) {
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
            <p className="text-xs text-text-muted font-mono">{selected.elo}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center">
              <Plus className="w-4 h-4 text-text-muted" />
            </div>
            <span className="text-text-muted text-sm">Selecionar</span>
          </div>
        )}
      </button>

      {show && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl shadow-xl border-2 border-border z-20 max-h-56 overflow-y-auto">
          {groupMembers
            .filter((m) => m.id !== exclude?.id)
            .map((member) => (
              <button
                key={member.id}
                onClick={() => { onSelect(member); setShow(false) }}
                className="w-full px-4 py-3 text-left hover:bg-surface-elevated transition-all flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-primary font-bold text-xs">{getInitials(member.name)}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{member.name}</p>
                  <p className="text-xs text-text-muted font-mono">ELO {member.elo}</p>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

function ScoreControl({ value, onChange, playerName, isWinning }: {
  value: number
  onChange: (v: number) => void
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
  const id = params.id as string

  const [player1, setPlayer1] = useState<Member | null>(null)
  const [player2, setPlayer2] = useState<Member | null>(null)
  const [score1, setScore1] = useState(0)
  const [score2, setScore2] = useState(0)
  const [showP1Select, setShowP1Select] = useState(false)
  const [showP2Select, setShowP2Select] = useState(false)
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState(recentMatches)

  const hasScore = score1 > 0 || score2 > 0
  const canSubmit = player1 && player2 && hasScore

  const eloPreview =
    player1 && player2 && hasScore
      ? calculateElo(player1.elo, player2.elo, score1, score2, player1.gamesPlayed, player2.gamesPlayed)
      : null

const handleSubmit = async () => {
  if (!canSubmit) return
  setLoading(true)
  try {
    // TODO: await api.post('/matches', { ... })

    setMatches(prev => [{
      player1Name: player1!.name,
      player1Score: score1,
      player1EloChange: eloPreview?.player1Change ?? 0,
      player2Name: player2!.name,
      player2Score: score2,
      player2EloChange: eloPreview?.player2Change ?? 0,
      date: 'Agora',
    }, ...prev])

    setPlayer1(null)
    setPlayer2(null)
    setScore1(0)
    setScore2(0)
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
            <PlayerSelector label="Jogador 1" selected={player1} onSelect={setPlayer1} exclude={player2} show={showP1Select} setShow={setShowP1Select} />
            <div className="flex-shrink-0 mt-8">
              <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <span className="font-bold text-accent-primary text-xs">VS</span>
              </div>
            </div>
            <PlayerSelector label="Jogador 2" selected={player2} onSelect={setPlayer2} exclude={player1} show={showP2Select} setShow={setShowP2Select} />
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-text-muted mb-4 uppercase tracking-wide">Placar</h2>
          <div className="flex items-center gap-4">
            <ScoreControl value={score1} onChange={setScore1} playerName={player1?.name} isWinning={score1 > score2} />
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-text-muted">—</span>
              {score1 === score2 && hasScore && (
                <span className="text-xs text-warning font-semibold">Empate</span>
              )}
            </div>
            <ScoreControl value={score2} onChange={setScore2} playerName={player2?.name} isWinning={score2 > score1} />
          </div>
        </div>

        {eloPreview && score1 !== score2 && (
          <div className="p-4 bg-accent-primary/10 rounded-xl border-2 border-accent-primary/20">
            <h3 className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wide">Variação de ELO</h3>
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
              Placar empatado — confirme apenas se foi realmente um empate
            </p>
          </div>
        )}

        <PrimaryButton onClick={handleSubmit} disabled={!canSubmit || loading} fullWidth size="lg">
          {loading ? 'Salvando...' : 'Confirmar Partida'}
        </PrimaryButton>

        <div>
          <h2 className="text-xs font-semibold text-text-muted mb-4 uppercase tracking-wide">Partidas Recentes</h2>
          <div className="space-y-3">
            {matches.map((match, i) => (
              <div key={i} className="bg-surface rounded-xl p-3">
                <div className="flex items-center gap-2">
                  {/* Jogador 1 */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent-primary font-bold text-xs">{getInitials(match.player1Name)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${match.player1Score > match.player2Score ? 'text-success' : 'text-foreground'}`}>
                        {match.player1Name.split(' ')[0]}
                      </p>
                      <p className={`text-xs font-mono font-bold ${match.player1EloChange > 0 ? 'text-success' : 'text-danger'}`}>
                        {match.player1EloChange > 0 ? '+' : ''}{match.player1EloChange}
                      </p>
                    </div>
                  </div>

                  {/* Placar */}
                  <div className="flex-shrink-0 px-3 py-1 bg-background rounded-lg">
                    <p className="font-mono font-bold text-foreground text-sm">
                      {match.player1Score} — {match.player2Score}
                    </p>
                    <p className="text-xs text-text-muted text-center">{match.date}</p>
                  </div>

                  {/* Jogador 2 */}
                  <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse">
                    <div className="w-7 h-7 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent-primary font-bold text-xs">{getInitials(match.player2Name)}</span>
                    </div>
                    <div className="min-w-0 text-right">
                      <p className={`text-sm font-semibold truncate ${match.player2Score > match.player1Score ? 'text-success' : 'text-foreground'}`}>
                        {match.player2Name.split(' ')[0]}
                      </p>
                      <p className={`text-xs font-mono font-bold ${match.player2EloChange > 0 ? 'text-success' : 'text-danger'}`}>
                        {match.player2EloChange > 0 ? '+' : ''}{match.player2EloChange}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}