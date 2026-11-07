/**
 * NotificationBell — Admin-style header dropdown
 * Category strip · Compact rows · Bulk mark-read · Link to Notification Center
 */
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications, type Notification } from '../../hooks/useNotifications'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface NotificationBellProps {
  userId?: number   // kept for API compatibility, no longer used (context provides data)
  className?: string
  onNotificationClick?: () => void
}

type QuickFilter = 'all' | 'unread' | 'trading' | 'wallet'

// ─── Helpers ───────────────────────────────────────────────────────────────────

const dropdownVariants = {
  hidden:  { opacity: 0, scale: 0.96, y: -8 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 0.96, y: -8,  transition: { duration: 0.12 } },
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
}

function typeIcon(type: string): { icon: string; color: string; bg: string } {
  const map: Record<string, { icon: string; color: string; bg: string }> = {
    deposit:      { icon: 'fa-arrow-down-to-line', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    withdrawal:   { icon: 'fa-arrow-up-from-line', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    trade:        { icon: 'fa-chart-line',          color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
    order:        { icon: 'fa-bag-shopping',        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    bot_open:     { icon: 'fa-robot',               color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    bot_close:    { icon: 'fa-robot',               color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    bot_activity: { icon: 'fa-robot',               color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    take_profit:  { icon: 'fa-circle-check',        color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    stop_loss:    { icon: 'fa-circle-xmark',        color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    profit_loss:  { icon: 'fa-chart-pie',           color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    security:     { icon: 'fa-shield-halved',       color: '#f43f5e', bg: 'rgba(244,63,94,0.12)' },
    price_alert:  { icon: 'fa-bell',                color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
    system:       { icon: 'fa-circle-info',         color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  }
  return map[type] ?? { icon: 'fa-circle-info', color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' }
}

function fmtTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function applyFilter(notifications: Notification[], filter: QuickFilter): Notification[] {
  switch (filter) {
    case 'unread':  return notifications.filter(n => !n.read)
    case 'trading': return notifications.filter(n => ['trade','order','take_profit','stop_loss','bot_open','bot_close','bot_activity'].includes(n.type))
    case 'wallet':  return notifications.filter(n => ['deposit','withdrawal'].includes(n.type))
    default:        return notifications
  }
}

// ─── Dropdown Row ──────────────────────────────────────────────────────────────

interface RowProps {
  notification: Notification
  index: number
  onMarkRead: (id: number) => void
  onDelete: (id: number) => void
  onClick: () => void
}

function DropdownRow({ notification, index, onMarkRead, onDelete, onClick }: RowProps) {
  const { icon, color, bg } = typeIcon(notification.type)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group flex items-start gap-4 px-5 py-3.5 cursor-pointer transition-all hover:bg-white/[0.03] relative"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      onClick={onClick}
    >
      {/* Unread indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r transition-all"
        style={{ background: !notification.read ? '#4ade80' : 'transparent' }}
      />

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: bg }}
      >
        <i className={`fas ${icon} text-sm`} style={{ color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p
            className="text-sm font-semibold leading-snug"
            style={{ color: notification.read ? '#9ca3af' : '#ffffff' }}
          >
            {notification.title}
          </p>
          <span className="text-xs flex-shrink-0" style={{ color: '#4b5563' }}>
            {fmtTime(notification.timestamp)}
          </span>
        </div>
        <p className="text-xs mt-1 line-clamp-2" style={{ color: '#6b7280' }}>
          {notification.message}
        </p>
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-center">
        {!notification.read && (
          <button
            onClick={e => { e.stopPropagation(); onMarkRead(notification.id) }}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: '#4ade80' }}
            title="Mark read"
          >
            <i className="fas fa-check text-xs" />
          </button>
        )}
        <button
          onClick={e => { e.stopPropagation(); onDelete(notification.id) }}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
          style={{ color: '#f87171' }}
          title="Delete"
        >
          <i className="fas fa-trash-can text-xs" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function NotificationBell({ className = '', onNotificationClick }: NotificationBellProps) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<QuickFilter>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(dropdownRef, () => setIsOpen(false))

  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  const filtered = applyFilter(notifications, filter).slice(0, 8)

  const filterCounts: Record<QuickFilter, number> = {
    all:     notifications.length,
    unread:  unreadCount,
    trading: notifications.filter(n => ['trade','order','take_profit','stop_loss','bot_open','bot_close','bot_activity'].includes(n.type)).length,
    wallet:  notifications.filter(n => ['deposit','withdrawal'].includes(n.type)).length,
  }

  const handleOpen = () => {
    setIsOpen(o => !o)
  }

  const handleViewAll = () => {
    setIsOpen(false)
    if (onNotificationClick) onNotificationClick()
    else navigate('/user/notifications')
  }

  const FILTERS: { key: QuickFilter; label: string }[] = [
    { key: 'all',     label: 'All' },
    { key: 'unread',  label: 'Unread' },
    { key: 'trading', label: 'Trading' },
    { key: 'wallet',  label: 'Wallet' },
  ]

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>

      {/* ── Bell button ── */}
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
        style={{
          background: isOpen ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.07)',
          border: `1px solid ${isOpen ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.09)'}`,
        }}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <i
          className="fas fa-bell text-sm"
          style={{ color: isOpen ? '#a78bfa' : '#9ca3af' }}
        />

        {/* Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-white font-bold"
            style={{
              background: '#ef4444',
              fontSize: '10px',
              border: '2px solid #0d0824',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}

        {/* Pulse ring */}
        {unreadCount > 0 && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ border: '1px solid rgba(239,68,68,0.4)' }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 mt-2 rounded-2xl overflow-hidden shadow-2xl z-50"
            style={{
              width: '480px',
              maxWidth: '95vw',
              top: '100%',
              background: 'linear-gradient(160deg, #0e0929 0%, #160f38 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(167,139,250,0.08)',
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(167,139,250,0.15)' }}
                >
                  <i className="fas fa-bell text-sm" style={{ color: '#a78bfa' }} />
                </div>
                <div>
                  <p className="text-base font-bold text-white leading-none">Notification Center</p>
                  {unreadCount > 0 && (
                    <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                      {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={e => { e.stopPropagation(); markAllAsRead() }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                    style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}
                    title="Mark all as read"
                  >
                    <i className="fas fa-check-double text-xs" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
                >
                  <i className="fas fa-times text-sm" />
                </button>
              </div>
            </div>

            {/* ── Quick filter strip ── */}
            <div
              className="flex items-center gap-2 px-4 py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' }}
            >
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: filter === f.key ? 'rgba(167,139,250,0.15)' : 'transparent',
                    color: filter === f.key ? '#a78bfa' : '#6b7280',
                    border: filter === f.key ? '1px solid rgba(167,139,250,0.2)' : '1px solid transparent',
                  }}
                >
                  {f.label}
                  {filterCounts[f.key] > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded font-bold"
                      style={{
                        background: filter === f.key ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.06)',
                        color: filter === f.key ? '#a78bfa' : '#4b5563',
                        fontSize: '10px',
                      }}
                    >
                      {filterCounts[f.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── List ── */}
            <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '340px' }}>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <i className="fas fa-bell-slash text-lg" style={{ color: '#374151' }} />
                  </div>
                  <p className="text-xs" style={{ color: '#6b7280' }}>
                    {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                  </p>
                </div>
              ) : (
                filtered.map((n, i) => (
                  <DropdownRow
                    key={n.id}
                    notification={n}
                    index={i}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                    onClick={handleViewAll}
                  />
                ))
              )}
            </div>

            {/* ── Footer ── */}
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}
            >
              <button
                onClick={handleViewAll}
                className="flex items-center gap-2 text-sm font-semibold transition-all hover:opacity-80"
                style={{ color: '#a78bfa' }}
              >
                <i className="fas fa-arrow-right text-xs" />
                Open Notification Center
              </button>
              <button
                onClick={() => { setIsOpen(false); navigate('/user/notifications') }}
                className="flex items-center gap-2 text-xs transition-all hover:opacity-80"
                style={{ color: '#4b5563' }}
              >
                <i className="fas fa-cog text-xs" />
                Settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
