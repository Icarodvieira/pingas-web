'use client'

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  variant: 'win' | 'loss' | 'draw'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant, children, className = '' }: BadgeProps) {
  const styles = {
    win: 'bg-success/20 text-success',
    loss: 'bg-danger/20 text-danger',
    draw: 'bg-text-muted/20 text-text-muted',
  }
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────
import { forwardRef } from 'react'

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: React.ReactNode
}

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, children, className = '', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none'
    const variants = {
      primary: 'bg-accent-primary text-accent-primary-foreground hover:bg-accent-primary-hover shadow-md',
      ghost: 'bg-transparent text-foreground hover:bg-surface',
      danger: 'bg-danger text-danger-foreground hover:bg-danger/90 shadow-md',
    }
    const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg' }
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)
PrimaryButton.displayName = 'PrimaryButton'

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block mb-2 text-sm font-medium text-foreground">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-input-background border-2 border-input-border rounded-xl text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ─── ThemeToggle ──────────────────────────────────────────────────────────────
import { Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'light' | 'dark') ?? 'dark'
    setTheme(saved)
    document.documentElement.classList.toggle('dark', saved === 'dark')
  }, [])

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return (
    <button onClick={toggle} className="p-2 rounded-xl bg-surface hover:bg-surface-elevated transition-all" aria-label="Alternar tema">
      {theme === 'light' ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-foreground" />}
    </button>
  )
}

// ─── FAB ──────────────────────────────────────────────────────────────────────
import { Plus } from 'lucide-react'

interface FABProps {
  onClick: () => void
  icon?: React.ReactNode
  label?: string
}

export function FAB({ onClick, icon, label }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-40 bg-accent-primary text-accent-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all"
      aria-label={label ?? 'Adicionar'}
    >
      <div className="w-14 h-14 flex items-center justify-center">
        {icon ?? <Plus className="w-6 h-6" />}
      </div>
    </button>
  )
}

// ─── BottomNav ────────────────────────────────────────────────────────────────
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, User } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) =>
    path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(path)

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Grupos' },
    // { href: '/groups', icon: Trophy, label: 'Rankings' },
    { href: '/profile', icon: User, label: 'Perfil' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t-2 border-border z-50">
      <div className="max-w-md mx-auto flex items-center justify-around px-6 py-3">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-1">
            <div className={`p-2 rounded-xl transition-all ${isActive(href) ? 'bg-accent-primary text-accent-primary-foreground' : 'text-text-muted hover:text-foreground'}`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className={`text-xs font-medium ${isActive(href) ? 'text-accent-primary' : 'text-text-muted'}`}>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export { InfiniteScrollIndicator } from './InfiniteScrollIndicator'
export { PlayerAvatar } from './PlayerAvatar'
