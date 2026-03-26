import { useState, useCallback, useRef, useEffect } from 'react'

interface UseInfiniteScrollOptions {
  initialLimit?: number
}

interface UseInfiniteScrollReturn {
  items: any[]
  isLoading: boolean
  hasMore: boolean
  observerTarget: React.RefObject<HTMLDivElement>
  loadMore: (newItems: any[]) => void
  reset: () => void
}

export function useInfiniteScroll(
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const { initialLimit = 5 } = options

  const [items, setItems] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const isLoadingRef = useRef(false)

  const loadMore = useCallback(
    (newItems: any[]) => {
      setItems((prev) => [...prev, ...newItems])
      offsetRef.current += initialLimit
      setHasMore(newItems.length === initialLimit)
      setIsLoading(false)
      isLoadingRef.current = false
    },
    [initialLimit]
  )

  const reset = useCallback(() => {
    setItems([])
    setHasMore(true)
    setIsLoading(false)
    offsetRef.current = 0
    isLoadingRef.current = false
  }, [])

  const startLoading = useCallback(() => {
    if (isLoadingRef.current || !hasMore) return
    isLoadingRef.current = true
    setIsLoading(true)
  }, [hasMore])

  // Intersection Observer para infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          startLoading()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, isLoading, startLoading])

  return {
    items,
    isLoading,
    hasMore,
    observerTarget,
    loadMore,
    reset,
  }
}
