import { useState, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useProfitOverview } from '../../hooks/useProfitOverview'
import type { ProfitPeriod, ProfitDataPoint } from '../../hooks/useProfitOverview'

const PERIODS: ProfitPeriod[] = ['Today', 'This Week', 'This Month', 'This Year']

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface Tip {
  x: number; y: number; label: string; value: number; visible: boolean
}

// ─── SVG line chart ───────────────────────────────────────────────────────────

const W = 800   // viewBox width  (scales with container)
const H = 180   // viewBox height
const PAD_L = 52
const PAD_R = 16
const PAD_T = 16
const PAD_B = 28  // room for x-axis labels

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  // Smooth cubic bezier through all points
  return points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`
    const prev = points[i - 1]
    const cpX  = (prev.x + p.x) / 2
    return `${acc} C ${cpX},${prev.y} ${cpX},${p.y} ${p.x},${p.y}`
  }, '')
}

function SVGLineChart({
  data,
  sym,
  accentColor,
}: {
  data: ProfitDataPoint[]
  sym: string
  accentColor: string
}) {
  const svgRef  = useRef<SVGSVGElement>(null)
  const [tip, setTip] = useState<Tip>({ x: 0, y: 0, label: '', value: 0, visible: false })

  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B

  const values  = data.map(d => d.profit)
  const minVal  = Math.min(...values, 0)
  const maxVal  = Math.max(...values, 0)
  const range   = maxVal - minVal || 1
  const yPad    = range * 0.12

  const yMin = minVal - yPad
  const yMax = maxVal + yPad
  const yRange = yMax - yMin || 1

  // Map data → SVG coordinates
  const points = useMemo(() => data.map((d, i) => ({
    x: PAD_L + (i / Math.max(data.length - 1, 1)) * chartW,
    y: PAD_T + (1 - (d.profit - yMin) / yRange) * chartH,
    label: d.day,
    value: d.profit,
  })), [data, chartW, chartH, yMin, yRange])

  const linePath = buildPath(points)

  // Area fill path (close below the baseline)
  const baselineY = PAD_T + (1 - (0 - yMin) / yRange) * chartH
  const areaPath  = points.length >= 2
    ? `${linePath} L ${points[points.length - 1].x},${baselineY} L ${points[0].x},${baselineY} Z`
    : ''

  // Y-axis ticks (4 evenly spaced)
  const yTicks = [0, 1, 2, 3].map(i => yMin + (yRange * i) / 3)

  // X-axis: show every Nth label to avoid crowding
  const showEvery = data.length > 20 ? 4 : data.length > 12 ? 2 : 1

  function fmtVal(v: number) {
    const a = Math.abs(v)
    if (a >= 1_000_000) return `${sym}${(a / 1_000_000).toFixed(1)}M`
    if (a >= 1_000)     return `${sym}${(a / 1_000).toFixed(1)}K`
    return `${sym}${a.toFixed(0)}`
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg  = svgRef.current
    if (!svg || points.length === 0) return
    const rect = svg.getBoundingClientRect()
    const scaleX = W / rect.width
    const mx = (e.clientX - rect.left) * scaleX

    // Find nearest point
    let nearest = points[0]
    let minDist = Math.abs(points[0].x - mx)
    for (const p of points) {
      const d = Math.abs(p.x - mx)
      if (d < minDist) { minDist = d; nearest = p }
    }

    const scaleY = H / rect.height
    setTip({
      x: nearest.x / scaleX,
      y: nearest.y / scaleY,
      label: nearest.label,
      value: nearest.value,
      visible: true,
    })
  }

  const gradId  = `lineGrad-${accentColor.replace('#', '')}`
  const areaId  = `areaGrad-${accentColor.replace('#', '')}`

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: '180px', overflow: 'visible' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTip(t => ({ ...t, visible: false }))}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={accentColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="1"   />
          </linearGradient>
          <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={accentColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0"    />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines + labels */}
        {yTicks.map((tick, i) => {
          const yPos = PAD_T + (1 - (tick - yMin) / yRange) * chartH
          return (
            <g key={i}>
              <line
                x1={PAD_L} y1={yPos} x2={W - PAD_R} y2={yPos}
                stroke="rgba(255,255,255,0.05)" strokeWidth="1"
              />
              <text
                x={PAD_L - 4} y={yPos + 3}
                textAnchor="end"
                fontSize="9"
                fill="#4b5563"
              >
                {fmtVal(tick)}
              </text>
            </g>
          )
        })}

        {/* Zero baseline (only if range spans negative) */}
        {minVal < 0 && maxVal > 0 && (
          <line
            x1={PAD_L} y1={baselineY} x2={W - PAD_R} y2={baselineY}
            stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3"
          />
        )}

        {/* X-axis labels */}
        {points.map((p, i) => i % showEvery === 0 && (
          <text
            key={i}
            x={p.x} y={H - 4}
            textAnchor="middle"
            fontSize="9"
            fill="#6b7280"
          >
            {p.label}
          </text>
        ))}

        {/* Area fill */}
        {areaPath && (
          <path d={areaPath} fill={`url(#${areaId})`} />
        )}

        {/* Line */}
        {linePath && (
          <motion.path
            d={linePath}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        )}

        {/* Data point dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y} r="3"
            fill={p.value >= 0 ? accentColor : '#f87171'}
            stroke="rgba(13,8,36,0.9)"
            strokeWidth="1.5"
            style={{ opacity: tip.visible && tip.label === p.label ? 1 : 0.5 }}
          />
        ))}

        {/* Hover vertical line */}
        {tip.visible && (() => {
          const pt = points.find(p => p.label === tip.label)
          return pt ? (
            <line
              x1={pt.x} y1={PAD_T} x2={pt.x} y2={H - PAD_B}
              stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3"
            />
          ) : null
        })()}
      </svg>

      {/* Tooltip */}
      {tip.visible && (
        <div
          className="absolute pointer-events-none z-10 rounded-lg px-2.5 py-1.5 text-xs shadow-xl"
          style={{
            left: `${tip.x}px`,
            top:  `${tip.y - 12}px`,
            transform: 'translate(-50%, -100%)',
            background: '#1e1b3a',
            border: '1px solid rgba(139,92,246,0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          <p style={{ color: '#9ca3af' }}>{tip.label}</p>
          <p className="font-bold mt-0.5" style={{ color: tip.value >= 0 ? '#4ade80' : '#f87171' }}>
            {tip.value >= 0 ? '+' : ''}{sym}{Math.abs(tip.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfitLineChart() {
  const { user }     = useAuth()
  const { data, loading } = useProfitOverview(user?.id)

  const [period, setPeriod] = useState<ProfitPeriod>('This Month')

  const sym = user?.currencySymbol ?? '$'

  const periodRecord  = data.find(p => p.period === period)
  const chartData     = periodRecord?.data ?? []
  const hasData       = chartData.some(d => d.profit !== 0)

  // Running cumulative line (shows growth curve, not per-period bars)
  const cumulativeData = useMemo<ProfitDataPoint[]>(() => {
    let running = 0
    return chartData.map(d => {
      running += d.profit
      return { day: d.day, profit: running }
    })
  }, [chartData])

  const total    = chartData.reduce((s, d) => s + d.profit, 0)
  const isProfit = total >= 0

  // Pick accent color based on overall direction
  const accentColor = isProfit ? '#4ade80' : '#f87171'

  return (
    <motion.div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(13,8,36,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: isProfit ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)' }}
          >
            <i
              className={`fas fa-chart-line text-sm`}
              style={{ color: accentColor }}
            />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Cumulative Profit Trend</h2>
            <p className="text-xs" style={{ color: '#6b7280' }}>Running total over selected period</p>
          </div>
          {hasData && !loading && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: isProfit ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                color: accentColor,
                border: `1px solid ${isProfit ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
              }}
            >
              {isProfit ? '+' : ''}{sym}{Math.abs(total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        {/* Period selector */}
        <div className="relative">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as ProfitPeriod)}
            className="appearance-none text-xs font-medium pl-3 pr-7 py-1.5 rounded-lg outline-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#d1d5db' }}
          >
            {PERIODS.map(p => (
              <option key={p} value={p} style={{ background: '#1e1b3a' }}>{p}</option>
            ))}
          </select>
          <i className="fas fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: '#6b7280' }} />
        </div>
      </div>

      {/* Divider */}
      <div className="mb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center" style={{ height: '180px' }}>
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: accentColor }} />
        </div>
      )}

      {/* No data */}
      {!loading && !hasData && (
        <div className="flex flex-col items-center justify-center gap-3" style={{ height: '180px' }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <i className="fas fa-chart-line text-base" style={{ color: '#4b5563' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#9ca3af' }}>No trend data yet</p>
          <p className="text-xs text-center" style={{ color: '#4b5563', maxWidth: '200px' }}>
            Profit trend will appear once trading activity is recorded.
          </p>
        </div>
      )}

      {/* Chart */}
      {!loading && hasData && (
        <SVGLineChart data={cumulativeData} sym={sym} accentColor={accentColor} />
      )}

      {/* Legend */}
      {!loading && hasData && (
        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ background: accentColor }} />
            <span className="text-xs" style={{ color: '#6b7280' }}>Cumulative P&L</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
            <span className="text-xs" style={{ color: '#6b7280' }}>Profit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#f87171' }} />
            <span className="text-xs" style={{ color: '#6b7280' }}>Loss</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
