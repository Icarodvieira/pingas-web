interface InfiniteScrollIndicatorProps {
  isLoading: boolean
  hasMore: boolean
  itemCount: number
  loadingMessage?: string
  endMessage?: string
  emptyMessage?: string
}

export function InfiniteScrollIndicator({
  isLoading,
  hasMore,
  itemCount,
  loadingMessage = 'Carregando...',
  endMessage = 'Fim do histórico',
  emptyMessage = 'Nenhum item encontrado',
}: InfiniteScrollIndicatorProps) {
  if (isLoading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-text-muted">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  if (!hasMore && itemCount > 0) {
    return (
      <div className="py-8 flex items-center justify-center">
        <p className="text-xs text-text-muted">{endMessage}</p>
      </div>
    )
  }

  if (itemCount === 0) {
    return (
      <div className="py-8 flex items-center justify-center">
        <p className="text-xs text-text-muted">{emptyMessage}</p>
      </div>
    )
  }

  return null
}
