/**
 * useProfitOverview
 *
 * Computes profit chart data directly from the user's closed bot trades
 * and trade_history records — no dependency on the admin-managed
 * profit_overview table.
 *
 * Periods:
 *   Today      → hourly buckets (12AM–11PM) for the current calendar day
 *   This Week  → Mon–Sun of the current ISO week
 *   This Month → day-of-month buckets (1–31) for the current month
 *   This Year  → Jan–Dec of the current year
 */

import { useState, useEffect, useCallback } from 'react'
import { get } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import type { BotTrade } from './useAlgorithmEngine'

export type ProfitPeriod = 'Today' | 'This Week' | 'This Month' | 'This Year'

export interface ProfitDataPoint {
  day: string
  profit: number
}

export interface ComputedProfitOverview {
  period: ProfitPeriod
  data: ProfitDataPoint[]
}

interface TradeHistoryRow {
  id: number
  profitLoss: number | null
  date: string | null
  time: string | null
  status: string
}

// ── Bucket helpers ────────────────────────────────────────────────────────────

const HOUR_LABELS = [
  '12AM','1AM','2AM','3AM','4AM','5AM','6AM','7AM','8AM','9AM','10AM','11AM',
  '12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM','9PM','10PM','11PM',
]

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function isoWeekDay(d: Date): number {
  // Returns 0=Mon … 6=Sun
  return (d.getDay() + 6) % 7
}

function startOfISOWeek(d: Date): Date {
  const day = isoWeekDay(d)
  const start = new Date(d)
  start.setDate(d.getDate() - day)
  start.setHours(0, 0, 0, 0)
  return start
}

function buildBuckets(period: ProfitPeriod): Map<string, number> {
  const now = new Date()
  const map = new Map<string, number>()

  if (period === 'Today') {
    HOUR_LABELS.forEach(h => map.set(h, 0))
  } else if (period === 'This Week') {
    DAY_LABELS.forEach(d => map.set(d, 0))
  } else if (period === 'This Month') {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    for (let i = 1; i <= daysInMonth; i++) map.set(String(i), 0)
  } else {
    MONTH_LABELS.forEach(m => map.set(m, 0))
  }
  return map
}

function bucketKey(period: ProfitPeriod, date: Date): string | null {
  const now = new Date()

  if (period === 'Today') {
    if (
      date.getFullYear() !== now.getFullYear() ||
      date.getMonth() !== now.getMonth() ||
      date.getDate() !== now.getDate()
    ) return null
    return HOUR_LABELS[date.getHours()]
  }

  if (period === 'This Week') {
    const weekStart = startOfISOWeek(now)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    if (date < weekStart || date >= weekEnd) return null
    return DAY_LABELS[isoWeekDay(date)]
  }

  if (period === 'This Month') {
    if (date.getFullYear() !== now.getFullYear() || date.getMonth() !== now.getMonth()) return null
    return String(date.getDate())
  }

  // This Year
  if (date.getFullYear() !== now.getFullYear()) return null
  return MONTH_LABELS[date.getMonth()]
}

function parseDate(row: { date?: string | null; time?: string | null; closedAt?: string | null; openedAt?: string | null }): Date | null {
  // Try ISO closedAt/openedAt first (bot trades)
  const iso = row.closedAt ?? row.openedAt
  if (iso) {
    const d = new Date(iso)
    if (!isNaN(d.getTime())) return d
  }
  // Fall back to date+time strings (trade_history)
  if (row.date) {
    const d = new Date(`${row.date} ${row.time ?? ''}`.trim())
    if (!isNaN(d.getTime())) return d
  }
  return null
}

function accumulate(
  buckets: Map<string, number>,
  period: ProfitPeriod,
  pnl: number,
  date: Date,
) {
  const key = bucketKey(period, date)
  if (key === null) return
  buckets.set(key, (buckets.get(key) ?? 0) + pnl)
}

function bucketsToPoints(buckets: Map<string, number>): ProfitDataPoint[] {
  return Array.from(buckets.entries()).map(([day, profit]) => ({
    day,
    profit: parseFloat(profit.toFixed(2)),
  }))
}

// ── Hook ──────────────────────────────────────────────────────────────────────

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
        get<TradeHistoryRow[]>(ENDPOINTS.tradeHistory(userId)).catch(() => [] as TradeHistoryRow[]),
      ])

      const periods: ProfitPeriod[] = ['Today', 'This Week', 'This Month', 'This Year']
      const result: ComputedProfitOverview[] = periods.map(period => {
        const buckets = buildBuckets(period)
        let processedBotTrades = 0
        let processedTradeHistory = 0

        // Closed bot trades
        for (const t of botTrades) {
          if (t.status !== 'closed') continue
          const pnl = t.finalPnl ?? t.pnl ?? 0
          if (pnl === 0) continue
          const date = parseDate({ closedAt: t.closedAt, openedAt: t.openedAt })
          if (!date) continue
          accumulate(buckets, period, pnl, date)
          processedBotTrades++
        }

        // Trade history rows (admin-created or written by auto-close)
        for (const t of tradeHistory) {
          if (t.status !== 'completed') continue
          const pnl = t.profitLoss ?? 0
          if (pnl === 0) continue
          const date = parseDate({ date: t.date, time: t.time })
          if (!date) continue
          accumulate(buckets, period, pnl, date)
          processedTradeHistory++
        }

        const points = bucketsToPoints(buckets)

        // Only include buckets up to the current time for Today/This Week/This Month
        // so the chart doesn't show future empty bars
        const trimmed = trimFutureBuckets(period, points)

        return { period, data: trimmed }
      })

      setData(result)
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

// ── Trim future empty buckets ─────────────────────────────────────────────────
// For Today: only show hours up to the current hour
// For This Week: only show days up to today
// For This Month: only show days up to today's date
// For This Year: only show months up to the current month

function trimFutureBuckets(period: ProfitPeriod, points: ProfitDataPoint[]): ProfitDataPoint[] {
  const now = new Date()

  if (period === 'Today') {
    const currentHour = now.getHours()
    return points.filter((_, i) => i <= currentHour)
  }

  if (period === 'This Week') {
    const todayIdx = isoWeekDay(now)
    return points.filter((_, i) => i <= todayIdx)
  }

  if (period === 'This Month') {
    const todayDate = now.getDate()
    return points.filter(p => parseInt(p.day) <= todayDate)
  }

  if (period === 'This Year') {
    const currentMonth = now.getMonth()
    return points.filter((_, i) => i <= currentMonth)
  }

  return points
}
