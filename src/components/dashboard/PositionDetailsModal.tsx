import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type PositionSource = 'bot' | 'user'

export interface PositionDetails {
  id: string
  source: PositionSource
  pair: string
  base: string
  side: 'buy' | 'sell'
  entryPrice: number
  currentPrice: number | null
  amount: number
  openedAt: string
  // bot extras
  strategy?: string
  signal?: string
  // user holding extras
  holdingName?: string
  holdingType?: 'stock' | 'crypto'
}

interface PositionDetailsModalProps {
  position: PositionDetails
  onClose: () => void
}

const COIN_COLOR: Record<string, string> = {
  BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', BNB: '#f3ba2f',
  XRP: '#00aae4', ADA: '#0033ad', MATIC: '#8247e5', LINK: '#2a5ada',
  AVAX: '#e84142', DOT: '#e6007a', AAPL: '#a2a2a2', MSFT: '#00a4ef',
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function PositionDetailsModal({ position, onClose }: PositionDetailsModalProps) {
  const currentPrice = position.currentPrice ?? position.entryPrice
  const pnl = position.side === 'buy'
    ? (currentPrice - position.entryPrice) * position.amount
    : (position.entryPrice - currentPrice) * position.amount
  const pnlPct = position.side === 'buy'
    ? ((currentPrice - position.entryPrice) / position.entryPrice) * 100
    : ((position.entryPrice - currentPrice) / position.entryPrice) * 100
  const isProfit = pnl >= 0
  const totalValue = currentPrice * position.amount
  const totalCost  = position.entryPrice * position.amount

  const color   = COIN_COLOR[position.base] ?? '#9ca3af'
  const iconMap: Record<string, string> = { BTC: 'fab fa-bitcoin', ETH: 'fab fa-ethereum' }
  const icon    = iconMap[position.base]
  const pnlColor = isProfit ? '#4ade80' : '#f87171'

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
      >
        {/* Modal — slides up on mobile, scales in on desktop */}
        <motion.div
          className="relative w-full sm:max-w-lg flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(160deg, rgba(22,15,53,0.99) 0%, rgba(14,9,36,0.99) 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            maxHeight: '92dvh',
          }}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Coin-tinted glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at top right, ${color}28 0%, transparent 55%)` }} />

          {/* ── Drag handle (mobile) ── */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
          </div>

          {/* ── Header ── */}
          <div className="relative flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}22`, border: `1.5px solid ${color}55` }}>
                {icon
                  ? <i className={`${icon} text-lg`} style={{ color }} />
                  : <span className="text-sm font-bold" style={{ color }}>{position.base.slice(0, 2)}</span>}
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight truncate">{position.pair}</h2>
                {position.holdingName && (
                  <p className="text-xs text-gray-400 truncate">{position.holdingName}</p>
                )}
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ml-2 transition-all hover:bg-white/10"
              style={{ color: '#9ca3af' }} aria-label="Close">
              <i className="fas fa-times" />
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div className="relative overflow-y-auto flex-1 px-4 sm:px-5 py-4 space-y-4">

            {/* Badges row */}
            <div className="flex items-center flex-wrap gap-2">
              {position.source === 'bot' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
                  <i className="fas fa-robot text-xs" /> Bot Trade
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
                  <i className="fas fa-user text-xs" /> Manual
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase"
                style={{
                  color: position.side === 'buy' ? '#4ade80' : '#f87171',
                  background: position.side === 'buy' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                  border: position.side === 'buy' ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(248,113,113,0.25)',
                }}>
                {position.side === 'buy' ? '↗ Long' : '↘ Short'}
              </span>
              {position.holdingType && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#d1d5db' }}>
                  {position.holdingType === 'stock' ? '📈 Stock' : '🪙 Crypto'}
                </span>
              )}
              {/* Live indicator */}
              <span className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: '#4ade80' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
                Live
              </span>
            </div>

            {/* P&L banner */}
            <div className="rounded-2xl px-4 py-3.5"
              style={{
                background: isProfit ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)',
                border: `1px solid ${isProfit ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
              }}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-gray-400">Unrealized P&L</p>
                <i className={`fas ${isProfit ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}
                  style={{ color: pnlColor }} />
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: pnlColor }}>
                  {isProfit ? '+' : ''}${Math.abs(pnl).toFixed(2)}
                </p>
                <p className="text-base sm:text-lg font-semibold" style={{ color: pnlColor }}>
                  {isProfit ? '+' : ''}{pnlPct.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* 2-col price grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Entry Price',    value: `$${fmt(position.entryPrice)}` },
                { label: 'Current Price',  value: `$${fmt(currentPrice)}`, accent: pnlColor },
                { label: 'Position Size',  value: String(position.amount), sub: position.base },
                { label: 'Current Value',  value: `$${fmt(totalValue)}` },
                { label: 'Total Cost',     value: `$${fmt(totalCost)}` },
                {
                  label: 'Opened At',
                  value: position.openedAt === '—'
                    ? '—'
                    : new Date(position.openedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  sub: position.openedAt === '—'
                    ? undefined
                    : new Date(position.openedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm font-bold" style={{ color: item.accent ?? '#fff' }}>{item.value}</p>
                  {item.sub && <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>}
                </div>
              ))}
            </div>

            {/* 3-col metrics */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Price Δ', value: `${isProfit ? '+' : ''}$${Math.abs(currentPrice - position.entryPrice).toFixed(2)}`, color: pnlColor },
                { label: 'ROI',     value: `${isProfit ? '+' : ''}${pnlPct.toFixed(2)}%`,                                       color: pnlColor },
                { label: 'Status',  value: 'Open', color: '#4ade80', dot: true },
              ].map((m) => (
                <div key={m.label} className="text-center p-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                  <p className="text-xs sm:text-sm font-bold flex items-center justify-center gap-1" style={{ color: m.color }}>
                    {m.dot && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: m.color }} />}
                    {m.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Bot strategy block */}
            {position.source === 'bot' && position.strategy && (
              <div className="rounded-xl p-3.5"
                style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.2)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="fas fa-brain text-xs" style={{ color: '#a78bfa' }} />
                  <p className="text-xs font-semibold" style={{ color: '#a78bfa' }}>AI Strategy</p>
                </div>
                <p className="text-sm font-bold text-white">{position.strategy}</p>
                {position.signal && (
                  <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(167,139,250,0.15)' }}>
                    <p className="text-xs text-gray-500 mb-1">Signal</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{position.signal}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="relative flex items-center gap-2.5 px-4 sm:px-5 py-3 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.1)' }}>
              Close
            </button>
            <button
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}>
              <i className="fas fa-times-circle mr-1.5" />
              Close Position
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
