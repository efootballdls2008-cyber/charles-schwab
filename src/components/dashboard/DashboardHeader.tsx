import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

const dropdownVariants = {
  hidden:  { opacity: 0, scale: 0.95, y: -6 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 0.95, y: -6,  transition: { duration: 0.13 } },
}

/** Close a dropdown when clicking outside its ref */
function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen,  setUserOpen]  = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const userRef  = useRef<HTMLDivElement>(null)

  useClickOutside(notifRef, () => setNotifOpen(false))
  useClickOutside(userRef,  () => setUserOpen(false))

  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications(user?.id)

  // Show latest 6 in the dropdown
  const dropdownNotifs = notifications.slice(0, 6)

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'U'

  function handleLogout() {
    setUserOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header
      className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 lg:px-6 flex-shrink-0"
      style={{
        height: '60px',
        backgroundColor: '#0d0824',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        zIndex: 40,
      }}
    >
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white transition-colors flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.06)' }}
        aria-label="Open navigation"
      >
        <i className="fas fa-bars text-sm" />
      </button>

      {/* Page title */}
      <h1 className="text-lg sm:text-xl font-bold text-white flex-shrink-0">Dashboard</h1>

      {/* Search */}
      <div className="flex-1 flex items-center">
        <div className="hidden sm:block flex-1 max-w-xs lg:max-w-sm mx-3 lg:mx-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Type to search coins, pairs or markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm text-gray-300 rounded-full outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        </div>
        {searchOpen && (
          <div className="sm:hidden flex-1 mx-2">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#6b7280' }} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2 text-sm text-gray-300 rounded-full outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto flex-shrink-0">

        {/* Mobile search toggle */}
        <button
          onClick={() => setSearchOpen((o) => !o)}
          className="sm:hidden w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          aria-label="Search"
        >
          <i className="fas fa-search text-sm text-gray-400" />
        </button>

        {/* Mail */}
        <button
          className="hidden xs:flex w-9 h-9 rounded-full items-center justify-center transition-all hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          aria-label="Mail"
        >
          <i className="fas fa-envelope text-sm text-gray-400" />
        </button>

        {/* ── Bell + Notification Dropdown ── */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              const opening = !notifOpen
              setNotifOpen(opening)
              setUserOpen(false)
              // Auto-mark all as read when opening the dropdown
              if (opening && unreadCount > 0) {
                markAllAsRead()
              }
            }}
            className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            aria-label="Notifications"
          >
            <i className="fas fa-bell text-sm text-gray-400" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#4ade80', color: '#0d0824' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: 'linear-gradient(145deg, #130d35 0%, #1a1040 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  top: '100%',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-sm font-bold text-white">Notifications</span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>
                          {unreadCount} new
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); markAllAsRead() }}
                          className="text-xs font-medium transition-colors hover:text-white"
                          style={{ color: '#a78bfa' }}
                          title="Mark all as read"
                        >
                          <i className="fas fa-check-double" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {dropdownNotifs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <i className="fas fa-bell-slash text-2xl" style={{ color: '#374151' }} />
                      <p className="text-xs" style={{ color: '#6b7280' }}>No notifications yet</p>
                    </div>
                  ) : (
                    dropdownNotifs.map((n) => {
                      const isDeposit = n.type === 'deposit'
                      const isWithdrawal = n.type === 'withdrawal'
                      const isTrade = n.type === 'trade'
                      const isBotOpen = n.type === 'bot_open'
                      const isBotClose = n.type === 'bot_close'
                      const isTakeProfit = n.type === 'take_profit'
                      const isStopLoss = n.type === 'stop_loss'
                      const isOrder = n.type === 'order'
                      const isSecurity = n.type === 'security'
                      const isPriceAlert = n.type === 'price_alert'

                      const iconColor = isDeposit ? '#4ade80'
                        : isWithdrawal ? '#f87171'
                        : isTakeProfit ? '#4ade80'
                        : isStopLoss ? '#f87171'
                        : isBotOpen || isBotClose ? '#a78bfa'
                        : isTrade ? '#60a5fa'
                        : isOrder ? '#f59e0b'
                        : isSecurity ? '#f43f5e'
                        : isPriceAlert ? '#f97316'
                        : '#9ca3af'

                      const iconBg = isDeposit ? 'rgba(74,222,128,0.12)'
                        : isWithdrawal ? 'rgba(248,113,113,0.12)'
                        : isTakeProfit ? 'rgba(74,222,128,0.12)'
                        : isStopLoss ? 'rgba(248,113,113,0.12)'
                        : isBotOpen || isBotClose ? 'rgba(167,139,250,0.12)'
                        : isTrade ? 'rgba(96,165,250,0.12)'
                        : isOrder ? 'rgba(245,158,11,0.12)'
                        : isSecurity ? 'rgba(244,63,94,0.12)'
                        : isPriceAlert ? 'rgba(249,115,22,0.12)'
                        : 'rgba(156,163,175,0.12)'

                      const icon = isDeposit ? 'fa-arrow-down-to-line'
                        : isWithdrawal ? 'fa-arrow-up-from-line'
                        : isTakeProfit ? 'fa-circle-check'
                        : isStopLoss ? 'fa-circle-xmark'
                        : isBotOpen ? 'fa-robot'
                        : isBotClose ? 'fa-robot'
                        : isTrade ? 'fa-chart-line'
                        : isOrder ? 'fa-bag-shopping'
                        : isSecurity ? 'fa-shield-halved'
                        : isPriceAlert ? 'fa-bell'
                        : 'fa-circle-info'

                      return (
                        <div
                          key={n.id}
                          className="group flex items-start gap-3 px-4 py-3 transition-all hover:bg-white/5 relative cursor-pointer"
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: n.read ? 'transparent' : 'rgba(74,222,128,0.02)',
                          }}
                          onClick={() => { setNotifOpen(false); navigate('/user/notifications') }}
                        >
                          {/* Icon */}
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: iconBg }}
                          >
                            <i className={`fas ${icon} text-xs`} style={{ color: iconColor }} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2">
                              <p className="text-xs font-semibold leading-snug flex-1" style={{ color: n.read ? '#d1d5db' : '#ffffff' }}>
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: '#4ade80' }} />
                              )}
                            </div>
                            <p className="text-xs mt-0.5 truncate" style={{ color: '#6b7280' }}>
                              {n.message}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
                              {(() => {
                                const diff = Date.now() - new Date(n.timestamp).getTime()
                                const mins = Math.floor(diff / 60000)
                                if (mins < 1) return 'Just now'
                                if (mins < 60) return `${mins}m ago`
                                const hrs = Math.floor(mins / 60)
                                if (hrs < 24) return `${hrs}h ago`
                                const days = Math.floor(hrs / 24)
                                if (days < 7) return `${days}d ago`
                                return new Date(n.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              })()}
                            </p>
                          </div>

                          {/* Actions (show on hover) */}
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            {!n.read && (
                              <button
                                onClick={(e) => { e.stopPropagation(); markAsRead(n.id) }}
                                className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                                style={{ color: '#4ade80' }}
                                title="Mark as read"
                              >
                                <i className="fas fa-check text-xs" />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                              className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                              style={{ color: '#f87171' }}
                              title="Delete"
                            >
                              <i className="fas fa-trash-can text-xs" />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <button
                    onClick={() => { setNotifOpen(false); navigate('/user/notifications') }}
                    className="w-full text-xs font-medium text-center transition-colors hover:text-white"
                    style={{ color: '#8b5cf6' }}
                  >
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

        {/* ── User Avatar + Dropdown ── */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserOpen((o) => !o); setNotifOpen(false) }}
            className="flex items-center gap-2 rounded-xl px-1 py-1 transition-all hover:bg-white/5"
            aria-label="User menu"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'rgba(162,133,57,0.25)', color: '#c9a84c' }}
              >
                {initials}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-white leading-none">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                {user?.role ?? 'Member'}
              </p>
            </div>
            <i
              className="hidden sm:block fas fa-chevron-down text-xs ml-0.5 transition-transform"
              style={{ color: '#6b7280', transform: userOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          <AnimatePresence>
            {userOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: 'linear-gradient(145deg, #130d35 0%, #1a1040 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  top: '100%',
                }}
              >
                {/* User info pill */}
                <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-sm font-bold text-white truncate">
                    {user ? `${user.firstName} ${user.lastName}` : 'User'}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#6b7280' }}>
                    {user?.email}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  {[
                    { icon: 'fas fa-user',        label: 'Profile',  color: '#60a5fa', onClick: () => { setUserOpen(false); navigate('/user/account') } },
                    { icon: 'fas fa-cog',          label: 'Settings', color: '#a78bfa', onClick: () => { setUserOpen(false); navigate('/user/settings') } },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/5"
                      style={{ color: '#d1d5db' }}
                    >
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${item.color}18` }}
                      >
                        <i className={`${item.icon} text-xs`} style={{ color: item.color }} />
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Logout */}
                <div className="py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/5"
                    style={{ color: '#f87171' }}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(248,113,113,0.12)' }}
                    >
                      <i className="fas fa-sign-out-alt text-xs" style={{ color: '#f87171' }} />
                    </span>
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  )
}
