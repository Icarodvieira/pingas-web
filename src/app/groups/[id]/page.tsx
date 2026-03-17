'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { BottomNav, FAB, ThemeToggle } from '@/components/shared'
import { RankingRow } from '@/components/groups'

type Period = 'Semana' | 'Mês' | 'Geral'

// TODO: substituir por useQuery(() => api.get(`/groups/${id}`))
const mockGroup = { name: 'Escritório SP', memberCount: 12 }

// TODO: substituir por useQuery(() => api.get(`/groups/${id}/ranking?period=${period}`))
const mockRankings = [
  { position: 1, name: 'Pedro Rodrigues',   elo: 1923, wins: 15, losses: 3,  change: 12 },
  { position: 2, name: 'Ícaro Vieira',  elo: 1847, wins: 12, losses: 5,  change: 8, isCurrentUser: true },
  { position: 3, name: 'Ana Costa',     elo: 1782, wins: 11, losses: 6,  change: -5 },
  { position: 4, name: 'Adriano Porto',   elo: 1654, wins: 8,  losses: 9,  change: 3 },
  { position: 5, name: 'Matheus Leuck',  elo: 1598, wins: 7,  losses: 10, change: -12 },
  { position: 6, name: 'Gabriel Mincaroni',    elo: 1523, wins: 6,  losses: 11, change: 0 },
  { position: 7, name: 'Maria Souza',   elo: 1487, wins: 5,  losses: 12, change: -8 },
  { position: 8, name: 'Lucas Alves',   elo: 1423, wins: 4,  losses: 13, change: -15 },
]

export default function GroupRankingPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [period, setPeriod] = useState<Period>('Geral')

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
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

        <h1 className="text-2xl font-bold text-foreground mb-1">{mockGroup.name}</h1>
        <p className="text-sm text-text-muted">{mockGroup.memberCount} jogadores ativos</p>

        {/* Period Filter */}
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
        </div>
      </div>

      {/* Ranking */}
      <div className="px-6 py-6 space-y-3">
        {mockRankings.map((row) => (
          <RankingRow key={row.position} {...row} />
        ))}
      </div>

      {/* FAB — Registrar partida */}
      <FAB
        onClick={() => router.push(`/groups/${id}/match`)}
        label="Registrar partida"
      />

      <BottomNav />
    </div>
  )
}
