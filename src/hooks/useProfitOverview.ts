/**
 * useProfitOverview
 *
 * Computes profit chart data directly from the user's closed bot trades
 * and trade_history records — no dependency on the admin-managed
 * profit_overview table.
 */

import { useState, useEffect, useCallback } from 'react'
import { get } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import type { BotTrade } from './useAlgorithmEngine'
import {
  computeAllPeriodProfit,
  type ComputedProfitOverview,
  type ProfitTradeHistoryRow,
} from '../utils/computeProfit'

export type { ProfitPeriod, ProfitDataPoint, ComputedProfitOverview } from '../utils/computeProfit'

interface UseProfitOverviewResult {
  data: ComputedProfitOverview[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProfitOverview(userId: number | undefined): UseProfitOverviewResult {
  const [data, setData] = useState<ComputedProfitOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const compute = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    try {
      const [botTrades, tradeHistory] = await Promise.all([
        get<BotTrade[]>(ENDPOINTS.botTrades(userId)).catch(() => [] as BotTrade[]),
        get<ProfitTradeHistoryRow[]>(ENDPOINTS.tradeHistory(userId)).catch(() => [] as ProfitTradeHistoryRow[]),
      ])

      setData(computeAllPeriodProfit(botTrades, tradeHistory))
      setError(null)
    } catch (err) {
      console.error('❌ useProfitOverview error:', err)
      setError(err instanceof Error ? err.message : 'Failed to compute profit data')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { compute() }, [compute])

  return { data, loading, error, refetch: compute }
}
