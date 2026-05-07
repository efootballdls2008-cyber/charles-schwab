import { useState } from 'react'
import { motion } from 'framer-motion'

const CHART_W = 420
const CHART_H = 160
const PAD_L = 44
const PAD_R = 10
const PAD_T = 10
const PAD_B = 24

const Y_LABELS = [8660, 8640, 8620, 8600, 8580, 8560]
const X_LABELS = ['23:00', '02:00', '05:00', '08:00', '11:00', '14:00', '17:00', '20:00']

// Static candle data: [open, high, low, close]
const CANDLES: [number, number, number, number][] = [
  [8580, 8610, 8570, 8600],
  [8600, 8630, 8595, 8615],
  [8615, 8640, 8605, 8625],
  [8625, 8650, 8610, 8608],
  [8608, 8620, 8590, 8595],
  [8595, 8605, 8575, 8580],
  [8580, 8600, 8565, 8598],
  [8598, 8625, 8590, 8620],
  [8620, 8645, 8615, 8638],
  [8638, 8660, 8630, 8655],
  [8655, 8665, 8640, 8642],
  [8642, 8655, 8628, 8630],
  [8630, 8640, 8610, 8615],
  [8615, 8628, 8600, 8622],
  [8622, 8648, 8618, 8645],
  [8645, 8658, 8635, 8640],
  [8640, 8650, 8620, 8625],
  [8625, 8638, 8610, 8635],
  [8635, 8655, 8628, 8650],
  [8650, 8662, 8642, 8658],
]

const Y_MIN = 8555
const Y_MAX = 8670

function priceToY(price: number): number {
  const ratio = (price - Y_MIN) / (Y_MAX - Y_MIN)
  return CHART_H - PAD_B - ratio * (CHART_H - PAD_T - PAD_B)
}

const TABS = ['Week', 'Month', 'Year']

export default function MarketOverviewChart() {
  const [activeTab, setActiveTab] = useState('Week')

  const candleW = (CHART_W - PAD_L - PAD_R) / CANDLES.length
  const candleBodyW = Math.max(candleW * 0.55, 4)

  return (
    <motion.div
      className="rounded-2xl p-5 flex flex-col"
      style={{
        background: 'rgba(22,15,53,0.9)',
        border: '1px solid rgba(162,133,57,0.15)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-bold text-white">Market Overview</h2>
          {/* Tabs */}
          <div
            className="flex items-center rounded-lg p-0.5 gap-0.5"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                style={
                  activeTab === tab
                    ? { background: '#1e1b3a', color: '#fff' }
                    : { color: '#6b7280' }
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <a href="#" className="text-xs font-medium" style={{ color: '#c9a84c' }}>
          Get Report →
        </a>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4ade80' }} />
          Buy $8,420.50
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9ca3af' }} />
          Sell $8,420.50
        </span>
      </div>

      {/* Candlestick chart */}
      <div className="flex-1">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Market overview candlestick chart"
        >
          {/* Horizontal grid lines + Y labels */}
          {Y_LABELS.map((price) => {
            const y = priceToY(price)
            return (
              <g key={price}>
                <line
                  x1={PAD_L}
                  y1={y}
                  x2={CHART_W - PAD_R}
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
                <text x={PAD_L - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#6b7280">
                  {price}
                </text>
              </g>
            )
          })}

          {/* Candles */}
          {CANDLES.map(([open, high, low, close], i) => {
            const x = PAD_L + i * candleW + candleW / 2
            const isBull = close >= open
            const color = isBull ? '#c4b5fd' : '#e2e8f0'
            const bodyTop = priceToY(Math.max(open, close))
            const bodyBot = priceToY(Math.min(open, close))
            const bodyH = Math.max(bodyBot - bodyTop, 1)

            return (
              <motion.g
                key={i}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.4, delay: i * 0.03, ease: 'easeOut' }}
                style={{ transformOrigin: `${x}px ${CHART_H - PAD_B}px` }}
              >
                {/* Wick */}
                <line
                  x1={x}
                  y1={priceToY(high)}
                  x2={x}
                  y2={priceToY(low)}
                  stroke={color}
                  strokeWidth="1"
                />
                {/* Body */}
                <rect
                  x={x - candleBodyW / 2}
                  y={bodyTop}
                  width={candleBodyW}
                  height={bodyH}
                  fill={isBull ? '#c4b5fd' : 'rgba(226,232,240,0.3)'}
                  stroke={color}
                  strokeWidth="0.5"
                  rx="1"
                />
              </motion.g>
            )
          })}

          {/* X-axis labels */}
          {X_LABELS.map((label, i) => {
            const x =
              PAD_L +
              (i / (X_LABELS.length - 1)) * (CHART_W - PAD_L - PAD_R)
            return (
              <text
                key={label}
                x={x}
                y={CHART_H - 4}
                textAnchor="middle"
                fontSize="8"
                fill="#6b7280"
              >
                {label}
              </text>
            )
          })}
        </svg>
      </div>
    </motion.div>
  )
}
