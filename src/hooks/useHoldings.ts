import { useState, useEffect } from 'react'
import { getHoldings } from '../services/holdingService'
import type { Holding } from '../services/holdingService'

interface UseHoldingsResult {
  holdings: Holding[]
  loading: boolean
  error: string | null
}

export function useHoldings(userId: number | undefined): UseHoldingsResult {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    getHoldings(userId)
      .then((data) => {
        setHoldings(data)
        setError(null)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load holdings')
      })
      .finally(() => setLoading(false))
  }, [userId])

  return { holdings, loading, error }
}
