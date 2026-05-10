import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import { useDeposits } from '../../hooks/useDeposits'
import { useProfitOverview } from '../../hooks/useProfitOverview'
import type { ProfitPeriod } from '../../hooks/useProfitOverview'

const PERIODS: ProfitPeriod[] = ['Today', 'This Week', 'This Month', 'This Year']
type Period = ProfitPeriod

interface CustomTooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
  period?: Period
}

function CustomTooltip({ active, payload, label, period }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs"
      style={{ background: '#1e1b3a', border: '1px solid rgba(139,92,246,0.3)' }}
    >
      <p className="text-gray-400">
        {period === 'Today' ? label : label}
      </p>
      <p className="font-bold text-white mt-0.5">
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  )
}

// Ghost bars shown when user has deposited but no profit data yet
const GHOST_BARS = [
  { day: 'Mon', h: 35 },
  { day: 'Tue', h: 55 },
  { day: 'Wed', h: 42 },
  { day: 'Thu', h: 70 },
  { day: 'Fri', h: 60 },
  { day: 'Sat', h: 80 },
  { day: 'Sun', h: 50 },
]

// Ghost bars for Today (hourly)
const GHOST_BARS_TODAY = [
  { day: '6AM', h: 20 },
  { day: '8AM', h: 35 },
  { day: '10AM', h: 55 },
  { day: '12PM', h: 42 },
  { day: '2PM', h: 70 },
  { day: '4PM', h: 60 },
  { day: '6PM', h: 80 },
  { day: '8PM', h: 50 },
  { day: '10PM', h: 30 },
]

function NoDataYetState({ period }: { period: Period }) {
  const bars = period === 'Today' ? GHOST_BARS_TODAY : GHOST_BARS
  return (
    <div className="flex-1 flex flex-col" style={{ minHeight: '200px' }}>
      {/* Ghost bar chart */}
      <div className="flex-1 relative" style={{ minHeight: '160px' }}>
        {/* Faint grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />
          ))}
        </div>

        {/* Ghost bars */}
        <div className="absolute inset-x-0 bottom-6 flex items-end justify-around px-4 gap-2">
          {bars.map((bar, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <motion.div
                className="w-full rounded-t-md"
                style={{
                  height: `${bar.h}px`,
                  background: 'linear-gradient(180deg, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.05) 100%)',
                  border: '1px solid rgba(139,92,246,0.12)',
                  borderBottom: 'none',
                }}
                initial={{ scaleY: 0, originY: 1 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="text-xs" style={{ color: 'rgba(107,114,128,0.5)', fontSize: '9px' }}>
                {bar.day}
              </span>
            </div>
          ))}
        </div>

        {/* Centered overlay message */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pb-6">
          <motion.div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.25)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <i className="fas fa-chart-line text-lg" style={{ color: '#a78bfa' }} />
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <p className="text-sm font-semibold text-white">No profit data yet</p>
            <p className="text-xs mt-1" style={{ color: '#6b7280', maxWidth: '180px' }}>
              Your profit chart will appear once trading activity begins.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Shown when user hasn't deposited at all
function NoDepositState({ period }: { period: Period }) {
  const bars = period === 'Today' ? GHOST_BARS_TODAY : GHOST_BARS
  return (
    <div className="flex-1 flex flex-col" style={{ minHeight: '200px' }}>
      <div className="flex-1 relative" style={{ minHeight: '160px' }}>
        {/* Faint grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />
          ))}
        </div>

        {/* Very faint ghost bars */}
        <div className="absolute inset-x-0 bottom-6 flex items-end justify-around px-4 gap-2">
          {bars.map((bar, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${bar.h}px`,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderBottom: 'none',
                }}
              />
              <span className="text-xs" style={{ color: 'rgba(107,114,128,0.3)', fontSize: '9px' }}>
                {bar.day}
              </span>
            </div>
          ))}
        </div>

        {/* Centered overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pb-6">
          <motion.div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <i className="fas fa-chart-bar text-lg" style={{ color: '#4b5563' }} />
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <p className="text-sm font-semibold" style={{ color: '#9ca3af' }}>Make your first deposit</p>
            <p className="text-xs mt-1" style={{ color: '#4b5563', maxWidth: '180px' }}>
              Deposit funds to start tracking your profit overview.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function ProfitOverviewChart() {
  const { user } = useAuth()
  const { deposits } = useDeposits(user?.id)
  const { data, loading } = useProfitOverview(user?.id)

  const [period, setPeriod] = useState<Period>('Today')

  const balance = user?.balance ?? 0

  // A user has "started" if they have at least one completed deposit
  const hasDeposit = deposits.some(
    (d) => d.type === 'deposit' && d.status === 'completed'
  )

  const periodRecord = data.find((p) => p.period === period)
  const chartData = periodRecord?.data ?? []

  // Total = sum of all bars (not just last bar)
  const total = chartData.reduce((sum, d) => sum + d.profit, 0)
  const pct = balance > 0 ? ((total / balance) * 100).toFixed(2) : '0.00'
  
  // Show chart if we have data structure (even if all zeros) and user has deposited
  const shouldShowChart = hasDeposit && chartData.length > 0
  const hasActualProfitData = chartData.some(d => d.profit !== 0)

  // Subtitle: show current date for Today, or period label for others
  const now = new Date()
  const todayLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
  const subtitle = period === 'Today' ? todayLabel : period

  return (
    <motion.div
      className="rounded-2xl p-5 flex flex-col h-full"
      style={{
        background: 'rgba(13,8,36,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        minHeight: '280px',
      }}
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
            {hasActualProfitData && (
              <span className="text-sm font-semibold" style={{ color: total >= 0 ? '#4ade80' : '#f87171' }}>
                {total >= 0 ? '+' : ''}${Math.abs(total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({total >= 0 ? '+' : ''}{pct}%)
              </span>
            )}
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                className="appearance-none text-xs font-medium pl-3 pr-7 py-1.5 rounded-lg outline-none cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#d1d5db',
                }}
              >
                {PERIODS.map((p) => (
                  <option key={p} value={p} style={{ background: '#1e1b3a' }}>
                    {p}
                  </option>
                ))}
              </select>
              <i
                className="fas fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                style={{ color: '#6b7280' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      )}

      {/* No deposit yet */}
      {!loading && !hasDeposit && <NoDepositState period={period} />}

      {/* Has deposit but no profit data yet */}
      {!loading && hasDeposit && shouldShowChart && !hasActualProfitData && <NoDataYetState period={period} />}

      {/* Chart */}
      {!loading && shouldShowChart && hasActualProfitData && (
        <div className="flex-1" style={{ minHeight: '200px', height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barSize={period === 'Today' ? 14 : 18}
              margin={{ top: 4, right: 4, left: -20, bottom: period === 'Today' ? 16 : 0 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="barGradientNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="day"
                tick={{
                  fill: '#6b7280',
                  fontSize: period === 'Today' ? 9 : 10,
                }}
                angle={period === 'Today' ? -35 : 0}
                textAnchor={period === 'Today' ? 'end' : 'middle'}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
              />
              <Tooltip
                content={<CustomTooltip period={period} />}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="profit" radius={[4, 4, 0, 0]} minPointSize={2}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.profit < 0 
                        ? 'url(#barGradientNegative)'
                        : index === chartData.length - 1
                        ? 'url(#barGradientActive)'
                        : 'url(#barGradient)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}
