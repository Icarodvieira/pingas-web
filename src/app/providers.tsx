'use client'

import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minuto
      retry: 1,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  // Aplica dark mode como padrão
  useEffect(() => {
    const saved = localStorage.getItem('theme') ?? 'dark'
    document.documentElement.classList.toggle('dark', saved === 'dark')
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
