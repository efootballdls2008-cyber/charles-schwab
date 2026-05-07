import { motion } from 'framer-motion'
import { useMarketStats } from '../../hooks/useMarketStats'

const CHART_W = 340
const CHART_H = 180
const PAD_L = 10
const PAD_R = 10
const PAD_T = 10
const PAD_B = 24

function normalize(values: number[], min: number, max: number): number[] {
  const range = max - min || 1
  return values.map((v) => ((v - min) / range) * (CHART_H - PAD_T - PAD_B))
}

function buildPath(xs: number[], ys: number[]): string {
  if (xs.length === 0) return ''
  const pts = xs.map((x, i) => `${x},${CHART_H - PAD_B - ys[i]}`)
  return `M${pts.join(' L')}`
}

const LEGEND = [
  { label: 'BTC', color: '#9ca3af' },
  { label: 'XRP', color: '#9ca3af' },
  { label: 'ETH', color: '#4ade80' },
  { label: 'ZEC', color: '#9ca3af' },
  { label: 'LTC', color: '#9ca3af' },
]

export default function CryptoStatsChart() {
  const { stats, loading } = useMarketStats()

  const months = stats.map((s) => s.month)
  const n = stats.length

  const xs = stats.map((_, i) =>
    PAD_L + (i / Math.max(n - 1, 1)) * (CHART_W - PAD_L - PAD_R)
  )

  const btcVals = stats.map((s) => s.btc)
  const ethVals = stats.map((s) => s.eth)

  const btcMin = Math.min(...btcVals)
  const btcMax = Math.max(...btcVals)
  const ethMin = Math.min(...ethVals)
  const ethMax = Math.max(...ethVals)

  const btcNorm = normalize(btcVals, btcMin, btcMax)
  const ethNorm = normalize(ethVals, ethMin, ethMax)

  const btcPath = buildPath(xs, btcNorm)
  const ethPath = buildPath(xs, ethNorm)

  return (
    <motion.div
      className="rounded-2xl p-5 h-full flex flex-col"
      style={{
        background: 'rgba(22,15,53,0.9)',
        border: '1px solid rgba(162,133,57,0.15)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white">Crypto Statistics</h2>
        <div className="flex items-center gap-3 flex-wrap">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: l.color }}
              />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center">
        {loading ? (
          <p className="text-xs text-gray-500">Loading…</p>
        ) : (
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            aria-label="Crypto statistics line chart"
          >
            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((t) => {
              const y = PAD_T + t * (CHART_H - PAD_T - PAD_B)
              return (
                <line
                  key={t}
                  x1={PAD_L}
                  y1={y}
                  x2={CHART_W - PAD_R}
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              )
            })}

            {/* BTC line */}
            {btcPath && (
              <motion.path
                d={btcPath}
                stroke="#9ca3af"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
              />
            )}

            {/* ETH line */}
            {ethPath && (
              <motion.path
                d={ethPath}
                stroke="#4ade80"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.4 }}
              />
            )}

            {/* ETH area fill */}
            {ethPath && n > 0 && (
              <motion.path
                d={`${ethPath} L${xs[n - 1]},${CHART_H - PAD_B} L${xs[0]},${CHART_H - PAD_B} Z`}
                fill="rgba(74,222,128,0.06)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              />
            )}

            {/* X-axis labels */}
            {months.map((m, i) => (
              <text
                key={m}
                x={xs[i]}
                y={CHART_H - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#6b7280"
              >
                {m}
              </text>
            ))}
          </svg>
        )}
      </div>
    </motion.div>
  )
}
