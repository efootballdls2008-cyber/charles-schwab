import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer as RC2,
} from 'recharts'

const ALLOCATION = [
  { name: 'Stocks', value: 60, amount: 28920, color: '#f59e0b' },
  { name: 'Cryptocurrency', value: 25, amount: 12050, color: '#8b5cf6' },
  { name: 'Cash', value: 15, amount: 7230, color: '#4ade80' },
]

const TOTAL = 48200

const PERFORMANCE_DATA = [
  { t: 'Jan', v: 38000 },
  { t: 'Feb', v: 40000 },
  { t: 'Mar', v: 39000 },
  { t: 'Apr', v: 42000 },
  { t: 'May', v: 44000 },
  { t: 'Jun', v: 48200 },
]

interface CustomTooltipProps {
  active?: boolean
  payload?: { name: string; value: number; payload: { amount: number } }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs"
      style={{ background: '#1e1b3a', border: '1px solid rgba(139,92,246,0.3)' }}
    >
      <p className="text-gray-400">{item.name}</p>
      <p className="font-bold text-white">${item.payload.amount.toLocaleString()}</p>
      <p style={{ color: '#a78bfa' }}>{item.value}%</p>
    </div>
  )
}

export default function PortfolioAllocation() {
  return (
    <motion.div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: 'rgba(13,8,36,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      {/* Portfolio Allocation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white">Portfolio Allocation</h2>
          <button className="text-xs font-medium" style={{ color: '#8b5cf6' }}>View All</button>
        </div>

        <div className="flex items-center gap-4">
          {/* Donut */}
          <div className="relative flex-shrink-0" style={{ width: 110, height: 110 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ALLOCATION}
                  cx="50%"
                  cy="50%"
                  innerRadius={34}
                  outerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {ALLOCATION.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-sm font-bold text-white">${(TOTAL / 1000).toFixed(0)}K</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 flex-1">
            {ALLOCATION.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-400 truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-medium text-white">{item.value}%</span>
                  <span className="text-xs" style={{ color: '#6b7280' }}>${item.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* Overall Performance */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-white">Overall Performance</h3>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold" style={{ color: '#4ade80' }}>
            + $3,450.75 (7.72%)
          </span>
          <span className="text-xs" style={{ color: '#6b7280' }}>All Time</span>
        </div>

        <div style={{ height: 70 }}>
          <RC2 width="100%" height="100%">
            <AreaChart data={PERFORMANCE_DATA} margin={{ top: 2, right: 2, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Area
                type="monotone"
                dataKey="v"
                stroke="#4ade80"
                strokeWidth={2}
                fill="url(#perfGradient)"
                dot={false}
              />
            </AreaChart>
          </RC2>
        </div>
      </div>
    </motion.div>
  )
}
