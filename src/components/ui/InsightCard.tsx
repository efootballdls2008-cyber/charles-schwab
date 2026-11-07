import { useState } from 'react'
import ChevronIcon from './ChevronIcon'

// ─── Types ────────────────────────────────────────────────────────────────────

export type InsightCardColor = 'green' | 'indigo' | 'gold'

export interface InsightCardProps {
  icon: React.ReactNode
  title: string
  /** Part of the title rendered in the accent color */
  titleAccent: string
  description: string
  badge: { label: string; icon?: React.ReactNode }
  footerIcon: React.ReactNode
  footerText: string
  color: InsightCardColor
  active: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

// ─── Color tokens ─────────────────────────────────────────────────────────────

const colorTokens: Record<
  InsightCardColor,
  {
    activeCard: React.CSSProperties
    inactiveCard: React.CSSProperties
    activeBar: string
    activeIcon: React.CSSProperties
    inactiveIcon: React.CSSProperties
    activePing: string
    titleAccent: React.CSSProperties
    badge: React.CSSProperties
  }
> = {
  green: {
    activeCard: {
      background: 'linear-gradient(135deg,rgba(34,197,94,0.12),rgba(22,15,53,0.95))',
      border: '1.5px solid rgba(34,197,94,0.5)',
      boxShadow: '0 8px 32px rgba(34,197,94,0.15),0 0 0 1px rgba(34,197,94,0.1)',
      transform: 'translateY(-2px)',
    },
    inactiveCard: {
      background: 'rgba(22,15,53,0.7)',
      border: '1.5px solid rgba(43,25,120,0.35)',
      transform: 'translateY(0)',
    },
    activeBar: 'linear-gradient(90deg,#22c55e,#a28539)',
    activeIcon: {
      background: 'linear-gradient(135deg,#22c55e,#16a34a)',
      boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
    },
    inactiveIcon: {
      background: 'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(22,15,53,0.8))',
    },
    activePing: 'rgba(34,197,94,0.2)',
    titleAccent: { color: '#4ade80' },
    badge: {
      background: 'rgba(34,197,94,0.15)',
      color: '#4ade80',
      border: '1px solid rgba(34,197,94,0.3)',
    },
  },
  indigo: {
    activeCard: {
      background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(22,15,53,0.95))',
      border: '1.5px solid rgba(99,102,241,0.5)',
      boxShadow: '0 8px 32px rgba(99,102,241,0.15),0 0 0 1px rgba(99,102,241,0.1)',
      transform: 'translateY(-2px)',
    },
    inactiveCard: {
      background: 'rgba(22,15,53,0.7)',
      border: '1.5px solid rgba(43,25,120,0.35)',
      transform: 'translateY(0)',
    },
    activeBar: 'linear-gradient(90deg,#6366f1,#a28539)',
    activeIcon: {
      background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
      boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
    },
    inactiveIcon: {
      background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(22,15,53,0.8))',
    },
    activePing: 'rgba(99,102,241,0.2)',
    titleAccent: { color: '#818cf8' },
    badge: {
      background: 'rgba(99,102,241,0.15)',
      color: '#818cf8',
      border: '1px solid rgba(99,102,241,0.3)',
    },
  },
  gold: {
    activeCard: {
      background: 'linear-gradient(135deg,rgba(162,133,57,0.12),rgba(22,15,53,0.95))',
      border: '1.5px solid rgba(162,133,57,0.5)',
      boxShadow: '0 8px 32px rgba(162,133,57,0.15),0 0 0 1px rgba(162,133,57,0.1)',
      transform: 'translateY(-2px)',
    },
    inactiveCard: {
      background: 'rgba(22,15,53,0.7)',
      border: '1.5px solid rgba(43,25,120,0.35)',
      transform: 'translateY(0)',
    },
    activeBar: 'linear-gradient(90deg,#a28539,#d4af6a)',
    activeIcon: {
      background: 'linear-gradient(135deg,#a28539,#c9a84c)',
      boxShadow: '0 4px 20px rgba(162,133,57,0.4)',
    },
    inactiveIcon: {
      background: 'linear-gradient(135deg,rgba(162,133,57,0.2),rgba(22,15,53,0.8))',
    },
    activePing: 'rgba(162,133,57,0.2)',
    titleAccent: { color: '#c9a84c' },
    badge: {
      background: 'rgba(162,133,57,0.15)',
      color: '#d4af6a',
      border: '1px solid rgba(162,133,57,0.3)',
    },
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InsightCard({
  icon,
  title,
  titleAccent,
  description,
  badge,
  footerIcon,
  footerText,
  color,
  active,
  onMouseEnter,
  onMouseLeave,
}: InsightCardProps) {
  const [expanded, setExpanded] = useState(false)
  const tokens = colorTokens[color]

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500"
      style={active ? tokens.activeCard : tokens.inactiveCard}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Active top bar */}
      <div
        className="absolute top-0 left-0 h-0.5 transition-all duration-500"
        style={{
          width: active ? '100%' : '0%',
          background: active ? tokens.activeBar : 'transparent',
        }}
        aria-hidden="true"
      />

      <div className="p-5 flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 relative">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500"
            style={active ? tokens.activeIcon : tokens.inactiveIcon}
          >
            {icon}
          </div>
          {active && (
            <div
              className="absolute inset-0 rounded-2xl animate-ping"
              style={{ background: tokens.activePing, animationDuration: '2s' }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title + badge */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="text-base font-bold text-white">
              {title}{' '}
              <span style={tokens.titleAccent}>{titleAccent}</span>
            </h4>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
              style={tokens.badge}
            >
              {badge.icon}
              {badge.label}
            </span>
          </div>

          {/* Description */}
          <p
            className={`text-sm leading-relaxed transition-all duration-300 ${expanded ? '' : 'line-clamp-2'}`}
            style={{ color: 'rgba(200,200,216,0.75)' }}
          >
            {description}
          </p>

          {/* Footer row */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
              style={{ border: '1.5px solid #a28539', color: '#a28539', background: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(162,133,57,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronIcon open={expanded} className="w-3 h-3" />
              {expanded ? 'Show less' : 'Read more'}
            </button>

            {active && (
              <span className="text-xs flex items-center gap-1" style={{ color: 'rgba(162,133,57,0.6)' }}>
                {footerIcon}
                {footerText}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
