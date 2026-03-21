'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, PrimaryButton, ThemeToggle } from '@/components/shared'
import { api } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const payload = isRegister ? { email, password, name } : { email, password }
      const { data } = await api.post(endpoint, payload)
      localStorage.setItem('token', data.token)
          
      router.push('/dashboard')
    } catch (err: any) {
      if (!err.response) {
        setError('Não foi possível conectar ao servidor. Tente mais tarde.')
      } else {
        setError(err.response?.data?.error || 'Ocorreu um erro. Tente novamente.')
      }
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-accent-primary rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-4xl">🏓</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">PingRank</h1>
          <p className="text-text-muted">
            {isRegister ? 'Crie sua conta' : 'Acompanhe seu ranking de ping pong'}
          </p>
        </div>

        {/* Form */}
        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                label="Nome completo"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="pt-2">
              <PrimaryButton type="submit" fullWidth size="lg" disabled={loading}>
                {loading ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
              </PrimaryButton>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setError(null)
              }}
              className="text-accent-primary hover:underline font-semibold"
            >
              {isRegister ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Criar conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
