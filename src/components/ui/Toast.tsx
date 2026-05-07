import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'pnl-profit' | 'pnl-loss'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
  // P&L specific extras
  pnl?: number
  pnlPct?: number
  pair?: string
  source?: 'bot' | 'manual'
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 4500,
  pnl,
  pnlPct,
  pair,
  source,
}: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 10)
    const exitTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
    }
  }, [duration, onClose])

  const isSuccess = type === 'success'
  const isProfit  = type === 'pnl-profit'
  const isLoss    = type === 'pnl-loss'
  const isPnl     = isProfit || isLoss

  // ── Colour tokens ──────────────────────────────────────────────────────────
  const color  = isSuccess || isProfit ? '#4ade80' : '#f87171'
  const border = isSuccess || isProfit
    ? 'rgba(74,222,128,0.35)'
    : 'rgba(248,113,113,0.35)'
  const shadow = isSuccess || isProfit
    ? '0 8px 32px rgba(74,222,128,0.15), 0 2px 8px rgba(0,0,0,0.4)'
    : '0 8px 32px rgba(248,113,113,0.15), 0 2px 8px rgba(0,0,0,0.4)'
  const iconBg = isSuccess || isProfit
    ? 'rgba(74,222,128,0.15)'
    : 'rgba(248,113,113,0.15)'
  const iconBorder = isSuccess || isProfit
    ? 'rgba(74,222,128,0.3)'
    : 'rgba(248,113,113,0.3)'

  // ── Icon ───────────────────────────────────────────────────────────────────
  const iconClass = isPnl
    ? isProfit ? 'fas fa-arrow-trend-up text-sm' : 'fas fa-arrow-trend-down text-sm'
    : isSuccess ? 'fas fa-check text-sm' : 'fas fa-times text-sm'

  // ── Title ──────────────────────────────────────────────────────────────────
  const title = isPnl
    ? isProfit ? 'Trade Closed — Profit' : 'Trade Closed — Loss'
    : isSuccess ? 'Success' : 'Error'

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-6 right-6 z-[9999] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl transition-all duration-300"
      style={{
        minWidth: '300px',
        maxWidth: '420px',
        background: 'linear-gradient(135deg, rgba(22,15,53,0.98) 0%, rgba(17,11,45,0.98) 100%)',
        border: `1px solid ${border}`,
        boxShadow: shadow,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.96)',
      }}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
      >
        <i className={iconClass} style={{ color }} aria-hidden="true" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-white leading-snug">{title}</p>
          {/* Source badge */}
          {source && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-md font-medium"
              style={{
                background: source === 'bot' ? 'rgba(167,139,250,0.15)' : 'rgba(96,165,250,0.15)',
                color: source === 'bot' ? '#a78bfa' : '#60a5fa',
                border: `1px solid ${source === 'bot' ? 'rgba(167,139,250,0.3)' : 'rgba(96,165,250,0.3)'}`,
              }}
            >
              {source === 'bot' ? '🤖 Bot' : '👤 Manual'}
            </span>
          )}
        </div>

        {/* Pair */}
        {pair && (
          <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{pair}</p>
        )}

        {/* P&L row */}
        {isPnl && pnl !== undefined && pnlPct !== undefined ? (
          <div className="flex items-center gap-3 mt-1.5">
            <span
              className="text-base font-extrabold"
              style={{ color }}
            >
              {isProfit ? '+' : ''}{pnl >= 0 ? '+' : ''}${Math.abs(pnl).toFixed(2)}
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: isProfit ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                color,
              }}
            >
              {isProfit ? '+' : ''}{pnlPct.toFixed(2)}%
            </span>
          </div>
        ) : (
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#9ca3af' }}>
            {message}
          </p>
        )}

        {/* Message below P&L */}
        {isPnl && message && (
          <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6b7280' }}>
            {message}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
        aria-label="Dismiss notification"
      >
        <i className="fas fa-times text-xs text-gray-500" aria-hidden="true" />
      </button>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 rounded-b-2xl"
        style={{
          background: isSuccess || isProfit
            ? 'linear-gradient(90deg, #4ade80, #22c55e)'
            : 'linear-gradient(90deg, #f87171, #ef4444)',
          animation: `toast-progress ${duration}ms linear forwards`,
        }}
      />

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  )
}
