import { useState, useEffect, useCallback } from 'react'
import { get, patch } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import type { BotTrade } from './useAlgorithmEngine'

export interface Notification {
  id: number
  userId: number
  type: 'trade' | 'deposit' | 'withdrawal' | 'price_alert' | 'security' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
}

// ── Raw deposit shape from db.json ────────────────────────────────────────────
interface RawDeposit {
  id: number
  userId: number
  type: 'deposit' | 'withdraw'
  method: string
  amount: number
  currency: string
  status: string
  date: string
  time: string
  txId: string
  note?: string
}

interface UseNotificationsResult {
  notifications: Notification[]
  loading: boolean
  error: string | null
  unreadCount: number
  markAsRead: (id: number) => void
  markAllAsRead: () => void
  deleteNotification: (id: number) => void
  refresh: () => void
}

// ── Synthesise a Notification from a deposit row ──────────────────────────────
function depositToNotification(d: RawDeposit): Notification {
  const isDeposit = d.type === 'deposit'
  // Build an ISO timestamp from "2026-05-06" + "8:10 AM"
  const ts = (() => {
    try {
      return new Date(`${d.date} ${d.time}`).toISOString()
    } catch {
      return new Date().toISOString()
    }
  })()

  return {
    id: d.id,
    userId: d.userId,
    type: isDeposit ? 'deposit' : 'withdrawal',
    title: isDeposit
      ? `Deposit — $${d.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `Withdrawal — $${d.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    message: `${d.method} · ${d.txId}${d.note ? ` · ${d.note}` : ''}`,
    timestamp: ts,
    read: false,
  }
}

// ── Synthesise a Notification from a bot trade ────────────────────────────────
function tradeToNotification(t: BotTrade, baseId: number): Notification {
  const isClosed = t.status === 'closed'
  const profit   = t.pnl >= 0
  return {
    id: baseId,
    userId: typeof t.userId === 'number' ? t.userId : 1,
    type: 'trade',
    title: isClosed
      ? `Trade Closed — ${t.pair} ${profit ? '▲' : '▼'} $${Math.abs(t.pnl).toFixed(2)}`
      : `Trade Opened — ${t.pair} ${t.side.toUpperCase()}`,
    message: `${t.strategy ?? 'Manual'} · ${t.side === 'buy' ? 'Long' : 'Short'} · Entry $${t.entryPrice.toLocaleString()}`,
    timestamp: isClosed && t.closedAt ? t.closedAt : t.openedAt,
    read: isClosed, // closed trades start as read; open ones are "new"
  }
}

export function useNotifications(userId: number | undefined): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([])
  // Track which ids the user has manually marked read / deleted this session
  const [readIds,    setReadIds]    = useState<Set<number>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    try {
      const [deposits, botTrades] = await Promise.all([
        get<RawDeposit[]>(ENDPOINTS.deposits(userId)).catch(() => [] as RawDeposit[]),
        get<BotTrade[]>(ENDPOINTS.botTrades(userId)).catch(() => [] as BotTrade[]),
      ])

      const depositNotifs: Notification[] = deposits.map(depositToNotification)

      // Use a high base id so trade ids don't clash with deposit ids
      const tradeNotifs: Notification[] = botTrades.map((t, i) =>
        tradeToNotification(t, 10000 + i)
      )

      const all = [...depositNotifs, ...tradeNotifs]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setNotifications(all)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { void load() }, [load])

  // Apply session-level read/delete overrides on top of loaded data
  const visible = notifications
    .filter((n) => !deletedIds.has(n.id))
    .map((n) => readIds.has(n.id) ? { ...n, read: true } : n)

  const markAsRead = useCallback((id: number) => {
    setReadIds((prev) => new Set([...prev, id]))
    // Best-effort persist to db if the notification is a real deposit record
    if (id < 10000) {
      void patch(ENDPOINTS.notificationById(id), { read: true }).catch(() => {/* ignore */})
    }
  }, [])

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => new Set([...prev, ...notifications.map((n) => n.id)]))
  }, [notifications])

  const deleteNotification = useCallback((id: number) => {
    setDeletedIds((prev) => new Set([...prev, id]))
  }, [])

  const unreadCount = visible.filter((n) => !n.read).length

  return {
    notifications: visible,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: load,
  }
}
