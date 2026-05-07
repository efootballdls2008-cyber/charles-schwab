/**
 * useNotifications — fetches user notifications from the DB and listens for
 * real-time updates via the shared Socket.io connection (SocketContext).
 *
 * Notification types:
 *   deposit | withdrawal | trade | order | bot_open | bot_close |
 *   take_profit | stop_loss | system | security | price_alert
 */
import { useState, useEffect, useCallback } from 'react'
import { get, patch, del } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { useSocket } from '../context/SocketContext'

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'trade'
  | 'deposit'
  | 'withdrawal'
  | 'price_alert'
  | 'security'
  | 'system'
  | 'order'
  | 'bot_open'
  | 'bot_close'
  | 'take_profit'
  | 'stop_loss'

export interface Notification {
  id: number
  userId: number
  type: NotificationType
  title: string
  message: string
  /** ISO timestamp */
  timestamp: string
  read: boolean
  relatedId?: string | null
  relatedType?: string | null
}

// ── Raw shape from backend ────────────────────────────────────────────────────

interface RawNotification {
  id: number
  userId: number
  type: string
  title: string
  message: string
  isRead: boolean
  relatedId?: string | null
  relatedType?: string | null
  createdAt: string
}

function rawToNotification(r: RawNotification): Notification {
  return {
    id: r.id,
    userId: r.userId,
    type: (r.type as NotificationType) || 'system',
    title: r.title,
    message: r.message,
    timestamp: r.createdAt,
    read: !!r.isRead,
    relatedId: r.relatedId ?? null,
    relatedType: r.relatedType ?? null,
  }
}

// ── Hook result ───────────────────────────────────────────────────────────────

export interface UseNotificationsResult {
  notifications: Notification[]
  loading: boolean
  error: string | null
  unreadCount: number
  markAsRead: (id: number) => void
  markAllAsRead: () => void
  deleteNotification: (id: number) => void
  refresh: () => void
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNotifications(userId: number | undefined): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { socket } = useSocket()

  // ── Load from DB ────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    try {
      const raw = await get<RawNotification[]>(ENDPOINTS.userNotifications(userId))
      const mapped = (raw ?? [])
        .map(rawToNotification)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setNotifications(mapped)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { void load() }, [load])

  // ── Socket.io real-time updates ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !userId) return

    const handleNew = (raw: RawNotification) => {
      // Only process notifications for this user
      if (raw.userId !== undefined && raw.userId !== userId) return
      const notif = rawToNotification(raw)
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notif.id)) return prev
        return [notif, ...prev]
      })
    }

    const handleUpdated = (raw: RawNotification) => {
      if (raw.userId !== undefined && raw.userId !== userId) return
      setNotifications((prev) =>
        prev.map((n) => (n.id === raw.id ? { ...n, read: !!raw.isRead } : n))
      )
    }

    const handleAllRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

    const handleDeleted = ({ id }: { id: number }) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    socket.on('notification:new', handleNew)
    socket.on('notification:updated', handleUpdated)
    socket.on('notification:allRead', handleAllRead)
    socket.on('notification:deleted', handleDeleted)

    return () => {
      socket.off('notification:new', handleNew)
      socket.off('notification:updated', handleUpdated)
      socket.off('notification:allRead', handleAllRead)
      socket.off('notification:deleted', handleDeleted)
    }
  }, [socket, userId])

  // ── Actions ─────────────────────────────────────────────────────────────────

  const markAsRead = useCallback((id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    void patch(ENDPOINTS.userNotificationById(id), { isRead: true }).catch(() => {/* ignore */})
  }, [])

  const markAllAsRead = useCallback(() => {
    if (!userId) return
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    void patch(ENDPOINTS.userNotificationsMarkAllRead(userId), {}).catch(() => {/* ignore */})
  }, [userId])

  const deleteNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    void del(ENDPOINTS.userNotificationById(id)).catch(() => {/* ignore */})
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: load,
  }
}
