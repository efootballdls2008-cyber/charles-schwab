/**
 * useBalanceActivity
 *
 * Watches for new financial activity this month and surfaces the most recent
 * event so the BalanceCard can flash it for 4s then return to the anchor.
 *
 * Rules:
 *  - Default display: "Profit this month" (cumulative monthly P&L)
 *  - When a new event is detected (deposit, withdrawal, trade close, buy):
 *      → show that event for 4s, then back to anchor
 *  - Each event shows ONCE — no looping
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { get } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import type { BotTrade } from './useAlgorithmEngine'

export type ActivityStyle = 'success' | 'danger' | 'warning' | 'info'

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

function fmtAmt(n: number): string {
  const sign = n >= 0 ? '+' : ''
  return `${sign}$${Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function useBalanceActivity(
  userId: number | undefined,
  balance: number,
): UseBalanceActivityResult {
  const [monthlyPnl, setMonthlyPnl]   = useState(0)
  const [monthlyPnlPct, setMonthlyPnlPct] = useState(0)
  const [flashEvent, setFlashEvent]   = useState<ActivityItem | null>(null)
  const [loading, setLoading]         = useState(true)

  // Track the IDs we've already shown so we never re-flash the same event
  const seenIds = useRef<Set<string>>(new Set())
  // Track the latest event timestamp so we only surface truly new ones
  const latestTs = useRef<number>(0)
  const prevBalance = useRef(balance)

  const dismissFlash = useCallback(() => setFlashEvent(null), [])

  const compute = useCallback(async (detectNew = false) => {
    if (!userId) { setLoading(false); return }
    setLoading(true)

    try {
      const [botTrades, purchases] = await Promise.all([
        get<BotTrade[]>(ENDPOINTS.botTrades(userId)).catch(() => [] as BotTrade[]),
        get<Purchase[]>(ENDPOINTS.purchases(userId)).catch(() => [] as Purchase[]),
      ])

      let pnl = 0
      const candidates: ActivityItem[] = []

      // ── Bot trades (closed) — only trading P&L counts toward "profit" ──
      for (const t of botTrades) {
        if (t.status !== 'closed') continue
        const dateStr = t.closedAt ?? t.openedAt
        if (!isThisMonth(dateStr)) continue

        const tradePnl = t.finalPnl ?? t.pnl ?? 0
        pnl += tradePnl

        candidates.push({
          id: `trade-${t.id}`,
          style: tradePnl >= 0 ? 'success' : 'danger',
          icon: tradePnl >= 0 ? 'fas fa-chart-line' : 'fas fa-chart-line-down',
          label: tradePnl >= 0 ? `Trade Win · ${t.pair}` : `Trade Loss · ${t.pair}`,
          amount: tradePnl,
          amountLabel: fmtAmt(tradePnl),
          timestamp: dateStr ?? '',
        })
      }

      // ── Asset purchases — cost reduces profit ───────────────────────────
      for (const p of purchases) {
        const dateStr = p.createdAt ?? p.date
        if (!isThisMonth(dateStr)) continue

        const cost = -(p.total ?? p.price * p.quantity)
        pnl += cost

        candidates.push({
          id: `buy-${p.id}`,
          style: 'info',
          icon: p.type === 'stock' ? 'fas fa-building-columns' : 'fas fa-coins',
          label: `Bought ${p.symbol} · ${p.type === 'stock' ? 'Stock' : 'Crypto'}`,
          amount: cost,
          amountLabel: fmtAmt(cost),
          timestamp: dateStr ?? '',
        })
      }

      // Update cumulative P&L
      const pct = balance > 0 ? parseFloat(((pnl / balance) * 100).toFixed(2)) : 0
      setMonthlyPnl(parseFloat(pnl.toFixed(2)))
      setMonthlyPnlPct(pct)

      // ── Detect new event to flash ───────────────────────────────────────
      if (detectNew) {
        // Sort newest first
        candidates.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )

        // Find the most recent event we haven't shown yet
        const newEvent = candidates.find((c) => {
          if (seenIds.current.has(c.id)) return false
          const ts = new Date(c.timestamp).getTime()
          return ts > latestTs.current
        })

        if (newEvent) {
          seenIds.current.add(newEvent.id)
          latestTs.current = new Date(newEvent.timestamp).getTime()
          setFlashEvent(newEvent)
        }
      } else {
        // On first load: mark all existing events as seen so we don't flash old ones
        for (const c of candidates) {
          seenIds.current.add(c.id)
          const ts = new Date(c.timestamp).getTime()
          if (ts > latestTs.current) latestTs.current = ts
        }
      }
    } catch (e) {
      console.error('[useBalanceActivity]', e)
    } finally {
      setLoading(false)
    }
  }, [userId, balance])

  // Initial load — mark all existing as seen, no flash
  useEffect(() => {
    void compute(false)
  }, [compute])

  // Re-fetch when balance changes (trade closed, deposit approved, etc.)
  // This time detect new events to flash
  useEffect(() => {
    if (prevBalance.current !== balance) {
      prevBalance.current = balance
      void compute(true)
    }
  }, [balance, compute])

  // Poll every 30s to catch events that don't change the balance
  // (e.g. a purchase that was already deducted)
  useEffect(() => {
    const id = setInterval(() => void compute(true), 30_000)
    return () => clearInterval(id)
  }, [compute])

  return {
    monthlyPnl,
    monthlyPnlPct,
    flashEvent,
    dismissFlash,
    loading,
    refetch: () => void compute(true),
  }
}
