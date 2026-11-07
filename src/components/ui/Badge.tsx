interface BadgeProps {
  children: React.ReactNode
  /** Optional pulsing dot before the text */
  withDot?: boolean
  className?: string
}

/**
 * Small gold pill badge — used for section labels and status indicators.
 */
export default function Badge({ children, withDot = false, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest ${className}`}
      style={{
        background: 'rgba(162,133,57,0.12)',
        border: '1px solid rgba(162,133,57,0.35)',
        color: '#c9a84c',
      }}
    >
      {withDot && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: '#c9a84c' }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
