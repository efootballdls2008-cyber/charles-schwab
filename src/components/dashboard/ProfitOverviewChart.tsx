import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useDeposits } from '../../hooks/useDeposits'
import { useProfitOverview } from '../../hooks/useProfitOverview'
import type { ProfitPeriod, ProfitDataPoint } from '../../hooks/useProfitOverview'

const PERIODS: ProfitPeriod[] = ['Today', 'This Week', 'This Month', 'This Year']

// ─── Ghost bar data ───────────────────────────────────────────────────────────

const GHOST_WEEK   = [35, 55, 42, 70, 60, 80, 50]
const GHOST_TODAY  = [20, 35, 55, 42, 70, 60, 80, 50, 30]
const LABELS_WEEK  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const LABELS_TODAY = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM']

// ─── Ghost bars ───────────────────────────────────────────────────────────────

function GhostBars({ period, dim }: { period: ProfitPeriod; dim: boolean }) {
  const heights = period === 'Today' ? GHOST_TODAY : GHOST_WEEK
  const labels  = period === 'Today' ? LABELS_TODAY : LABELS_WEEK
  return (
    <div className="flex items-end justify-around gap-1 w-full" style={{ height: '140px' }}>
      {heights.map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <motion.div
            className="w-full rounded-t-sm"
            style={{
              height: `${h}px`,
              background: dim
                ? 'linear-gradient(180deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%)'
                : 'linear-gradient(180deg,rgba(139,92,246,0.18) 0%,rgba(139,92,246,0.05) 100%)',
              border: `1px solid ${dim ? 'rgba(255,255,255,0.05)' : 'rgba(139,92,246,0.12)'}`,
              borderBottom: 'none',
            }}
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          />
          <span style={{ color: dim ? 'rgba(107,114,128,0.3)' : 'rgba(107,114,128,0.5)', fontSize: '9px' }}>
            {labels[i]}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Empty overlay ────────────────────────────────────────────────────────────

function EmptyOverlay({ icon, title, subtitle, dim }: {
  icon: string; title: string; subtitle: string; dim: boolean
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pb-4">
      <motion.div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{
          background: dim ? 'rgba(255,255,255,0.04)' : 'rgba(139,92,246,0.12)',
          border: `1px solid ${dim ? 'rgba(255,255,255,0.08)' : 'rgba(139,92,246,0.25)'}`,
          backdropFilter: 'blur(8px)',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <i className={`${icon} text-lg`} style={{ color: dim ? '#4b5563' : '#a78bfa' }} />
      </motion.div>
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <p className="text-sm font-semibold" style={{ color: dim ? '#9ca3af' : '#fff' }}>{title}</p>
        <p className="text-xs mt-1" style={{ color: '#6b7280', maxWidth: '180px' }}>{subtitle}</p>
      </motion.div>
    </div>
  )
}

// ─── Pure CSS bar chart ───────────────────────────────────────────────────────

interface TooltipState {
  x: number; y: number; label: string; value: number; visible: boolean
}

function CSSBarChart({ data, sym }: { data: ProfitDataPoint[]; sym: string }) {
  const [tip, setTip] = useState<TooltipState>({ x: 0, y: 0, label: '', value: 0, visible: false })
  const wrapRef = useRef<HTMLDivElement>(null)

  const CHART_H  = 150
  const LABEL_H  = 20
  const YAXIS_W  = 38

  const maxAbs   = Math.max(...data.map(d => Math.abs(d.profit)), 1)
  const yMax     = maxAbs * 1.2
  const showEvery = data.length > 20 ? 4 : data.length > 12 ? 2 : 1

  function fmtVal(v: number) {
    const a = Math.abs(v)
    if (a >= 1_000_000) return `${sym}${(a / 1_000_000).toFixed(1)}M`
    if (a >= 1_000)     return `${sym}${(a / 1_000).toFixed(1)}K`
    return `${sym}${a.toFixed(2)}`
  }

  const yTicks = [0.25, 0.5, 0.75, 1].map(f => yMax * f)

  return (
    <div ref={wrapRef} className="relative w-full select-none" style={{ height: `${CHART_H + LABEL_H + 4}px` }}>

      {/* Y-axis grid + labels */}
      <div
        className="absolute pointer-events-none"
        style={{ left: 0, right: 0, top: 0, bottom: `${LABEL_H}px` }}
      >
        {yTicks.map((tick, i) => {
          const pct = (tick / yMax) * 100
          return (
            <div
              key={i}
              className="absolute w-full flex items-center"
              style={{ bottom: `${pct}%` }}
            >
              <span
                className="text-right pr-1 flex-shrink-0"
                style={{ color: '#4b5563', fontSize: '9px', width: `${YAXIS_W}px` }}
              >
                {fmtVal(tick)}
              </span>
              <div className="flex-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />
            </div>
          )
        })}
        {/* Baseline */}
        <div
          className="absolute w-full"
          style={{ bottom: 0, borderTop: '1px solid rgba(255,255,255,0.12)' }}
        />
      </div>

      {/* Bars */}
      <div
        className="absolute flex items-end gap-0.5"
        style={{ left: `${YAXIS_W}px`, right: 0, bottom: `${LABEL_H}px`, height: `${CHART_H}px` }}
      >
        {data.map((d, i) => {
          const isNeg    = d.profit < 0
          const isLast   = i === data.length - 1
          const hPct     = Math.max((Math.abs(d.profit) / yMax) * 100, d.profit !== 0 ? 1.5 : 0)
          const barBg    = isNeg
            ? 'linear-gradient(180deg,rgba(248,113,113,0.85) 0%,rgba(239,68,68,0.4) 100%)'
            : isLast
            ? 'linear-gradient(180deg,rgba(167,139,250,1) 0%,rgba(124,58,237,0.6) 100%)'
            : 'linear-gradient(180deg,rgba(74,222,128,0.85) 0%,rgba(34,197,94,0.35) 100%)'

          return (
            <div
              key={i}
              className="flex flex-col items-center flex-1 h-full justify-end cursor-pointer group"
              onMouseEnter={(e) => {
                const wrap = wrapRef.current?.getBoundingClientRect()
                const bar  = (e.currentTarget as HTMLElement).getBoundingClientRect()
                if (!wrap) return
                setTip({ x: bar.left - wrap.left + bar.width / 2, y: bar.top - wrap.top - 8, label: d.day, value: d.profit, visible: true })
              }}
              onMouseLeave={() => setTip(t => ({ ...t, visible: false }))}
            >
              <motion.div
                className="w-full rounded-t-sm group-hover:opacity-80 transition-opacity"
                style={{ height: `${hPct}%`, minHeight: d.profit !== 0 ? '3px' : '0px', background: barBg }}
                initial={{ scaleY: 0, originY: 1 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: i * 0.02, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          )
        })}
      </div>

      {/* X-axis labels */}
      <div
        className="absolute flex items-start gap-0.5"
        style={{ left: `${YAXIS_W}px`, right: 0, bottom: 0, height: `${LABEL_H}px` }}
      >
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex justify-center overflow-hidden">
            {i % showEvery === 0 && (
              <span className="truncate text-center" style={{ color: '#6b7280', fontSize: '9px', lineHeight: '20px' }}>
                {d.day}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tip.visible && (
        <div
          className="absolute pointer-events-none z-10 rounded-lg px-2.5 py-1.5 text-xs shadow-xl"
          style={{
            left: `${tip.x}px`,
            top: `${tip.y}px`,
            transform: 'translate(-50%,-100%)',
            background: '#1e1b3a',
            border: '1px solid rgba(139,92,246,0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          <p style={{ color: '#9ca3af' }}>{tip.label}</p>
          <p className="font-bold text-white mt-0.5">
            {tip.value >= 0 ? '+' : '-'}{fmtVal(tip.value)}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfitOverviewChart() {
  const { user }    = useAuth()
  const { deposits } = useDeposits(user?.id)
  const { data, loading } = useProfitOverview(user?.id)

  const [period, setPeriod] = useState<ProfitPeriod>('Today')

  const balance = user?.balance ?? 0
  const sym     = user?.currencySymbol ?? '$'

  const hasDeposit    = deposits.some(d => d.type === 'deposit' && d.status === 'completed')
  const periodRecord  = data.find(p => p.period === period)
  const chartData     = periodRecord?.data ?? []
  const hasActualData = chartData.some(d => d.profit !== 0)
  const showChart     = hasDeposit && hasActualData

  const total = chartData.reduce((s, d) => s + d.profit, 0)
  const pct   = balance > 0 ? ((total / balance) * 100).toFixed(2) : '0.00'

  const now        = new Date()
  const todayLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
  const subtitle   = period === 'Today' ? todayLabel : period

  return (
    <motion.div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(13,8,36,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold text-white">Profit Overview</h2>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{subtitle}</p>
        </div>
        {hasDeposit && !loading && (
          <div className="flex items-center gap-3">
            {hasActualData && (
              <span className="text-sm font-semibold" style={{ color: total >= 0 ? '#4ade80' : '#f87171' }}>
                {total >= 0 ? '+' : ''}{sym}{Math.abs(total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({total >= 0 ? '+' : ''}{pct}%)
              </span>
            )}
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
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center" style={{ height: '200px' }}>
          <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      )}

      {/* No deposit */}
      {!loading && !hasDeposit && (
        <div className="relative" style={{ height: '200px' }}>
          <GhostBars period={period} dim={true} />
          <EmptyOverlay icon="fas fa-chart-bar" title="Make your first deposit" subtitle="Deposit funds to start tracking your profit overview." dim={true} />
        </div>
      )}

      {/* Has deposit, no data yet */}
      {!loading && hasDeposit && !hasActualData && (
        <div className="relative" style={{ height: '200px' }}>
          <GhostBars period={period} dim={false} />
          <EmptyOverlay icon="fas fa-chart-line" title="No profit data yet" subtitle="Your profit chart will appear once trading activity begins." dim={false} />
        </div>
      )}

      {/* Real chart */}
      {!loading && showChart && (
        <CSSBarChart data={chartData} sym={sym} />
      )}
    </motion.div>
  )
}
