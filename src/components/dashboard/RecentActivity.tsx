import { motion } from 'framer-motion'
import { useDeposits } from '../../hooks/useDeposits'
import { useState, useEffect } from 'react'
import { get } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import type { Deposit } from '../../services/depositService'
import type { Purchase } from '../../services/holdingService'

interface RecentActivityProps {
  userId: number | undefined
}

const ACTIVITY_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
  deposit:   { icon: 'fas fa-arrow-down',   bg: 'rgba(74,222,128,0.15)',   color: '#4ade80' },
  withdraw:  { icon: 'fas fa-arrow-up',     bg: 'rgba(248,113,113,0.15)',  color: '#f87171' },
  buy_stock: { icon: 'fas fa-chart-line',   bg: 'rgba(96,165,250,0.15)',   color: '#60a5fa' },
  buy_crypto:{ icon: 'fas fa-coins',        bg: 'rgba(251,191,36,0.15)',   color: '#fbbf24' },
  buy:       { icon: 'fas fa-chart-line',   bg: 'rgba(96,165,250,0.15)',   color: '#60a5fa' },
  sell:      { icon: 'fas fa-chart-line',   bg: 'rgba(251,191,36,0.15)',   color: '#fbbf24' },
  bot:       { icon: 'fas fa-robot',        bg: 'rgba(139,92,246,0.15)',   color: '#a78bfa' },
}

type ActivityItem = {
  id: string | number
  type: string
  title: string
  subtitle: string
  amount: number
  positive: boolean
  time: string
  txId: string
  status: string
  sortKey: number
}

function toDateLabel(dateStr: string): string {
  const dateObj = new Date(`${dateStr}T00:00:00`)
  const today     = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (dateObj.toDateString() === today.toDateString())     return 'Today'
  if (dateObj.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDeposit(d: Deposit): ActivityItem {
  return {
    id:       `dep-${d.id}`,
    type:     d.type,
    title:    d.type === 'deposit' ? 'Deposit' : 'Withdrawal',
    subtitle: d.method,
    amount:   d.amount,
    positive: d.type === 'deposit',
    time:     `${toDateLabel(d.date)}, ${d.time}`,
    txId:     d.txId,
    status:   d.status,
    sortKey:  new Date(`${d.date} ${d.time}`).getTime() || 0,
  }
}

function formatPurchase(p: Purchase): ActivityItem {
  const isStock  = p.type === 'buy_stock'
  return {
    id:       `buy-${p.id}`,
    type:     p.type,
    title:    isStock ? 'Buy Stocks' : 'Buy Cryptocurrency',
    subtitle: `${p.name} (${p.symbol}) · ${p.quantity} units @ $${p.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    amount:   p.totalCost,
    positive: false,
    time:     `${toDateLabel(p.date)}, ${p.time}`,
    txId:     p.txId,
    status:   p.status,
    sortKey:  new Date(`${p.date} ${p.time}`).getTime() || 0,
  }
}

export default function RecentActivity({ userId }: RecentActivityProps) {
  const { deposits, loading: dLoading, error: dError } = useDeposits(userId)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [pLoading, setPLoading]   = useState(true)

  useEffect(() => {
    if (!userId) { setPLoading(false); return }
    setPLoading(true)
    get<Purchase[]>(`${ENDPOINTS.purchases(userId)}`)
      .then(data => setPurchases(data))
      .catch(() => setPurchases([]))
      .finally(() => setPLoading(false))
  }, [userId])

  const loading = dLoading || pLoading
  const error   = dError

  const activities: ActivityItem[] = [
    ...deposits.map(formatDeposit),
    ...purchases.map(formatPurchase),
  ]
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 8)

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
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white">Recent Activity</h2>
        <button className="text-xs font-medium" style={{ color: '#8b5cf6' }}>
          View All
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <i className="fas fa-spinner fa-spin text-lg" style={{ color: '#8b5cf6' }} />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-center" style={{ color: '#f87171' }}>
            <i className="fas fa-exclamation-circle mr-1" />
            {error}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && activities.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <i className="fas fa-inbox text-2xl" style={{ color: '#374151' }} />
          <p className="text-xs" style={{ color: '#6b7280' }}>No activity yet</p>
        </div>
      )}

      {/* Activity list */}
      {!loading && !error && activities.length > 0 && (
        <div className="flex-1 space-y-3 overflow-y-auto">
          {activities.map((item, i) => {
            const iconStyle = ACTIVITY_ICONS[item.type] ?? ACTIVITY_ICONS.deposit
            return (
              <motion.div
                key={item.id}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: iconStyle.bg }}
                >
                  <i className={`${iconStyle.icon} text-xs`} style={{ color: iconStyle.color }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-none">{item.title}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#6b7280' }}>
                    {item.subtitle}
                    {item.txId ? ` · ${item.txId}` : ''}
                  </p>
                </div>

                {/* Amount + time */}
                <div className="text-right flex-shrink-0">
                  <p
                    className="text-sm font-bold"
                    style={{ color: item.positive ? '#4ade80' : '#f87171' }}
                  >
                    {item.positive ? '+' : '-'}${item.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{item.time}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
