import { useState, useEffect, useCallback } from 'react'
import { getDeposits } from '../services/depositService'
import type { Deposit } from '../services/depositService'

interface UseDepositsResult {
  deposits: Deposit[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDeposits(userId: number | undefined): UseDepositsResult {
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    getDeposits(userId)
      .then((data) => {
        setDeposits(data)
        setError(null)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load deposits')
      })
      .finally(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { deposits, loading, error, refetch: fetch }
}
