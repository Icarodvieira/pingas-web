'use client'

import { useState } from 'react'
import { Plus, Copy, Check } from 'lucide-react'
import { BottomNav, FAB, ThemeToggle, Input, PrimaryButton } from '@/components/shared'
import { GroupCard } from '@/components/groups'
import { api } from '@/lib/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'

//TODO: Refatorar para usar SWR ou React Query pra cache e revalidação automática dos dados dos grupos

interface Group {
  id: string
  name: string
  memberCount: number
  userPosition: number | null
  userElo: number
  isCalibrating: boolean
  gamesPlayed: number
}

interface GroupResponse {
  groupId: number
  groupName: string
  inviteCode: string
  eloRating: number
  wins: number
  losses: number
  draws: number
  gamesPlayed: number
  isCalibrating: boolean
  joinedAt: string
  position: number | null
  memberCount: number
}

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [modalTab, setModalTab] = useState<'create' | 'join'>('create')
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [newGroupInviteCode, setNewGroupInviteCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const { data: authData, isLoading: isLoadingAuth } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => api.get('/auth/me').then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  })

  const playerId: number | null = authData?.player?.id ?? null
  const playerName: string = authData?.player?.name ?? ''

  const {
    data: resolvedGroups = [],
    isLoading: isLoadingGroups,
  } = useQuery<Group[]>({
    queryKey: ['player-groups', playerId],
    enabled: Boolean(playerId),
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      const response = await api.get<GroupResponse[]>(`/players/${playerId}/groups`)
      return response.data.map((group) => ({
        id: group.groupId.toString(),
        name: group.groupName,
        memberCount: group.memberCount,
        userPosition: group.position ?? null,
        userElo: group.eloRating,
        isCalibrating: Boolean(group.isCalibrating),
        gamesPlayed: Number(group.gamesPlayed ?? 0),
      }))
    },
  })

  // Mostra loading enquanto: auth carregando, playerId ainda não resolvido, ou grupos carregando
  const loading = isLoadingAuth || !playerId || isLoadingGroups

  const handleCreateGroup = async () => {
    const trimmedGroupName = groupName.trim()
    if (!trimmedGroupName) return

    try {
      setError('')
      setActionLoading(true)
      const response = await api.post('/groups', { name: trimmedGroupName })
      setGroupName('')
      setShowModal(false)
      setNewGroupInviteCode(response.data.inviteCode)
      setShowInviteModal(true)
      await queryClient.invalidateQueries({ queryKey: ['player-groups', playerId] })
    } catch (err) {
      console.error('Failed to create group', err)
      setError('Erro ao criar grupo')
    } finally {
      setActionLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) return

    try {
      setError('')
      setActionLoading(true)
      await api.post('/groups/join', { inviteCode: inviteCode.trim() })
      setInviteCode('')
      setShowModal(false)
      await queryClient.invalidateQueries({ queryKey: ['player-groups', playerId] })
    } catch (err) {
      console.error('Failed to join group', err)
      setError('Código inválido ou grupo não encontrado')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCopyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(newGroupInviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-surface border-b-2 border-border px-6 py-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-foreground">Meus Grupos</h1>
          <ThemeToggle />
        </div>
        <p className="text-text-muted">Olá, {playerName}! 👋</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="px-6 py-12 text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-text-muted mt-4">Carregando grupos...</p>
        </div>
      ) : (
        <>
          {/* Groups */}
          <div className="flex flex-col gap-3 px-6 py-6">
            {resolvedGroups.map((group) => (
              <GroupCard key={group.id} {...group} />
            ))}
          </div>

          {/* Empty State */}
          {resolvedGroups.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center">
                <Plus className="w-10 h-10 text-text-muted" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Nenhum grupo ainda</h3>
              <p className="text-text-muted mb-6">Crie ou entre em um grupo para começar!</p>
            </div>
          )}
        </>
      )}

      <FAB onClick={() => setShowModal(true)} label="Criar ou entrar em grupo" />
      <BottomNav />

      {/* Modal - Criar/Entrar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-surface w-full max-w-md rounded-t-3xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-border rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-bold text-foreground mb-4">Criar ou Entrar em Grupo</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {(['create', 'join'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setModalTab(tab)
                    setError('')
                  }}
                  className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                    modalTab === tab 
                      ? 'bg-accent-primary text-accent-primary-foreground' 
                      : 'bg-background text-text-muted'
                  }`}
                >
                  {tab === 'create' ? 'Criar grupo' : 'Entrar com código'}
                </button>
              ))}
            </div>

            {/* Error in Modal */}
            {error && (
              <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm">
                {error}
              </div>
            )}

            {modalTab === 'create' ? (
              <div className="space-y-4">
                <Input 
                  label="Nome do grupo" 
                  placeholder="Ex: Time Labs" 
                  value={groupName} 
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={actionLoading}
                />
                <PrimaryButton 
                  fullWidth 
                  disabled={!groupName.trim() || actionLoading}
                  onClick={handleCreateGroup}
                >
                  {actionLoading ? 'Criando...' : 'Criar grupo'}
                </PrimaryButton>
              </div>
            ) : (
              <div className="space-y-4">
                <Input 
                  label="Código de convite" 
                  placeholder="Ex: ABC123" 
                  value={inviteCode} 
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  disabled={actionLoading}
                  maxLength={6}
                />
                <PrimaryButton 
                  fullWidth 
                  disabled={inviteCode.length !== 6 || actionLoading}
                  onClick={handleJoinGroup}
                >
                  {actionLoading ? 'Entrando...' : 'Entrar no grupo'}
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal - Código de Convite */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-8 max-w-sm w-full animate-scale-in">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 bg-accent-primary/10 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-accent-primary" />
            </div>

            <h2 className="text-2xl font-bold text-foreground text-center mb-2">Grupo Criado! 🎉</h2>
            <p className="text-text-muted text-center mb-6">Compartilhe este código com seus amigos</p>

            {/* Invite Code Display */}
            <div className="bg-background rounded-xl p-6 mb-6">
              <p className="text-text-muted text-center text-sm mb-2">Código de convite</p>
              <div className="flex items-center justify-between gap-4">
                <code className="text-3xl font-bold text-accent-primary tracking-widest">
                  {newGroupInviteCode}
                </code>
                <button
                  onClick={handleCopyInviteCode}
                  className="p-3 bg-accent-primary/10 hover:bg-accent-primary/20 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="w-6 h-6 text-accent-primary" />
                  ) : (
                    <Copy className="w-6 h-6 text-accent-primary" />
                  )}
                </button>
              </div>
            </div>

            {/* Feedback */}
            {copied && (
              <p className="text-center text-sm text-green-600 dark:text-green-400 mb-4">
                ✓ Código copiado!
              </p>
            )}

            {/* Close Button */}
            <PrimaryButton 
              fullWidth 
              onClick={() => setShowInviteModal(false)}
            >
              Fechar
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  )
}
