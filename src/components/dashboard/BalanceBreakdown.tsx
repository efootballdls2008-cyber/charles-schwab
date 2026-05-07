import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import { useHoldings } from '../../hooks/useHoldings'
import { useWallets } from '../../hooks/useWallets'
import { useMemo } from 'react'

interface BreakdownItem {
  name: string
  value: number
  amount: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { name: string; value: number; payload: BreakdownItem }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{ background: '#1e1b3a', border: '1px solid rgba(139,92,246,0.35)' }}
    >
      <p className="text-gray-400">{item.name}</p>
      <p className="font-bold text-white mt-0.5">${item.payload.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      <p className="mt-0.5" style={{ color: '#a78bfa' }}>{item.value}%</p>
    </div>
  )
}

export default function BalanceBreakdown() {
  const { user } = useAuth()
  const { holdings, loading: holdingsLoading } = useHoldings(user?.id)
  const { wallets, loading: walletsLoading } = useWallets(user?.id)

  // Calculate breakdown from real data
  const { breakdown, total } = useMemo(() => {
    if (!user) return { breakdown: [], total: 0 }

    // Calculate stocks value (holdings with type='stock')
    const stocksValue = holdings
      .filter((h) => h.type === 'stock')
      .reduce((sum, h) => sum + h.quantity * h.currentPrice, 0)

    // Calculate crypto value from holdings (type='crypto')
    const cryptoFromHoldings = holdings
      .filter((h) => h.type === 'crypto')
      .reduce((sum, h) => sum + h.quantity * h.currentPrice, 0)

    // Calculate crypto value from wallets
    const cryptoFromWallets = wallets.reduce((sum, w) => sum + w.valueUsd, 0)

    // Total crypto = holdings + wallets
    const cryptoValue = cryptoFromHoldings + cryptoFromWallets

    // Cash = user balance
    const cashValue = user.balance

    const total = stocksValue + cryptoValue + cashValue

    // Calculate percentages
    const stocksPct = total > 0 ? (stocksValue / total) * 100 : 0
    const cryptoPct = total > 0 ? (cryptoValue / total) * 100 : 0
    const cashPct = total > 0 ? (cashValue / total) * 100 : 0

    const breakdown: BreakdownItem[] = [
      { name: 'Stocks', value: parseFloat(stocksPct.toFixed(1)), amount: stocksValue, color: '#f59e0b' },
      { name: 'Cryptocurrency', value: parseFloat(cryptoPct.toFixed(1)), amount: cryptoValue, color: '#8b5cf6' },
      { name: 'Cash', value: parseFloat(cashPct.toFixed(1)), amount: cashValue, color: '#4ade80' },
    ].filter((item) => item.amount > 0) // Only show categories with value

    return { breakdown, total }
  }, [user, holdings, wallets])

  const loading = holdingsLoading || walletsLoading

  if (loading) {
    return (
      <motion.div
        className="rounded-2xl p-5 flex flex-col items-center justify-center"
        style={{
          background: 'rgba(13,8,36,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          minHeight: '340px',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#8b5cf6' }} />
        <p className="text-xs mt-3" style={{ color: '#6b7280' }}>Loading balance...</p>
      </motion.div>
    )
  }

  if (breakdown.length === 0) {
    return (
      <motion.div
        className="rounded-2xl p-5 flex flex-col items-center justify-center"
        style={{
          background: 'rgba(13,8,36,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          minHeight: '340px',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <i className="fas fa-chart-pie text-3xl mb-3" style={{ color: '#4b5563' }} />
        <p className="text-sm font-semibold text-white mb-1">No Assets</p>
        <p className="text-xs text-center" style={{ color: '#6b7280' }}>
          Start investing to see your balance breakdown
        </p>
      </motion.div>
    )
  }
  return (
    <motion.div
      className="rounded-2xl p-5 flex flex-col"
      style={{
        background: 'rgba(13,8,36,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        minHeight: '340px',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
    >
      {/* Title */}
      <h2 className="text-base font-bold text-white mb-3 flex-shrink-0">Balance Breakdown</h2>

      {/* Donut chart */}
      <div className="relative w-full flex-shrink-0" style={{ height: '200px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={breakdown}
              cx="50%"
              cy="50%"
              innerRadius="38%"
              outerRadius="58%"
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {breakdown.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label — absolutely positioned over the chart */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs" style={{ color: '#9ca3af' }}>Total</p>
          <p className="text-lg font-bold text-white leading-tight">
            ${total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="flex-shrink-0 my-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* Legend rows — fixed height, never pushed off screen */}
      <div className="flex flex-col gap-2.5 flex-shrink-0">
        {breakdown.map((item, i) => (
          <div key={item.name}>
            {/* Label + values */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-400 truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs font-semibold text-white">{item.value}%</span>
                <span className="text-xs tabular-nums" style={{ color: '#6b7280' }}>
                  ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Animated progress bar */}
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: '5px', background: 'rgba(255,255,255,0.06)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
