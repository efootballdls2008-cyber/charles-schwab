import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import { useNotifications } from '../../hooks/useNotifications'
import type { Notification } from '../../hooks/useNotifications'

// ─── Types ─────────────────────────────────────────────────────────────────────

type FilterTab = 'All' | 'Unread' | 'Trade' | 'Deposits' | 'Alerts' | 'System'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function typeConfig(type: Notification['type']): { icon: string; color: string; bg: string; label: string } {
  switch (type) {
    case 'trade':
      return { icon: 'fas fa-chart-line', color: '#4ade80', bg: 'rgba(74,222,128,0.12)', label: 'Trade' }
    case 'deposit':
      return { icon: 'fas fa-arrow-down-to-line', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', label: 'Deposit' }
    case 'withdrawal':
      return { icon: 'fas fa-arrow-up-from-line', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Withdrawal' }
    case 'price_alert':
      return { icon: 'fas fa-bell', color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'Price Alert' }
    case 'security':
      return { icon: 'fas fa-shield-halved', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', label: 'Security' }
    case 'system':
      return { icon: 'fas fa-circle-info', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'System' }
    default:
      return { icon: 'fas fa-bell', color: '#9ca3af', bg: 'rgba(156,163,175,0.12)', label: 'Other' }
  }
}

function filterNotifications(notifications: Notification[], tab: FilterTab): Notification[] {
  switch (tab) {
    case 'Unread':
      return notifications.filter((n) => !n.read)
    case 'Trade':
      return notifications.filter((n) => n.type === 'trade')
    case 'Deposits':
      return notifications.filter((n) => n.type === 'deposit' || n.type === 'withdrawal')
    case 'Alerts':
      return notifications.filter((n) => n.type === 'price_alert')
    case 'System':
      return notifications.filter((n) => n.type === 'system' || n.type === 'security')
    default:
      return notifications
  }
}

// ─── Notification Item ─────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: number) => void
  onDelete: (id: number) => void
}

function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  const cfg = typeConfig(notification.type)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex items-start gap-4 px-5 py-4 transition-all cursor-default"
      style={{
        background: hovered
          ? 'rgba(255,255,255,0.03)'
          : notification.read
          ? 'transparent'
          : 'rgba(74,222,128,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: cfg.bg }}
      >
        <i className={`${cfg.icon} text-sm`} style={{ color: cfg.color }} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-sm font-semibold leading-snug"
              style={{ color: notification.read ? '#d1d5db' : '#ffffff' }}
            >
              {notification.title}
            </p>
            {!notification.read && (
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: '#4ade80' }}
                aria-label="Unread"
              />
            )}
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0 mt-0.5">{timeAgo(notification.timestamp)}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{notification.message}</p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-2.5">
          <span
            className="text-xs px-2 py-0.5 rounded-md font-medium"
            style={{ background: cfg.bg, color: cfg.color }}
          >
            {cfg.label}
          </span>
          {!notification.read && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="text-xs text-gray-500 hover:text-green-400 transition-colors flex items-center gap-1"
            >
              <i className="fas fa-check text-xs" />
              Mark read
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors flex items-center gap-1 ml-auto"
            aria-label="Delete notification"
          >
            <i className="fas fa-trash-can text-xs" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: FilterTab }) {
  const messages: Record<FilterTab, { icon: string; text: string }> = {
    All: { icon: 'fas fa-bell-slash', text: "You're all caught up — no notifications yet." },
    Unread: { icon: 'fas fa-check-circle', text: "No unread notifications. You're all caught up!" },
    Trade: { icon: 'fas fa-chart-line', text: 'No trade notifications yet.' },
    Deposits: { icon: 'fas fa-wallet', text: 'No deposit or withdrawal notifications yet.' },
    Alerts: { icon: 'fas fa-bell', text: 'No price alerts triggered yet.' },
    System: { icon: 'fas fa-circle-info', text: 'No system notifications.' },
  }
  const { icon, text } = messages[tab]
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <i className={`${icon} text-2xl text-gray-600`} aria-hidden="true" />
      </div>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('All')

  const { notifications, loading, error, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications(user?.id)

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) return null

  const filtered = filterNotifications(notifications, activeTab)

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'All', label: 'All', count: notifications.length },
    { key: 'Unread', label: 'Unread', count: unreadCount },
    { key: 'Trade', label: 'Trade' },
    { key: 'Deposits', label: 'Deposits' },
    { key: 'Alerts', label: 'Alerts' },
    { key: 'System', label: 'System' },
  ]

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0d0824' }}>
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#110b2d' }}>
          {/* ── Page Header ── */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                Notifications
                {unreadCount > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Stay on top of your trades, alerts, and account activity</p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}
              >
                <i className="fas fa-check-double text-xs" />
                Mark all as read
              </button>
            )}
          </div>

          {/* ── Summary Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total', value: notifications.length, icon: 'fas fa-bell', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
              { label: 'Unread', value: unreadCount, icon: 'fas fa-envelope', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
              { label: 'Trade Alerts', value: notifications.filter((n) => n.type === 'trade').length, icon: 'fas fa-chart-line', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
              { label: 'Price Alerts', value: notifications.filter((n) => n.type === 'price_alert').length, icon: 'fas fa-bell', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: stat.bg }}
                >
                  <i className={`${stat.icon} text-sm`} style={{ color: stat.color }} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-none">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main Card ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Filter Tabs */}
            <div
              className="flex items-center gap-1 px-4 pt-4 pb-0 overflow-x-auto"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-all relative flex-shrink-0"
                  style={{
                    color: activeTab === tab.key ? '#ffffff' : '#6b7280',
                    borderBottom: activeTab === tab.key ? '2px solid #4ade80' : '2px solid transparent',
                    marginBottom: '-1px',
                  }}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
                      style={{
                        background: activeTab === tab.key ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.07)',
                        color: activeTab === tab.key ? '#4ade80' : '#9ca3af',
                        fontSize: '10px',
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <i className="fas fa-spinner fa-spin text-gray-500 mr-2" aria-hidden="true" />
                <span className="text-sm text-gray-500">Loading notifications…</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <i className="fas fa-triangle-exclamation text-2xl text-red-400 mb-3" aria-hidden="true" />
                <p className="text-sm text-gray-400">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              <div>
                {filtered.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
