'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { PlayerAvatar } from '@/components/shared'

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
      if (file.size > 2 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 2MB')
        return
      }
      setFoto(file)
      const reader = new FileReader()
      reader.onloadend = () => setFotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSalvar = async () => {
    if (!playerId) return
    setLoading(true)
    setError('')

    try {
      // Upload de avatar (se selecionou foto)
      if (foto) {
        const formData = new FormData()
        formData.append('avatar', foto)
        await api.post(`/players/${playerId}/avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      // Atualizar dados do perfil
      await api.put(`/players/${playerId}`, { name: nome, email })
      router.push('/profile')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b-2 border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-text-muted hover:text-foreground transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-foreground">Editar Perfil</h1>
          <div className="w-6" />
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Foto de perfil */}
        <div className="flex flex-col items-center">
          <label htmlFor="foto-input" className="cursor-pointer relative group">
            {fotoPreview ? (
              <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-accent-primary">
                <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <PlayerAvatar
                name={player?.name ?? ''}
                avatarUrl={player?.avatarUrl}
                size="lg"
                className="group-hover:opacity-80 transition-all"
              />
            )}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </label>
          <input
            id="foto-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFotoChange}
          />
          <p className="text-xs text-text-muted mt-2">Toque para alterar foto</p>
        </div>

        {/* Campo nome */}
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full mt-2 px-4 py-3 bg-surface border-2 border-border rounded-xl text-foreground focus:border-accent-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Campo email */}
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-2 px-4 py-3 bg-surface border-2 border-border rounded-xl text-foreground focus:border-accent-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Erro */}
        {error && (
          <p className="text-sm text-danger text-center">{error}</p>
        )}

        {/* Botão salvar */}
        <button
          onClick={handleSalvar}
          disabled={loading}
          className="w-full py-3 bg-accent-primary text-background font-bold rounded-xl hover:bg-accent-primary/90 transition-all disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}