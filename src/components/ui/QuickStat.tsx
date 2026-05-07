interface QuickStatProps {
  value: string
  label: string
  variant?: 'gold' | 'purple'
}

/**
 * Small stat box — used in the Education section quick stats row.
 */
export default function QuickStat({ value, label, variant = 'gold' }: QuickStatProps) {
  const style: React.CSSProperties =
    variant === 'gold'
      ? {
          background: 'rgba(162,133,57,0.06)',
          border: '1px solid rgba(162,133,57,0.15)',
        }
      : {
          background: 'rgba(43,25,120,0.15)',
          border: '1px solid rgba(43,25,120,0.3)',
        }

  return (
    <div className="rounded-lg p-3 text-center" style={style}>
      <div
        className="text-lg font-bold"
        style={variant === 'gold' ? { color: '#a28539' } : { color: '#ffffff' }}
      >
        {value}
      </div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}
