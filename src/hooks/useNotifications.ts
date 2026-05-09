/**
 * useNotifications — thin wrapper around NotificationContext.
 *
 * All components (NotificationBell, NotificationToast, NotificationSound,
 * Notifications page) share a single data source via NotificationContext.
 * This hook exists for backwards compatibility so existing call sites
 * (useNotifications(userId)) continue to work unchanged.
 *
 * The userId parameter is accepted but ignored — the context derives the
 * user from AuthContext internally.
 */
export type {
  Notification,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
} from '../context/NotificationContext'

export type { NotificationContextValue as UseNotificationsResult } from '../context/NotificationContext'

export { useNotificationContext as useNotifications } from '../context/NotificationContext'
