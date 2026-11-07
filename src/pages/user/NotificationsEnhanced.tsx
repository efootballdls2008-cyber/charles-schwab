/**
 * Enhanced Notifications Page with Modern UI and Categorized Layout
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications, type Notification, type NotificationCategory } from '../../hooks/useNotifications'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import NotificationSettings from '../../components/dashboard/NotificationSettings'

type FilterTab = 'All' | 'Unread' | 'Trading' | 'Wallet' | 'Bot Activity' | 'Profit & Loss' | 'System Alerts' | 'Settings'

// ── Helper Functions ──────────────────────────────────────────────────────────

function filterNotifications(notifications: Notification[], tab: FilterTab): Notification[] {
  switch (tab) {
    case 'All':
      return notifications
    case 'Unread':
      return notifications.filter((n) => !n.read)
    case 'Trading':
      return notifications.filter((n) => n.category === 'trading')
    case 'Wallet':
      return notifications.filter((n) => n.category === 'wallet')
    case 'Bot Activity':
      return notifications.filter((n) => n.category === 'bot_activity')
    case 'Profit & Loss':
      return notifications.filter((n) => n.category === 'profit_loss')
    case 'System Alerts':
      return notifications.filter((n) => n.category === 'system_alerts')
    default:
      return notifications
  }
}

function getCategoryCount(notifications: Notification[], category: NotificationCategory): number {
  return notifications.filter((n) => n.category === category).length
}

function getNotificationIcon(type: string): { icon: string; color: string; bg: string } {
  const iconMap: Record<string, { icon: string; color: string; bg: string }> = {
    deposit: { icon: 'fa-arrow-down-to-line', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    withdrawal: { icon: 'fa-arrow-up-from-line', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    trade: { icon: 'fa-chart-line', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
    order: { icon: 'fa-bag-shopping', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    bot_open: { icon: 'fa-robot', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    bot_close: { icon: 'fa-robot', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    bot_activity: { icon: 'fa-robot', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    take_profit: { icon: 'fa-circle-check', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    stop_loss: { icon: 'fa-circle-xmark', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    profit_loss: { icon: 'fa-chart-pie', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    security: { icon: 'fa-shield-halved', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)' },
    price_alert: { icon: 'fa-bell', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
    system: { icon: 'fa-gear', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  }
  
  return iconMap[type] || { icon: 'fa-circle-info', color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return '#f43f5e'
    case 'high': return '#f97316'
    case 'medium': return '#60a5fa'
    case 'low': return '#6b7280'
    default: return '#6b7280'
  }
}

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

// ── Components ────────────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: number) => void
  onDelete: (id: number) => void
}

function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  const { icon, color, bg } = getNotificationIcon(notification.type)
  const priorityColor = getPriorityColor(notification.priority)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group flex items-start gap-4 p-4 transition-all hover:bg-white/5 relative"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: notification.read ? 'transparent' : 'rgba(74,222,128,0.02)',
      }}
    >
      {/* Priority Indicator */}
      {notification.priority !== 'low' && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: priorityColor }}
        />
      )}

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
        style={{ background: bg }}
      >
        <i className={`fas ${icon} text-sm`} style={{ color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold truncate" style={{ color: notification.read ? '#d1d5db' : '#ffffff' }}>
                {notification.title}
              </h4>
              {!notification.read && (
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#4ade80' }} />
              )}
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-2">
              {notification.message}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{timeAgo(notification.timestamp)}</span>
              <span className="capitalize">{notification.category.replace('_', ' ')}</span>
              {notification.priority !== 'medium' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ 
                  background: `${priorityColor}15`, 
                  color: priorityColor 
                }}>
                  {notification.priority}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {!notification.read && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: '#4ade80' }}
                title="Mark as read"
              >
                <i className="fas fa-check text-xs" />
              </button>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: '#f87171' }}
              title="Delete"
            >
              <i className="fas fa-trash-can text-xs" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function EmptyState({ tab }: { tab: FilterTab }) {
  const emptyStates = {
    All: { icon: 'fa-bell-slash', message: 'No notifications yet' },
    Unread: { icon: 'fa-check-double', message: 'All caught up! No unread notifications.' },
    Trading: { icon: 'fa-chart-line', message: 'No trading notifications' },
    Wallet: { icon: 'fa-wallet', message: 'No wallet notifications' },
    'Bot Activity': { icon: 'fa-robot', message: 'No bot activity notifications' },
    'Profit & Loss': { icon: 'fa-chart-pie', message: 'No P&L notifications' },
    'System Alerts': { icon: 'fa-gear', message: 'No system notifications' },
    Settings: { icon: 'fa-cog', message: '' }
  }

  const state = emptyStates[tab] || emptyStates.All

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <i className={`fas ${state.icon} text-4xl mb-4`} style={{ color: '#374151' }} />
      <p className="text-sm" style={{ color: '#6b7280' }}>{state.message}</p>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function NotificationsEnhanced() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('All')

  const { notifications, loading, error, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications()

  const filtered = activeTab === 'Settings' ? [] : filterNotifications(notifications, activeTab)

  const tabs: { key: FilterTab; label: string; count?: number; icon: string }[] = [
    { key: 'All', label: 'All', count: notifications.length, icon: 'fa-list' },
    { key: 'Unread', label: 'Unread', count: unreadCount, icon: 'fa-envelope' },
    { key: 'Trading', label: 'Trading', count: getCategoryCount(notifications, 'trading'), icon: 'fa-chart-line' },
    { key: 'Wallet', label: 'Wallet', count: getCategoryCount(notifications, 'wallet'), icon: 'fa-wallet' },
    { key: 'Bot Activity', label: 'Bot Activity', count: getCategoryCount(notifications, 'bot_activity'), icon: 'fa-robot' },
    { key: 'Profit & Loss', label: 'P&L', count: getCategoryCount(notifications, 'profit_loss'), icon: 'fa-chart-pie' },
    { key: 'System Alerts', label: 'System', count: getCategoryCount(notifications, 'system_alerts'), icon: 'fa-gear' },
    { key: 'Settings', label: 'Settings', icon: 'fa-cog' },
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
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <i className="fas fa-bell text-xl" style={{ color: '#a78bfa' }} />
                Notifications
                {unreadCount > 0 && (
                  <span
                    className="text-sm font-bold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-400 mt-1">Stay updated with your trading activity and account changes</p>
            </div>

            {unreadCount > 0 && activeTab !== 'Settings' && (
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
          {activeTab !== 'Settings' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total', value: notifications.length, icon: 'fa-bell', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
                { label: 'Unread', value: unreadCount, icon: 'fa-envelope', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
                { label: 'Trading', value: getCategoryCount(notifications, 'trading'), icon: 'fa-chart-line', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
                { label: 'Bot Activity', value: getCategoryCount(notifications, 'bot_activity'), icon: 'fa-robot', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-white/5"
                  style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: stat.bg }}
                  >
                    <i className={`fas ${stat.icon} text-sm`} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white leading-none">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

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
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all relative flex-shrink-0 rounded-t-lg"
                  style={{
                    color: activeTab === tab.key ? '#ffffff' : '#6b7280',
                    background: activeTab === tab.key ? 'rgba(167,139,250,0.1)' : 'transparent',
                    borderBottom: activeTab === tab.key ? '2px solid #a78bfa' : '2px solid transparent',
                    marginBottom: '-1px',
                  }}
                >
                  <i className={`fas ${tab.icon} text-xs`} />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: activeTab === tab.key ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.07)',
                        color: activeTab === tab.key ? '#a78bfa' : '#9ca3af',
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
            {activeTab === 'Settings' ? (
              <div className="p-6">
                <NotificationSettings />
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-20">
                <i className="fas fa-spinner fa-spin text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Loading notifications…</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <i className="fas fa-triangle-exclamation text-2xl text-red-400 mb-3" />
                <p className="text-sm text-gray-400">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {filtered.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}