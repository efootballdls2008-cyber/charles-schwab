import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from '../../services/authService'
import { useBalanceActivity } from '../../hooks/useBalanceActivity'
import type { ActivityItem, ActivityStyle } from '../../hooks/useBalanceActivity'

interface BalanceCardProps {
  user: User | null
  onDeposit?: () => void
  onWithdraw?: () => void
}

// ─── Style map ────────────────────────────────────────────────────────────────

const STYLE_MAP: Record<ActivityStyle, { color: string; bg: string; border: string }> = {
  success: { color: '#4ade80', bg: 'rgba(74,222,128,0.15)',  border: 'rgba(74,222,128,0.25)' },
  danger:  { color: '#f87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.25)' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.25)'  },
  info:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  border: 'rgba(96,165,250,0.25)'  },
}

// ─── Anchor (Profit this month) ───────────────────────────────────────────────

function buildAnchor(pnl: number, pct: number): ActivityItem {
  const pos = pnl >= 0
  return {
    id: '__anchor__',
    style: pos ? 'success' : 'danger',
    icon: pos ? 'fas fa-arrow-trend-up' : 'fas fa-arrow-trend-down',
    label: 'Profit this month',
    amount: pnl,
    amountLabel: `${pos ? '+' : ''}$${Math.abs(pnl).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} (${pos ? '+' : ''}${Math.abs(pct).toFixed(2)}%)`,
    timestamp: '',
  }
}

// ─── Subline pill ─────────────────────────────────────────────────────────────

function SublinePill({ item }: { item: ActivityItem }) {
  const s = STYLE_MAP[item.style]
  return (
    <motion.span
      key={item.id}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
      initial={{ opacity: 0, y: 6, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.94 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <i className={`${item.icon} text-xs`} />
      {item.amountLabel}
    </motion.span>
  )
}

// ─── Rotating subline ─────────────────────────────────────────────────────────

const FLASH_MS = 4000

function BalanceSubline({
  monthlyPnl,
  monthlyPnlPct,
  flashEvent,
  dismissFlash,
}: {
  monthlyPnl: number
  monthlyPnlPct: number
  flashEvent: ActivityItem | null
  dismissFlash: () => void
}) {
  const anchor = buildAnchor(monthlyPnl, monthlyPnlPct)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // When a flash event arrives, auto-dismiss after 4s
  useEffect(() => {
    if (!flashEvent) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      dismissFlash()
    }, FLASH_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [flashEvent, dismissFlash])

  // What to display right now
  const current = flashEvent ?? anchor
  const s = STYLE_MAP[current.style]

  return (
    <div className="flex items-center gap-2 mt-3 flex-wrap min-h-[28px]">
      <AnimatePresence mode="wait">
        <SublinePill key={current.id} item={current} />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.span
          key={`lbl-${current.id}`}
          className="text-xs"
          style={{ color: 'rgba(196,181,253,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {current.label}
        </motion.span>
      </AnimatePresence>

      {/* Progress bar — only shown during a flash event */}
      {flashEvent && (
        <div className="w-full mt-1.5">
          <motion.div
            className="h-0.5 rounded-full"
            style={{ background: s.color, opacity: 0.4 }}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: FLASH_MS / 1000, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Main BalanceCard ─────────────────────────────────────────────────────────

export default function BalanceCard({ user }: BalanceCardProps) {
  const balance = user?.balance ?? 0

  const { monthlyPnl, monthlyPnlPct, flashEvent, dismissFlash } =
    useBalanceActivity(user?.id, balance)

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

      {/* ── Balance + subline ── */}
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

        <BalanceSubline
          monthlyPnl={monthlyPnl}
          monthlyPnlPct={monthlyPnlPct}
          flashEvent={flashEvent}
          dismissFlash={dismissFlash}
        />
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
