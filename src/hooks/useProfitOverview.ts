import { useState, useEffect, useCallback } from 'react'
import { getProfitOverview } from '../services/profitOverviewService'
import type { ProfitOverview } from '../services/profitOverviewService'

interface UseProfitOverviewResult {
  data: ProfitOverview[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProfitOverview(userId: number | undefined): UseProfitOverviewResult {
  const [data, setData] = useState<ProfitOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    getProfitOverview(userId)
      .then((result) => {
        setData(result)
        setError(null)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load profit data')
      })
      .finally(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
