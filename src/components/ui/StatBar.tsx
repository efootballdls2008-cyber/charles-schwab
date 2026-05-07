// ─── Types ────────────────────────────────────────────────────────────────────

export interface StatBarItem {
  value: string
  label: string
  /** Optional icon node rendered before the value */
  icon?: React.ReactNode
  /** Pulsing green dot instead of icon */
  liveDot?: boolean
  /** Gold-colored value text */
  gold?: boolean
}

interface StatBarProps {
  items: StatBarItem[]
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Horizontal stats bar — glassmorphism card with shimmer top/bottom lines.
 * Splits items into equal columns with dividers between them.
 */
export default function StatBar({ items }: StatBarProps) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(13,8,36,0.95), rgba(22,15,53,0.9))',
        border: '1px solid rgba(162,133,57,0.2)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Top shimmer */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(162,133,57,0.5), rgba(43,25,120,0.5), rgba(162,133,57,0.5), transparent)',
        }}
        aria-hidden="true"
      />

      <div className={`grid grid-cols-2 md:grid-cols-${items.length}`}>
        {items.map((item, i) => (
          <div
            key={item.label}
            className="flex flex-col items-center py-8 px-6"
            style={
              i < items.length - 1
                ? { borderRight: '1px solid rgba(162,133,57,0.12)' }
                : undefined
            }
          >
            <div className="flex items-center gap-2 mb-1">
              {item.liveDot && (
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: '#4ade80' }}
                  aria-hidden="true"
                />
              )}
              {item.icon}
              <span
                className="text-3xl font-black"
                style={{
                  color: item.gold ? '#a28539' : '#ffffff',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {item.value}
              </span>
            </div>
            <span
              className="text-xs font-medium tracking-wide uppercase"
              style={{ color: 'rgba(180,180,200,0.5)' }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom shimmer */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(43,25,120,0.5), rgba(162,133,57,0.3), transparent)',
        }}
        aria-hidden="true"
      />
    </div>
  )
}
