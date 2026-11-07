import { Link } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeatureCardBadge {
  label: string
  /** Tailwind / inline color token for text + border + bg */
  color: 'gold' | 'green' | 'indigo'
  /** Optional small SVG icon inside the badge */
  icon?: React.ReactNode
  withDot?: boolean
}

export interface FeatureCardProps {
  /** SVG icon node rendered inside the icon box */
  icon: React.ReactNode
  /** Gradient colors for the icon box border/bg */
  iconAccent?: 'gold' | 'gold-bright' | 'indigo' | 'green'
  title: string
  description: string
  badge?: FeatureCardBadge
  /** Text + href for the "learn more" arrow link */
  link?: { label: string; to: string }
  /** Top gradient bar variant */
  topBar?: 'gold-purple' | 'purple-gold'
}

// ─── Color maps ───────────────────────────────────────────────────────────────

const iconAccentStyles: Record<NonNullable<FeatureCardProps['iconAccent']>, React.CSSProperties> = {
  gold: {
    background: 'linear-gradient(135deg, rgba(162,133,57,0.25), rgba(43,25,120,0.5))',
    border: '1px solid rgba(162,133,57,0.4)',
    boxShadow: '0 4px 20px rgba(162,133,57,0.2)',
  },
  'gold-bright': {
    background: 'linear-gradient(135deg, rgba(201,168,76,0.25), rgba(13,8,36,0.6))',
    border: '1px solid rgba(201,168,76,0.4)',
    boxShadow: '0 4px 20px rgba(201,168,76,0.2)',
  },
  indigo: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(43,25,120,0.5))',
    border: '1px solid rgba(99,102,241,0.4)',
    boxShadow: '0 4px 20px rgba(99,102,241,0.2)',
  },
  green: {
    background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(13,8,36,0.7))',
    border: '1px solid rgba(34,197,94,0.35)',
    boxShadow: '0 4px 20px rgba(34,197,94,0.15)',
  },
}

const badgeStyles: Record<FeatureCardBadge['color'], React.CSSProperties> = {
  gold: {
    background: 'rgba(162,133,57,0.12)',
    color: '#d4a843',
    border: '1px solid rgba(162,133,57,0.3)',
  },
  green: {
    background: 'rgba(34,197,94,0.12)',
    color: '#4ade80',
    border: '1px solid rgba(34,197,94,0.25)',
  },
  indigo: {
    background: 'rgba(99,102,241,0.12)',
    color: '#818cf8',
    border: '1px solid rgba(99,102,241,0.3)',
  },
}

const topBarGradients: Record<NonNullable<FeatureCardProps['topBar']>, string> = {
  'gold-purple': 'linear-gradient(90deg, #2b1978, #a28539, #2b1978)',
  'purple-gold': 'linear-gradient(90deg, #a28539, #2b1978, #a28539)',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FeatureCard({
  icon,
  iconAccent = 'gold',
  title,
  description,
  badge,
  link,
  topBar,
}: FeatureCardProps) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-all duration-300 cursor-default flex flex-col"
      style={{
        background: 'linear-gradient(145deg, rgba(22,15,53,0.9), rgba(13,8,36,0.95))',
        border: '1px solid rgba(43,25,120,0.45)',
        backdropFilter: 'blur(16px)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.borderColor = 'rgba(162,133,57,0.6)'
        el.style.transform = 'translateY(-6px)'
        el.style.boxShadow = '0 24px 48px rgba(0,0,0,0.5), 0 0 40px rgba(162,133,57,0.1)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.borderColor = 'rgba(43,25,120,0.45)'
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Top gradient bar */}
      {topBar && (
        <div
          className="h-0.5 w-full flex-shrink-0"
          style={{ background: topBarGradients[topBar] }}
          aria-hidden="true"
        />
      )}

      <div className="p-7 flex flex-col flex-1">
        {/* Icon box */}
        <div className="relative w-16 h-16 mb-6 flex-shrink-0">
          <div className="absolute inset-0 rounded-2xl" style={iconAccentStyles[iconAccent]} />
          <div className="absolute inset-0 flex items-center justify-center">{icon}</div>
        </div>

        {/* Badge */}
        {badge && (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-4 self-start text-xs font-bold"
            style={badgeStyles[badge.color]}
          >
            {badge.withDot && (
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: badgeStyles[badge.color].color as string }}
                aria-hidden="true"
              />
            )}
            {badge.icon}
            {badge.label}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-3">{title}</h3>

        {/* Description */}
        <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(180,180,200,0.7)' }}>
          {description}
        </p>

        {/* Arrow link */}
        {link && (
          <Link
            to={link.to}
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold group/link"
            style={{ color: '#a28539' }}
          >
            {link.label}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  )
}
