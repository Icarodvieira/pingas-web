'use client'

import { ThemeToggle } from '@/components/shared'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getInitials } from '@/lib/utils'
import { api } from '@/lib/api'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function EditProfilePage() {
  const router = useRouter()
  const [playerId, setPlayerId] = useState<number | null>(null)
  const [player, setPlayer] = useState<any>(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/auth/me').then((res) => {
      setPlayerId(res.data.player.id)
      setPlayer(res.data.player)
      setNome(res.data.player.name || '')
      setEmail(res.data.email || '')
    })
  }, [])

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFoto(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setFotoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const isEmailValid = email.length === 0 || emailRegex.test(email)
  const isNomeValid = nome.trim().length > 0
  const hasChanges = nome !== player?.name || email !== player?.email || foto !== null
  const canSubmit = isNomeValid && isEmailValid && hasChanges && !loading

  const handleSalvar = async () => {
    if (!canSubmit || !playerId) return

    setError('')
    setLoading(true)
    
    try {
      await api.patch(`/players/${playerId}`, {
        name: nome,
        email: email,
      })
      
      router.push('/profile')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar perfil. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const initials = getInitials(nome)

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-surface border-b-2 border-border px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => router.push('/profile')} 
            className="p-2 -ml-2 hover:bg-background rounded-xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <ThemeToggle />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Editar Perfil</h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Foto de perfil */}
        {/* TODO: Ativar upload de foto amanhã */}
        {/* <div className="flex flex-col items-center">
          <div className="relative mb-4 group">
            <div className="w-32 h-32 rounded-full bg-accent-primary/20 flex items-center justify-center">
              {fotoPreview ? (
                <img 
                  src={fotoPreview} 
                  alt="Preview" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-accent-primary font-bold text-5xl">{initials}</span>
              )}
            </div>
            <label
              htmlFor="foto-input"
              className="absolute bottom-0 right-0 w-10 h-10 bg-accent-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-accent-primary/80 transition-all active:scale-95 shadow-lg"
            >
              <svg className="w-5 h-5 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </label>
            <input
              id="foto-input"
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="hidden"
            />
          </div>
          {fotoPreview && (
            <button
              onClick={() => {
                setFoto(null)
                setFotoPreview(null)
              }}
              className="text-xs text-danger hover:text-danger/80 transition-colors"
            >
              Remover foto
            </button>
          )}
        </div> */}

        {/* Avatar simples REMOVER AO INTEGRAR FOTO*/} 
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <span className="text-accent-primary font-bold text-5xl">{initials}</span>
          </div>
        </div>

        {/* Formulário */}
        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="text-sm font-semibold text-text-muted mb-2 block uppercase tracking-wide">
              Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              className={`w-full bg-background border-2 rounded-lg px-4 py-3 text-foreground placeholder-text-muted focus:outline-none transition-all ${
                isNomeValid 
                  ? 'border-border focus:border-accent-primary' 
                  : 'border-danger focus:border-danger'
              }`}
            />
            {!isNomeValid && (
              <p className="text-xs text-danger mt-1">Nome não pode ser vazio</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-text-muted mb-2 block uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@example.com"
              className={`w-full bg-background border-2 rounded-lg px-4 py-3 text-foreground placeholder-text-muted focus:outline-none transition-all ${
                isEmailValid 
                  ? 'border-border focus:border-accent-primary' 
                  : 'border-danger focus:border-danger'
              }`}
            />
            {!isEmailValid && (
              <p className="text-xs text-danger mt-1">Email inválido</p>
            )}
          </div>
        </div>

        {/* Erros */}
        {error && (
          <div className="p-4 bg-danger/10 rounded-xl border-2 border-danger/20">
            <p className="text-sm text-danger font-semibold">{error}</p>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => router.push('/profile')}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg border-2 border-border text-foreground font-semibold hover:bg-background transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={!canSubmit}
            className="flex-1 px-4 py-3 rounded-lg bg-accent-primary text-background font-semibold hover:bg-accent-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}