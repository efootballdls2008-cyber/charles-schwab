import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import NotificationBell from '../ui/NotificationBell'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

const dropdownVariants = {
  hidden:  { opacity: 0, scale: 0.96, y: -8 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 0.96, y: -8,  transition: { duration: 0.15 } },
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
  const [userOpen,  setUserOpen]  = useState(false)

  const userRef  = useRef<HTMLDivElement>(null)

  useClickOutside(userRef,  () => setUserOpen(false))

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

        {/* Enhanced Notification Bell */}
        <NotificationBell 
          userId={user?.id} 
          onNotificationClick={() => navigate('/user/notifications')}
        />

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

        {/* ── User Avatar + Dropdown ── */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserOpen((o) => !o) }}
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
                className="absolute right-0 mt-2 w-72 rounded-2xl overflow-hidden shadow-2xl"
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
