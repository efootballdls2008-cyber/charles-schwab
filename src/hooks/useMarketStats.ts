import { useState, useEffect } from 'react'
import { getMarketStats } from '../services/marketService'
import type { MarketStat } from '../services/marketService'

interface UseMarketStatsResult {
  stats: MarketStat[]
  loading: boolean
  error: string | null
}

export function useMarketStats(): UseMarketStatsResult {
  const [stats, setStats] = useState<MarketStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMarketStats()
      .then((data) => {
        setStats(data)
        setError(null)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load market stats')
      })
      .finally(() => setLoading(false))
  }, [])

  return { stats, loading, error }
}
