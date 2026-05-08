/**
 * Notifications Page — Admin-style layout
 * Left category sidebar · Toolbar with bulk actions · Table-style list · Detail panel
 */
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import NotificationSettings from '../../components/dashboard/NotificationSettings'
import { useNotifications } from '../../hooks/useNotifications'
import type { Notification } from '../../hooks/useNotifications'

// ─── Types ─────────────────────────────────────────────────────────────────────

type CategoryKey = 'all' | 'unread' | 'trading' | 'wallet' | 'bot' | 'alerts' | 'system' | 'settings'

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
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function typeConfig(type: Notification['type']): { icon: string; color: string; bg: string; label: string } {
  switch (type) {
    case 'trade':       return { icon: 'fa-chart-line',        color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  label: 'Trade' }
    case 'deposit':     return { icon: 'fa-arrow-down-to-line',color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  label: 'Deposit' }
    case 'withdrawal':  return { icon: 'fa-arrow-up-from-line',color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: 'Withdrawal' }
    case 'order':       return { icon: 'fa-bag-shopping',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Order' }
    case 'bot_open':    return { icon: 'fa-robot',             color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'Bot Open' }
    case 'bot_close':   return { icon: 'fa-robot',             color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'Bot Close' }
    case 'bot_activity':return { icon: 'fa-robot',             color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'Bot Activity' }
    case 'take_profit': return { icon: 'fa-circle-check',      color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  label: 'Take Profit' }
    case 'stop_loss':   return { icon: 'fa-circle-xmark',      color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: 'Stop Loss' }
    case 'profit_loss': return { icon: 'fa-chart-pie',         color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'P&L' }
    case 'price_alert': return { icon: 'fa-bell',              color: '#f97316', bg: 'rgba(249,115,22,0.12)',  label: 'Price Alert' }
    case 'security':    return { icon: 'fa-shield-halved',     color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   label: 'Security' }
    case 'system':      return { icon: 'fa-circle-info',       color: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: 'System' }
    default:            return { icon: 'fa-bell',              color: '#9ca3af', bg: 'rgba(156,163,175,0.12)', label: 'Other' }
  }
}

function priorityConfig(p: string): { color: string; label: string } {
  switch (p) {
    case 'urgent': return { color: '#f43f5e', label: 'Urgent' }
    case 'high':   return { color: '#f97316', label: 'High' }
    case 'medium': return { color: '#60a5fa', label: 'Medium' }
    default:       return { color: '#6b7280', label: 'Low' }
  }
}

function filterByCategory(notifications: Notification[], cat: CategoryKey): Notification[] {
  switch (cat) {
    case 'unread':  return notifications.filter(n => !n.read)
    case 'trading': return notifications.filter(n => ['trade','order','take_profit','stop_loss'].includes(n.type))
    case 'wallet':  return notifications.filter(n => ['deposit','withdrawal'].includes(n.type))
    case 'bot':     return notifications.filter(n => ['bot_open','bot_close','bot_activity'].includes(n.type))
    case 'alerts':  return notifications.filter(n => ['price_alert','profit_loss'].includes(n.type))
    case 'system':  return notifications.filter(n => ['system','security'].includes(n.type))
    default:        return notifications
  }
}

// ─── Category Sidebar ──────────────────────────────────────────────────────────

interface SidebarProps {
  active: CategoryKey
  onChange: (k: CategoryKey) => void
  counts: Record<CategoryKey, number>
}

const CATEGORIES: { key: CategoryKey; label: string; icon: string; color: string }[] = [
  { key: 'all',      label: 'All Notifications', icon: 'fa-inbox',        color: '#a78bfa' },
  { key: 'unread',   label: 'Unread',             icon: 'fa-envelope',     color: '#4ade80' },
  { key: 'trading',  label: 'Trading',            icon: 'fa-chart-line',   color: '#60a5fa' },
  { key: 'wallet',   label: 'Wallet',             icon: 'fa-wallet',       color: '#4ade80' },
  { key: 'bot',      label: 'Bot Activity',       icon: 'fa-robot',        color: '#a78bfa' },
  { key: 'alerts',   label: 'Price Alerts',       icon: 'fa-bell',         color: '#f97316' },
  { key: 'system',   label: 'System & Security',  icon: 'fa-shield-halved',color: '#f43f5e' },
  { key: 'settings', label: 'Settings',           icon: 'fa-cog',          color: '#6b7280' },
]

function CategorySidebar({ active, onChange, counts }: SidebarProps) {
  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col overflow-y-auto"
      style={{
        background: 'rgba(13,8,36,0.6)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Sidebar header */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4b5563' }}>
          Categories
        </p>
      </div>

      <nav className="flex-1 py-2">
        {CATEGORIES.map(cat => {
          const isActive = active === cat.key
          const count = counts[cat.key] ?? 0
          return (
            <button
              key={cat.key}
              onClick={() => onChange(cat.key)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all relative group"
              style={{
                color: isActive ? '#ffffff' : '#9ca3af',
                background: isActive ? `${cat.color}12` : 'transparent',
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="activeCatBar"
                  className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
                  style={{ background: cat.color }}
                />
              )}

              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: isActive ? `${cat.color}20` : 'rgba(255,255,255,0.04)',
                  color: isActive ? cat.color : '#6b7280',
                }}
              >
                <i className={`fas ${cat.icon} text-xs`} />
              </span>

              <span className="flex-1 text-left font-medium truncate">{cat.label}</span>

              {count > 0 && cat.key !== 'settings' && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                  style={{
                    background: isActive ? `${cat.color}25` : 'rgba(255,255,255,0.07)',
                    color: isActive ? cat.color : '#6b7280',
                    fontSize: '10px',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

// ─── Toolbar ───────────────────────────────────────────────────────────────────

interface ToolbarProps {
  total: number
  selected: number[]
  allIds: number[]
  onSelectAll: () => void
  onClearSelection: () => void
  onMarkSelectedRead: () => void
  onDeleteSelected: () => void
  onMarkAllRead: () => void
  search: string
  onSearch: (v: string) => void
  unreadCount: number
}

function Toolbar({
  total, selected, allIds, onSelectAll, onClearSelection,
  onMarkSelectedRead, onDeleteSelected, onMarkAllRead,
  search, onSearch, unreadCount,
}: ToolbarProps) {
  const allSelected = selected.length === allIds.length && allIds.length > 0
  const someSelected = selected.length > 0

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 flex-wrap"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}
    >
      {/* Select-all checkbox */}
      <button
        onClick={allSelected ? onClearSelection : onSelectAll}
        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: allSelected ? '#a78bfa' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${allSelected ? '#a78bfa' : 'rgba(255,255,255,0.12)'}`,
        }}
        aria-label="Select all"
      >
        {allSelected && <i className="fas fa-check text-white" style={{ fontSize: '9px' }} />}
        {!allSelected && someSelected && (
          <i className="fas fa-minus text-gray-400" style={{ fontSize: '9px' }} />
        )}
      </button>

      {/* Bulk actions — shown when items selected */}
      <AnimatePresence>
        {someSelected && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-gray-400 font-medium">{selected.length} selected</span>
            <button
              onClick={onMarkSelectedRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
              style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}
            >
              <i className="fas fa-check text-xs" />
              Mark read
            </button>
            <button
              onClick={onDeleteSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
              style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
            >
              <i className="fas fa-trash-can text-xs" />
              Delete
            </button>
            <button
              onClick={onClearSelection}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
            >
              <i className="fas fa-times text-xs" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#4b5563' }} />
        <input
          type="text"
          placeholder="Search notifications…"
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="pl-8 pr-4 py-1.5 text-xs rounded-lg outline-none transition-all w-48 focus:w-64"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#d1d5db',
          }}
        />
      </div>

      {/* Mark all read */}
      {unreadCount > 0 && (
        <button
          onClick={onMarkAllRead}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
          style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}
        >
          <i className="fas fa-check-double text-xs" />
          Mark all read
        </button>
      )}

      {/* Count */}
      <span className="text-xs text-gray-600 flex-shrink-0">{total} items</span>
    </div>
  )
}

// ─── Notification Row ──────────────────────────────────────────────────────────

interface RowProps {
  notification: Notification
  selected: boolean
  onSelect: (id: number) => void
  onMarkRead: (id: number) => void
  onDelete: (id: number) => void
  onClick: (n: Notification) => void
}

function NotificationRow({ notification, selected, onSelect, onMarkRead, onDelete, onClick }: RowProps) {
  const cfg = typeConfig(notification.type)
  const pri = priorityConfig(notification.priority)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: selected
          ? 'rgba(167,139,250,0.06)'
          : notification.read
          ? 'transparent'
          : 'rgba(74,222,128,0.025)',
      }}
      onClick={() => onClick(notification)}
    >
      {/* Unread dot */}
      <div className="w-2 flex-shrink-0 flex justify-center">
        {!notification.read && (
          <div className="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
        )}
      </div>

      {/* Checkbox */}
      <button
        onClick={e => { e.stopPropagation(); onSelect(notification.id) }}
        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all opacity-0 group-hover:opacity-100"
        style={{
          background: selected ? '#a78bfa' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${selected ? '#a78bfa' : 'rgba(255,255,255,0.15)'}`,
          opacity: selected ? 1 : undefined,
        }}
        aria-label="Select"
      >
        {selected && <i className="fas fa-check text-white" style={{ fontSize: '8px' }} />}
      </button>

      {/* Type icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: cfg.bg }}
      >
        <i className={`fas ${cfg.icon} text-xs`} style={{ color: cfg.color }} />
      </div>

      {/* Title + message */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: notification.read ? '#9ca3af' : '#ffffff' }}
          >
            {notification.title}
          </p>
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
            style={{ background: cfg.bg, color: cfg.color, fontSize: '10px' }}
          >
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{notification.message}</p>
      </div>

      {/* Priority badge */}
      <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: pri.color }} />
        <span className="text-xs" style={{ color: pri.color }}>{pri.label}</span>
      </div>

      {/* Timestamp */}
      <span className="text-xs text-gray-600 flex-shrink-0 hidden md:block w-20 text-right">
        {timeAgo(notification.timestamp)}
      </span>

      {/* Row actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {!notification.read && (
          <button
            onClick={e => { e.stopPropagation(); onMarkRead(notification.id) }}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: '#4ade80' }}
            title="Mark as read"
          >
            <i className="fas fa-check text-xs" />
          </button>
        )}
        <button
          onClick={e => { e.stopPropagation(); onDelete(notification.id) }}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
          style={{ color: '#f87171' }}
          title="Delete"
        >
          <i className="fas fa-trash-can text-xs" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Detail Panel ──────────────────────────────────────────────────────────────

interface DetailPanelProps {
  notification: Notification | null
  onClose: () => void
  onMarkRead: (id: number) => void
  onDelete: (id: number) => void
}

function DetailPanel({ notification, onClose, onMarkRead, onDelete }: DetailPanelProps) {
  return (
    <AnimatePresence>
      {notification && (
        <motion.aside
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-72 flex-shrink-0 flex flex-col overflow-y-auto"
          style={{
            background: 'rgba(13,8,36,0.8)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4b5563' }}>
              Detail
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors hover:bg-white/5"
            >
              <i className="fas fa-times text-xs" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-4">
            {/* Icon + title */}
            {(() => {
              const cfg = typeConfig(notification.type)
              const pri = priorityConfig(notification.priority)
              return (
                <>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: cfg.bg }}
                    >
                      <i className={`fas ${cfg.icon} text-sm`} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white leading-snug">{notification.title}</h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded font-medium mt-1 inline-block"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div
                    className="rounded-xl p-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <p className="text-sm text-gray-300 leading-relaxed">{notification.message}</p>
                  </div>

                  {/* Meta grid */}
                  <div className="space-y-2">
                    {[
                      { label: 'Time',     value: new Date(notification.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                      { label: 'Priority', value: pri.label, color: pri.color },
                      { label: 'Status',   value: notification.read ? 'Read' : 'Unread', color: notification.read ? '#6b7280' : '#4ade80' },
                      { label: 'Category', value: notification.category.replace('_', ' ') },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{item.label}</span>
                        <span
                          className="text-xs font-medium capitalize"
                          style={{ color: item.color ?? '#d1d5db' }}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2">
                    {!notification.read && (
                      <button
                        onClick={() => onMarkRead(notification.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                        style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}
                      >
                        <i className="fas fa-check text-xs" />
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => { onDelete(notification.id); onClose() }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                      style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
                    >
                      <i className="fas fa-trash-can text-xs" />
                      Delete
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ category }: { category: CategoryKey }) {
  const map: Record<CategoryKey, { icon: string; text: string }> = {
    all:      { icon: 'fa-bell-slash',    text: "You're all caught up — no notifications yet." },
    unread:   { icon: 'fa-check-double',  text: 'No unread notifications.' },
    trading:  { icon: 'fa-chart-line',    text: 'No trading notifications yet.' },
    wallet:   { icon: 'fa-wallet',        text: 'No wallet notifications yet.' },
    bot:      { icon: 'fa-robot',         text: 'No bot activity notifications.' },
    alerts:   { icon: 'fa-bell',          text: 'No price alerts triggered yet.' },
    system:   { icon: 'fa-shield-halved', text: 'No system or security notifications.' },
    settings: { icon: 'fa-cog',           text: '' },
  }
  const { icon, text } = map[category]
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <i className={`fas ${icon} text-xl`} style={{ color: '#374151' }} />
      </div>
      <p className="text-sm" style={{ color: '#6b7280' }}>{text}</p>
    </div>
  )
}

// ─── Stats Strip ───────────────────────────────────────────────────────────────

function StatsStrip({ notifications, unreadCount }: { notifications: Notification[]; unreadCount: number }) {
  const stats = [
    { label: 'Total',    value: notifications.length,                                                                                  icon: 'fa-inbox',      color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    { label: 'Unread',   value: unreadCount,                                                                                           icon: 'fa-envelope',   color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
    { label: 'Trading',  value: notifications.filter(n => ['trade','order','take_profit','stop_loss'].includes(n.type)).length,        icon: 'fa-chart-line', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    { label: 'Wallet',   value: notifications.filter(n => ['deposit','withdrawal'].includes(n.type)).length,                          icon: 'fa-wallet',     color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
    { label: 'Bot',      value: notifications.filter(n => ['bot_open','bot_close','bot_activity'].includes(n.type)).length,           icon: 'fa-robot',      color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    { label: 'Alerts',   value: notifications.filter(n => ['price_alert','profit_loss'].includes(n.type)).length,                     icon: 'fa-bell',       color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  ]

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
      {stats.map(s => (
        <div
          key={s.label}
          className="rounded-xl p-3 flex items-center gap-2.5"
          style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: s.bg }}
          >
            <i className={`fas ${s.icon} text-xs`} style={{ color: s.color }} />
          </div>
          <div>
            <p className="text-base font-bold text-white leading-none">{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [selected, setSelected] = useState<number[]>([])
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState<Notification | null>(null)

  const { notifications, loading, error, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications(user?.id)

  // Clear selection when category changes
  useEffect(() => { setSelected([]); setDetail(null) }, [activeCategory])

  // Category counts
  const counts = useMemo<Record<CategoryKey, number>>(() => ({
    all:      notifications.length,
    unread:   unreadCount,
    trading:  notifications.filter(n => ['trade','order','take_profit','stop_loss'].includes(n.type)).length,
    wallet:   notifications.filter(n => ['deposit','withdrawal'].includes(n.type)).length,
    bot:      notifications.filter(n => ['bot_open','bot_close','bot_activity'].includes(n.type)).length,
    alerts:   notifications.filter(n => ['price_alert','profit_loss'].includes(n.type)).length,
    system:   notifications.filter(n => ['system','security'].includes(n.type)).length,
    settings: 0,
  }), [notifications, unreadCount])

  // Filtered + searched list
  const filtered = useMemo(() => {
    let list = filterByCategory(notifications, activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
      )
    }
    return list
  }, [notifications, activeCategory, search])

  // Selection helpers
  const toggleSelect = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const selectAll = () => setSelected(filtered.map(n => n.id))
  const clearSelection = () => setSelected([])

  const markSelectedRead = () => {
    selected.forEach(id => markAsRead(id))
    clearSelection()
  }
  const deleteSelected = () => {
    selected.forEach(id => deleteNotification(id))
    clearSelection()
    if (detail && selected.includes(detail.id)) setDetail(null)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0d0824' }}>
      {/* Dashboard nav sidebar */}
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ backgroundColor: '#110b2d' }}>

          {/* ── Page title ── */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <i className="fas fa-bell text-lg" style={{ color: '#a78bfa' }} />
                Notifications
                {unreadCount > 0 && (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </h2>
              <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                Manage your trades, alerts, and account activity
              </p>
            </div>
          </div>

          {/* ── Stats strip ── */}
          <StatsStrip notifications={notifications} unreadCount={unreadCount} />

          {/* ── Admin panel ── */}
          <div
            className="rounded-2xl overflow-hidden flex"
            style={{
              background: 'rgba(17,11,45,0.95)',
              border: '1px solid rgba(255,255,255,0.07)',
              minHeight: '520px',
            }}
          >
            {/* Left: category sidebar */}
            <CategorySidebar
              active={activeCategory}
              onChange={setActiveCategory}
              counts={counts}
            />

            {/* Center: list */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

              {/* Toolbar */}
              {activeCategory !== 'settings' && (
                <Toolbar
                  total={filtered.length}
                  selected={selected}
                  allIds={filtered.map(n => n.id)}
                  onSelectAll={selectAll}
                  onClearSelection={clearSelection}
                  onMarkSelectedRead={markSelectedRead}
                  onDeleteSelected={deleteSelected}
                  onMarkAllRead={markAllAsRead}
                  search={search}
                  onSearch={setSearch}
                  unreadCount={unreadCount}
                />
              )}

              {/* Content area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeCategory === 'settings' ? (
                  <div className="p-6">
                    <NotificationSettings />
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-20">
                    <i className="fas fa-spinner fa-spin text-gray-600 mr-2" />
                    <span className="text-sm text-gray-500">Loading notifications…</span>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                    <i className="fas fa-triangle-exclamation text-2xl text-red-400 mb-3" />
                    <p className="text-sm text-gray-400">{error}</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <EmptyState category={activeCategory} />
                ) : (
                  <AnimatePresence initial={false}>
                    {filtered.map(n => (
                      <NotificationRow
                        key={n.id}
                        notification={n}
                        selected={selected.includes(n.id)}
                        onSelect={toggleSelect}
                        onMarkRead={markAsRead}
                        onDelete={id => {
                          deleteNotification(id)
                          if (detail?.id === id) setDetail(null)
                        }}
                        onClick={setDetail}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Right: detail panel */}
            <DetailPanel
              notification={detail}
              onClose={() => setDetail(null)}
              onMarkRead={markAsRead}
              onDelete={id => { deleteNotification(id); setDetail(null) }}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
