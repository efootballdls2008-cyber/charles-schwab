import { motion } from 'framer-motion'
import type { User } from '../../services/authService'
import { useDeposits } from '../../hooks/useDeposits'
import { useProfitOverview } from '../../hooks/useProfitOverview'

interface BalanceCardProps {
  user: User | null
  onDeposit?: () => void
  onWithdraw?: () => void
}

export default function BalanceCard({ user, onDeposit, onWithdraw }: BalanceCardProps) {
  const balance = user?.balance ?? 0

  const { deposits } = useDeposits(user?.id)
  const { data: profitData } = useProfitOverview(user?.id)

  const hasDeposit = deposits.some((d) => d.type === 'deposit' && d.status === 'completed')

  // Derive profit from "This Month" period data
  const monthRecord = profitData.find((p) => p.period === 'This Month')
  const monthData = monthRecord?.data ?? []
  const profit = hasDeposit && monthData.length > 0
    ? monthData[monthData.length - 1].profit
    : 0
  const profitPct = hasDeposit && monthData.length > 1
    ? Number((((monthData[monthData.length - 1].profit - monthData[0].profit) / monthData[0].profit) * 100).toFixed(2))
    : 0

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(balance)

  return (
    <motion.div
      className="rounded-2xl flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #1a0f4f 0%, #2d1b8e 45%, #5b21b6 80%, #7c3aed 100%)',
        border: '1px solid rgba(139,92,246,0.35)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-40px', right: '-40px', width: '180px', height: '180px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-20px', left: '-30px', width: '160px', height: '160px',
          background: 'radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 70%)',
        }}
      />

      {/* ── Header: label + chip ── */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium tracking-wide" style={{ color: 'rgba(196,181,253,0.75)' }}>
            Available Balance
          </p>
          <button
            className="opacity-50 hover:opacity-90 transition-opacity"
            aria-label="Toggle balance visibility"
          >
            <i className="fas fa-eye text-xs" style={{ color: 'rgba(196,181,253,0.8)' }} />
          </button>
        </div>

        {/* EMV chip */}
        <div
          className="rounded-md flex items-center justify-center flex-shrink-0"
          style={{ width: '38px', height: '30px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
        >
          <div className="grid grid-cols-2 gap-px p-1.5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{ width: '7px', height: '7px', background: 'rgba(120,53,15,0.55)' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

      {/* ── Balance + profit ── */}
      <div className="px-6 py-5 flex-1">
        <motion.p
          className="font-bold text-white leading-none"
          style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2rem)' }}
          key={formatted}
          initial={{ opacity: 0.5, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {formatted}
        </motion.p>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}
          >
            <i className="fas fa-arrow-trend-up text-xs" />
            +${profit.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({profitPct}%)
          </span>
          <span className="text-xs" style={{ color: 'rgba(196,181,253,0.5)' }}>
            Profit this month
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

      {/* ── Visa wordmark ── */}
      <div className="px-6 py-5 flex justify-end">
        <p
          className="text-2xl font-black italic select-none"
          style={{
            color: 'rgba(255,255,255,0.88)',
            fontFamily: '"Times New Roman", serif',
            letterSpacing: '-0.02em',
          }}
        >
          VISA
        </p>
      </div>
    </motion.div>
  )
}
