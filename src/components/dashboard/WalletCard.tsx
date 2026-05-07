import { motion } from 'framer-motion'

interface WalletCardProps {
  coin: string
  symbol: string
  valueUsd: number
  change30d: number
  color: string
  sparklinePath: string
}

export default function WalletCard({
  coin,
  symbol,
  valueUsd,
  change30d,
  color,
  sparklinePath,
}: WalletCardProps) {
  const isGreen = color === '#4ade80'
  const sparklineColor = isGreen ? '#4ade80' : color

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valueUsd)

  return (
    <motion.div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: isGreen ? 'rgba(74,222,128,0.06)' : 'rgba(22,15,53,0.9)',
        border: isGreen
          ? '1px solid rgba(74,222,128,0.15)'
          : '1px solid rgba(162,133,57,0.15)',
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      {/* Top row: icon + sparkline */}
      <div className="flex items-start justify-between">
        {/* Coin icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: `${color}22`,
            border: `1.5px solid ${color}55`,
            color,
          }}
        >
          {symbol.slice(0, 2)}
        </div>

        {/* Sparkline SVG */}
        <svg
          viewBox="0 0 80 30"
          width="80"
          height="30"
          fill="none"
          aria-hidden="true"
          className="opacity-80"
        >
          <path
            d={sparklinePath}
            stroke={sparklineColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Coin name */}
      <p className="text-xs font-medium" style={{ color: '#9ca3af' }}>
        {coin}
      </p>

      {/* Value */}
      <p className="text-xl font-bold text-white leading-none">{formattedValue}</p>

      {/* Change */}
      <p className="text-xs font-medium" style={{ color: '#4ade80' }}>
        +{change30d}%{' '}
        <span className="text-gray-500 font-normal">(30 days)</span>
      </p>
    </motion.div>
  )
}
