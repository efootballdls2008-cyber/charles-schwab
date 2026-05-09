/**
 * NotificationContext — single source of truth for user notifications.
 *
 * Replaces the pattern of calling useNotifications() in multiple components
 * (NotificationBell, NotificationToast, NotificationSound) which caused:
 *   - Multiple independent API fetches for the same data
 *   - Socket events only updating one hook instance, not all
 *   - Inconsistent unread counts across components
 *
 * Usage:
 *   Wrap your app (inside AuthProvider + SocketProvider) with <NotificationProvider>.
 *   Consume with useNotificationContext() anywhere in the tree.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { get, patch, del } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { useSocket } from './SocketContext'
import { useAuth } from '../hooks/useAuth'

// ── Types (re-exported so consumers don't need to import from useNotifications) ─

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
  | 'bot_activity'
  | 'profit_loss'

export type NotificationCategory =
  | 'trading'
  | 'wallet'
  | 'bot_activity'
  | 'profit_loss'
  | 'system_alerts'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Notification {
  id: number
  userId: number
  type: NotificationType
  category: NotificationCategory
  priority: NotificationPriority
  title: string
  message: string
  /** ISO timestamp */
  timestamp: string
  read: boolean
  relatedId?: string | null
  relatedType?: string | null
  metadata?: any
}

interface RawNotification {
  id: number
  userId: number
  type: string
  category: string
  priority: string
  title: string
  message: string
  isRead: boolean
  relatedId?: string | null
  relatedType?: string | null
  metadata?: any
  createdAt: string
  updatedAt: string
}

function rawToNotification(r: RawNotification): Notification {
  return {
    id: r.id,
    userId: r.userId,
    type: (r.type as NotificationType) || 'system',
    category: (r.category as NotificationCategory) || 'system_alerts',
    priority: (r.priority as NotificationPriority) || 'medium',
    title: r.title,
    message: r.message,
    timestamp: r.createdAt,
    read: !!r.isRead,
    relatedId: r.relatedId ?? null,
    relatedType: r.relatedType ?? null,
    metadata: r.metadata || null,
  }
}

// ── Context shape ─────────────────────────────────────────────────────────────

export interface NotificationContextValue {
  notifications: Notification[]
  loading: boolean
  error: string | null
  unreadCount: number
  markAsRead: (id: number) => void
  markAllAsRead: () => void
  deleteNotification: (id: number) => void
  refresh: () => void
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {},
  refresh: () => {},
})

// ── Provider ──────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { socket } = useSocket()
  const userId = user?.id

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch from API ──────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setLoading(false)
      return
    }
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

  // Fetch on mount and when userId changes
  useEffect(() => { void load() }, [load])

  // ── Socket real-time updates ────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !userId) return

    const handleNew = (raw: RawNotification) => {
      // Guard: only process notifications for this user
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
    void patch(ENDPOINTS.userNotificationById(id), { isRead: true }).catch(() => {})
  }, [])

  const markAllAsRead = useCallback(() => {
    if (!userId) return
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    void patch(ENDPOINTS.userNotificationsMarkAllRead(userId), {}).catch(() => {})
  }, [userId])

  const deleteNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    void del(ENDPOINTS.userNotificationById(id)).catch(() => {})
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        error,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh: load,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext(): NotificationContextValue {
  return useContext(NotificationContext)
}
