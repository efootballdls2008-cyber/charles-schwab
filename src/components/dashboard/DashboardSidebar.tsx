import { NavLink } from 'react-router-dom'
import { dashNavItems } from '../../data/navItems'

interface DashboardSidebarProps {
  open: boolean
  onClose: () => void
}

export default function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  return (
    <aside
      className={[
        'flex flex-col flex-shrink-0 h-screen overflow-y-auto z-30',
        // On mobile/tablet: fixed drawer that slides in/out
        // On desktop (lg+): always visible, part of the flow
        'fixed lg:relative',
        'transition-transform duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
      style={{
        width: '220px',
        backgroundColor: '#0d0824',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
      aria-label="Dashboard navigation"
    >
      {/* ── Logo + close button ── */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <img src="/img/logo.png" alt="Charles Trading" className="h-8 w-auto" />
        <button
          onClick={onClose}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          aria-label="Close sidebar"
        >
          <i className="fas fa-times text-sm" aria-hidden="true" />
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 pt-5 pb-3 overflow-y-auto">
        <p
          className="px-3 mb-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: '#4b5563' }}
        >
          Navigation
        </p>

        <ul className="space-y-0.5">
          {dashNavItems.map((item) => (
            <li key={item.key}>
              <NavLink
                to={item.to}
                end={item.key === 'dashboard'}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5',
                  ].join(' ')
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background: 'rgba(74,222,128,0.1)',
                        borderLeft: '3px solid #4ade80',
                        paddingLeft: '9px',
                      }
                    : {}
                }
              >
                <i className={`${item.icon} w-4 text-center text-sm`} aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                    style={
                      item.badge === 'Live'
                        ? {
                            background: 'rgba(74,222,128,0.2)',
                            color: '#4ade80',
                            fontSize: '10px',
                          }
                        : {
                            background: 'rgba(139,92,246,0.25)',
                            color: '#a78bfa',
                            fontSize: '10px',
                          }
                    }
                  >
                    {item.badge === 'Live' && (
                      <span
                        className="inline-block w-1 h-1 rounded-full mr-1 animate-pulse align-middle"
                        style={{ background: '#4ade80' }}
                      />
                    )}
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Upgrade banner ── */}
      <div className="px-3 pb-5 flex-shrink-0">
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'rgba(162,133,57,0.08)',
            border: '1px solid rgba(162,133,57,0.2)',
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2"
            style={{ background: 'rgba(162,133,57,0.15)' }}
          >
            <i className="fas fa-crown text-xs" style={{ color: '#c9a84c' }} aria-hidden="true" />
          </div>
          <p className="text-xs text-gray-400 leading-snug mb-1">Unlock More Features</p>
          <p className="text-xs font-semibold text-white mb-3">Upgrade to Pro</p>
          <button
            className="w-full py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  )
}
