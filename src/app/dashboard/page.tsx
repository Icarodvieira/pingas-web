'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { BottomNav, FAB, ThemeToggle, Input, PrimaryButton } from '@/components/shared'
import { GroupCard } from '@/components/groups'
import { api } from '@/lib/api'

// TODO: substituir por useQuery(() => api.get('/players/me/groups'))
const mockGroups = [
  { id: '1', name: 'Inovação', memberCount: 12, userPosition: 2, userElo: 1847 },
  { id: '2', name: 'CALL', memberCount: 8, userPosition: 1, userElo: 1923 },
  { id: '3', name: 'IFsul', memberCount: 6, userPosition: 4, userElo: 1654 },
]

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false)
  const [modalTab, setModalTab] = useState<'create' | 'join'>('create')
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const handleCreateGroup = async () => {
    const trimmedGroupName = groupName.trim()
    if (!trimmedGroupName) return

    try {
      await api.post('/groups', { name: trimmedGroupName })
      setGroupName('')
      setShowModal(false)
    } catch (error) {
      console.error('Failed to create group', error)
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
        <p className="text-text-muted">Olá! 👋</p>
      </div>

      {/* Groups */}
      <div className="flex flex-col gap-3 px-6 py-6">
        {mockGroups.map((group) => (
          <GroupCard key={group.id} {...group} />
        ))}
      </div>

      {mockGroups.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center">
            <Plus className="w-10 h-10 text-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Nenhum grupo ainda</h3>
          <p className="text-text-muted mb-6">Crie ou entre em um grupo para começar!</p>
        </div>
      )}

      <FAB onClick={() => setShowModal(true)} label="Criar ou entrar em grupo" />
      <BottomNav />

      {/* Modal */}
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
                  onClick={() => setModalTab(tab)}
                  className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${modalTab === tab ? 'bg-accent-primary text-accent-primary-foreground' : 'bg-background text-text-muted'}`}
                >
                  {tab === 'create' ? 'Criar grupo' : 'Entrar com código'}
                </button>
              ))}
            </div>

            {modalTab === 'create' ? (
              <div className="space-y-4">
                <Input label="Nome do grupo" placeholder="Ex: Time Labs" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                <PrimaryButton fullWidth disabled={!groupName.trim()} onClick={handleCreateGroup}>
                  Criar grupo
                </PrimaryButton>
              </div>
            ) : (
              <div className="space-y-4">
                <Input label="Código de convite" placeholder="Ex: ABC123" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} />
                <PrimaryButton fullWidth disabled={!inviteCode}>
                  {/* TODO: api.post('/groups/join', { inviteCode }) */}
                  Entrar no grupo
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
