/**
 * useBalanceActivity
 *
 * Watches for new financial activity this month and surfaces the most recent
 * event so the BalanceCard can flash it for 4s then return to the anchor.
 *
 * Rules:
 *  - Default display: "Profit this month" (cumulative monthly P&L)
 *  - When a new event is detected (trade close, buy):
 *      → show that event for 4s, then back to anchor
 *  - Each event shows ONCE — no looping
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { get } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import type { BotTrade } from './useAlgorithmEngine'
import {
  formatPnlPct,
  formatSignedAmount,
  sumPeriodProfit,
  type ProfitTradeHistoryRow,
} from '../utils/computeProfit'

export type ActivityStyle = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

export interface ActivityItem {
  id: string
  style: ActivityStyle
  icon: string
  label: string
  amount: number
  amountLabel: string
  timestamp: string
}

interface Purchase {
  id: number
  userId: number
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  quantity: number
  price: number
  total: number
  createdAt?: string
  date?: string
}

export interface UseBalanceActivityResult {
  monthlyPnl: number
  monthlyPnlPct: number
  hasMonthlyActivity: boolean
  /** The single most-recent new event to flash, or null if nothing new */
  flashEvent: ActivityItem | null
  /** Call this after the flash has been shown to clear it */
  dismissFlash: () => void
  loading: boolean
  refetch: () => void
}

function isThisMonth(dateStr: string | undefined | null): boolean {
  if (!dateStr) return false
  try {
    const d = new Date(dateStr)
    const now = new Date()
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  } catch {
    return false
  }
}

export function useBalanceActivity(
  userId: number | undefined,
  balance: number,
  currencySymbol = '$',
): UseBalanceActivityResult {
  const [monthlyPnl, setMonthlyPnl] = useState(0)
  const [monthlyPnlPct, setMonthlyPnlPct] = useState(0)
  const [hasMonthlyActivity, setHasMonthlyActivity] = useState(false)
  const [flashEvent, setFlashEvent] = useState<ActivityItem | null>(null)
  const [loading, setLoading] = useState(true)

  const seenIds = useRef<Set<string>>(new Set())
  const latestTs = useRef<number>(0)
  const prevBalance = useRef(balance)

  const dismissFlash = useCallback(() => setFlashEvent(null), [])

  const compute = useCallback(async (detectNew = false) => {
    if (!userId) { setLoading(false); return }
    setLoading(true)

    try {
      const [botTrades, tradeHistory, purchases] = await Promise.all([
        get<BotTrade[]>(ENDPOINTS.botTrades(userId)).catch(() => [] as BotTrade[]),
        get<ProfitTradeHistoryRow[]>(ENDPOINTS.tradeHistory(userId)).catch(() => [] as ProfitTradeHistoryRow[]),
        get<Purchase[]>(ENDPOINTS.purchases(userId)).catch(() => [] as Purchase[]),
      ])

      const { total: pnl, hasActivity } = sumPeriodProfit('This Month', botTrades, tradeHistory)
      const pct = formatPnlPct(pnl, balance)

      setMonthlyPnl(pnl)
      setMonthlyPnlPct(pct)
      setHasMonthlyActivity(hasActivity)

      const candidates: ActivityItem[] = []

      for (const t of botTrades) {
        if (t.status !== 'closed') continue
        const dateStr = t.closedAt ?? t.openedAt
        if (!isThisMonth(dateStr)) continue

        const tradePnl = t.finalPnl ?? t.pnl ?? 0
        candidates.push({
          id: `trade-${t.id}`,
          style: tradePnl >= 0 ? 'success' : 'danger',
          icon: tradePnl >= 0 ? 'fas fa-chart-line' : 'fas fa-chart-line-down',
          label: tradePnl >= 0 ? `Trade Win · ${t.pair}` : `Trade Loss · ${t.pair}`,
          amount: tradePnl,
          amountLabel: formatSignedAmount(tradePnl, currencySymbol),
          timestamp: dateStr ?? '',
        })
      }

      for (const t of tradeHistory) {
        if (t.status !== 'completed') continue
        const dateStr = t.date
          ? `${t.date} ${t.time ?? ''}`.trim()
          : null
        if (!isThisMonth(dateStr)) continue

        const tradePnl = t.profitLoss ?? 0
        const label = t.pair ?? t.assetSymbol ?? 'Trade'
        candidates.push({
          id: `history-${t.id}`,
          style: tradePnl >= 0 ? 'success' : 'danger',
          icon: tradePnl >= 0 ? 'fas fa-chart-line' : 'fas fa-chart-line-down',
          label: tradePnl >= 0 ? `Trade Win · ${label}` : `Trade Loss · ${label}`,
          amount: tradePnl,
          amountLabel: formatSignedAmount(tradePnl, currencySymbol),
          timestamp: dateStr ?? '',
        })
      }

      for (const p of purchases) {
        const dateStr = p.createdAt ?? p.date
        if (!isThisMonth(dateStr)) continue

        const cost = -(p.total ?? p.price * p.quantity)
        candidates.push({
          id: `buy-${p.id}`,
          style: 'info',
          icon: p.type === 'stock' ? 'fas fa-building-columns' : 'fas fa-coins',
          label: `Bought ${p.symbol} · ${p.type === 'stock' ? 'Stock' : 'Crypto'}`,
          amount: cost,
          amountLabel: formatSignedAmount(cost, currencySymbol),
          timestamp: dateStr ?? '',
        })
      }

      if (detectNew) {
        candidates.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )

        const newEvent = candidates.find((c) => {
          if (seenIds.current.has(c.id)) return false
          const ts = new Date(c.timestamp).getTime()
          return !Number.isNaN(ts) && ts > latestTs.current
        })

        if (newEvent) {
          seenIds.current.add(newEvent.id)
          latestTs.current = new Date(newEvent.timestamp).getTime()
          setFlashEvent(newEvent)
        }
      } else {
        for (const c of candidates) {
          seenIds.current.add(c.id)
          const ts = new Date(c.timestamp).getTime()
          if (!Number.isNaN(ts) && ts > latestTs.current) latestTs.current = ts
        }
      }
    } catch (e) {
      console.error('[useBalanceActivity]', e)
    } finally {
      setLoading(false)
    }
  }, [userId, balance, currencySymbol])

  useEffect(() => {
    void compute(false)
  }, [compute])

  useEffect(() => {
    if (prevBalance.current !== balance) {
      prevBalance.current = balance
      void compute(true)
    }
  }, [balance, compute])

  useEffect(() => {
    const id = setInterval(() => void compute(true), 30_000)
    return () => clearInterval(id)
  }, [compute])

  return {
    monthlyPnl,
    monthlyPnlPct,
    hasMonthlyActivity,
    flashEvent,
    dismissFlash,
    loading,
    refetch: () => void compute(true),
  }
}
