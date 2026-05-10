import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { AlgoSignal, AlgoPerformance, BotTrade, AlgoState } from '../../hooks/useAlgorithmEngine'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtElapsed(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m ${sec}s`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

// ─── Mini PnL Sparkline ───────────────────────────────────────────────────────

function PnlSparkline({ history }: { history: { pnl: number; cumulative: number }[] }) {
  if (history.length < 2) {
    return (
      <div className="flex items-center justify-center h-12" style={{ color: '#4b5563' }}>
        <span className="text-xs">Waiting for trades…</span>
      </div>
    )
  }

  const values = history.map((h) => h.cumulative)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 240, H = 48
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 8) - 4
    return `${x},${y}`
  })
  const pathD = `M ${pts.join(' L ')}`
  const areaD = `M 0,${H} L ${pts.join(' L ')} L ${W},${H} Z`
  const positive = values[values.length - 1] >= values[0]
  const color = positive ? '#4ade80' : '#f87171'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 48 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#sparkGrad)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      <circle
        cx={W}
        cy={H - ((values[values.length - 1] - min) / range) * (H - 8) - 4}
        r="3"
        fill={color}
      />
    </svg>
  )
}

// ─── Signal Badge ─────────────────────────────────────────────────────────────

function SignalBadge({ signal }: { signal: AlgoSignal | null }) {
  if (!signal) return null
  const color = signal.type === 'BUY' ? '#4ade80' : signal.type === 'SELL' ? '#f87171' : '#f59e0b'
  const bg = signal.type === 'BUY' ? 'rgba(74,222,128,0.12)' : signal.type === 'SELL' ? 'rgba(248,113,113,0.12)' : 'rgba(245,158,11,0.12)'
  const border = signal.type === 'BUY' ? 'rgba(74,222,128,0.3)' : signal.type === 'SELL' ? 'rgba(248,113,113,0.3)' : 'rgba(245,158,11,0.3)'

  return (
    <motion.div
      key={signal.timestamp}
      className="rounded-xl p-3"
      style={{ background: bg, border: `1px solid ${border}` }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{ background: bg, color, border: `1px solid ${border}` }}
          >
            {signal.type}
          </span>
          <span className="text-xs font-semibold" style={{ color }}>
            {signal.confidence.toFixed(0)}% confidence
          </span>
        </div>
        {/* Confidence bar */}
        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${signal.confidence}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>{signal.reason}</p>
    </motion.div>
  )
}

// ─── Indicator Row ────────────────────────────────────────────────────────────

function IndicatorRow({ signal }: { signal: AlgoSignal | null }) {
  if (!signal) return null
  const { rsi, macd, ema9, ema21 } = signal.indicators

  const rsiColor = rsi < 35 ? '#4ade80' : rsi > 65 ? '#f87171' : '#f59e0b'
  const macdColor = macd > 0 ? '#4ade80' : '#f87171'
  const emaColor = ema9 > ema21 ? '#4ade80' : '#f87171'

  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: 'RSI', value: rsi.toFixed(1), color: rsiColor, sub: rsi < 35 ? 'Oversold' : rsi > 65 ? 'Overbought' : 'Neutral' },
        { label: 'MACD', value: macd.toFixed(1), color: macdColor, sub: macd > 0 ? 'Bullish' : 'Bearish' },
        { label: 'EMA', value: ema9 > ema21 ? '↑ Bull' : '↓ Bear', color: emaColor, sub: `9/${21}` },
      ].map((ind) => (
        <div
          key={ind.label}
          className="rounded-xl p-2.5 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>{ind.label}</p>
          <p className="text-sm font-bold" style={{ color: ind.color }}>{ind.value}</p>
          <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>{ind.sub}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Open Position Card ───────────────────────────────────────────────────────

function OpenPositionCard({ trade }: { trade: BotTrade; midPrice: number }) {
  const navigate = useNavigate()

  return (
    <motion.div
      className="rounded-xl p-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.2)' }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: trade.side === 'buy' ? '#4ade80' : '#f87171' }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: trade.side === 'buy' ? '#4ade80' : '#f87171' }} />
          </span>
          <span className="text-xs font-bold text-white">Open Position</span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full uppercase"
          style={{
            background: trade.side === 'buy' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
            color: trade.side === 'buy' ? '#4ade80' : '#f87171',
          }}
        >
          {trade.side === 'buy' ? 'Long' : 'Short'}
        </span>
      </div>

      {/* Navigate to Positions page */}
      <button
        onClick={() => navigate('/user/positions')}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
        style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}
      >
        <i className="fas fa-chart-area text-xs" />
        View in Positions
        <i className="fas fa-arrow-right text-xs" />
      </button>
    </motion.div>
  )
}

// ─── Trade Log ────────────────────────────────────────────────────────────────

function TradeLog({ trades }: { trades: BotTrade[] }) {
  const closed = trades.filter((t) => t.status === 'closed').slice(0, 5)
  if (closed.length === 0) return null

  return (
    <div>
      <p className="text-xs font-semibold mb-2" style={{ color: '#9ca3af' }}>Recent Bot Trades</p>
      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {closed.map((t) => (
            <motion.div
              key={t.id}
              className="flex items-center justify-between py-1.5 px-2.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)' }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded uppercase"
                  style={{
                    background: t.side === 'buy' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                    color: t.side === 'buy' ? '#4ade80' : '#f87171',
                  }}
                >
                  {t.side}
                </span>
                <span className="text-xs text-white">{t.pair}</span>
              </div>
              <div className="text-right">
                <span
                  className="text-xs font-bold"
                  style={{ color: t.pnl >= 0 ? '#4ade80' : '#f87171' }}
                >
                  {t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(2)}
                </span>
                <span className="text-xs ml-1" style={{ color: '#4b5563' }}>
                  ({t.pnlPct >= 0 ? '+' : ''}{t.pnlPct.toFixed(2)}%)
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Idle Panel (bot off) ─────────────────────────────────────────────────────

function IdlePanel({ onStart, state }: { onStart: () => void; state: AlgoState }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 p-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}
      >
        <i className="fas fa-robot text-2xl" style={{ color: '#a78bfa' }} />
      </div>
      <div>
        <p className="text-sm font-bold text-white mb-1">Algorithm Ready</p>
        <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>
          Strategy: <span style={{ color: '#a78bfa' }}>{state.strategy}</span><br />
          Risk: <span style={{ color: '#f59e0b' }}>{state.riskLevel}</span> · Pair: <span className="text-white">{state.pair}</span>
        </p>
      </div>
      <motion.button
        onClick={onStart}
        className="w-full py-3 rounded-xl text-sm font-bold"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.3))',
          border: '1px solid rgba(139,92,246,0.5)',
          color: '#a78bfa',
        }}
        whileHover={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.45), rgba(99,102,241,0.45))' }}
        whileTap={{ scale: 0.97 }}
      >
        <i className="fas fa-play-circle mr-2" />
        Start Algorithm
      </motion.button>
    </motion.div>
  )
}

// ─── Main AlgoBotPanel ────────────────────────────────────────────────────────

interface AlgoBotPanelProps {
  base: string
  midPrice: number
  state: AlgoState
  signal: AlgoSignal | null
  trades: BotTrade[]
  performance: AlgoPerformance
  scanStatus: string
  elapsed: number
  openTrade: BotTrade | null
  onStart: () => void
  onStop: () => Promise<{ ok: boolean; reason?: string }>
  onForceEntry?: () => Promise<{ ok: boolean; reason?: string }>
  onOpenSettings: () => void
}

export default function AlgoBotPanel({
  base,
  midPrice,
  state,
  signal,
  trades,
  performance,
  scanStatus,
  elapsed,
  openTrade,
  onStart,
  onStop,
  onForceEntry,
  onOpenSettings,
}: AlgoBotPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isScanning = scanStatus.includes('signal') || scanStatus.includes('Signal')
  const [stopWarning, setStopWarning] = useState(false)
  const [forceEntryLoading, setForceEntryLoading] = useState(false)
  const [forceEntryMsg, setForceEntryMsg] = useState<string | null>(null)

  const handleStop = async () => {
    const result = await onStop()
    if (!result.ok && result.reason === 'open_trade') {
      setStopWarning(true)
      setTimeout(() => setStopWarning(false), 3500)
    }
  }

  const handleForceEntry = async () => {
    if (!onForceEntry || forceEntryLoading || openTrade) return
    setForceEntryLoading(true)
    setForceEntryMsg(null)
    const result = await onForceEntry()
    setForceEntryLoading(false)
    if (!result.ok) {
      const msgs: Record<string, string> = {
        already_open: 'A position is already open.',
        bot_not_running: 'Start the bot first.',
        insufficient_data: 'Not enough price data yet — wait a moment.',
      }
      setForceEntryMsg(msgs[result.reason ?? ''] ?? 'Could not open position.')
      setTimeout(() => setForceEntryMsg(null), 3500)
    }
  }

  if (!state.running) {
    return <IdlePanel onStart={onStart} state={state} />
  }

  return (
    <motion.div
      className="flex flex-col gap-0 overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
      ref={scrollRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Status Banner ── */}
      <div
        className="mx-4 mt-4 rounded-xl p-3 flex items-center justify-between"
        style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#4ade80' }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#4ade80' }} />
          </span>
          <span className="text-xs font-bold" style={{ color: '#4ade80' }}>AI Analysis Running</span>
        </div>
        <span className="text-xs font-mono" style={{ color: '#4ade80' }}>{fmtElapsed(elapsed)}</span>
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* ── Strategy Info ── */}
        <div
          className="rounded-xl p-3 flex items-center justify-between"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <div>
            <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>Strategy</p>
            <p className="text-sm font-bold text-white">{state.strategy}</p>
          </div>
          <div className="text-right">
            <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>Pair · TF</p>
            <p className="text-sm font-bold text-white">{base}/USDT · {state.timeframe}</p>
          </div>
        </div>

        {/* ── Scan Status ── */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139,92,246,0.15)' }}
          >
            <i
              className="fas fa-satellite-dish text-xs"
              style={{ color: isScanning ? '#f59e0b' : '#a78bfa' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs" style={{ color: '#6b7280' }}>Algorithm Status</p>
            <motion.p
              key={scanStatus}
              className="text-xs font-semibold truncate"
              style={{ color: isScanning ? '#f59e0b' : '#a78bfa' }}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {scanStatus}
            </motion.p>
          </div>
          {isScanning && (
            <motion.div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: '#f59e0b' }}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </div>

        {/* ── Latest Signal ── */}
        <AnimatePresence mode="wait">
          {signal && <SignalBadge key={signal.timestamp} signal={signal} />}
        </AnimatePresence>

        {/* ── Indicators ── */}
        <IndicatorRow signal={signal} />

        {/* ── Performance Stats ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
          <p className="text-xs font-semibold mb-2.5" style={{ color: '#9ca3af' }}>Today's Performance</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: 'PnL',
                value: `${performance.todayPnl >= 0 ? '+' : ''}${performance.todayPnl.toFixed(2)}`,
                sub: `${performance.todayPnlPct >= 0 ? '+' : ''}${performance.todayPnlPct.toFixed(2)}%`,
                color: performance.todayPnl >= 0 ? '#4ade80' : '#f87171',
              },
              {
                label: 'Trades',
                value: String(performance.tradesExecuted),
                sub: 'executed',
                color: '#a78bfa',
              },
              {
                label: 'Win Rate',
                value: `${performance.winRate.toFixed(0)}%`,
                sub: `${performance.wins}W / ${performance.losses}L`,
                color: '#60a5fa',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-2.5 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>{s.label}</p>
                <motion.p
                  className="text-sm font-bold"
                  style={{ color: s.color }}
                  key={s.value}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                >
                  {s.value}
                </motion.p>
                <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── PnL Sparkline ── */}
        {performance.pnlHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#9ca3af' }}>Cumulative PnL</p>
              <span
                className="text-xs font-bold"
                style={{ color: performance.totalPnl >= 0 ? '#4ade80' : '#f87171' }}
              >
                {performance.totalPnl >= 0 ? '+' : ''}{performance.totalPnl.toFixed(2)} USDT
              </span>
            </div>
            <div
              className="rounded-xl overflow-hidden p-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <PnlSparkline history={performance.pnlHistory} />
            </div>
          </div>
        )}

        {/* ── Advanced Stats ── */}
        {performance.tradesExecuted > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Profit Factor', value: performance.profitFactor > 0 ? performance.profitFactor.toFixed(2) : '—', color: performance.profitFactor >= 1.5 ? '#4ade80' : '#f59e0b' },
              { label: 'Max Drawdown', value: performance.maxDrawdown > 0 ? `-${performance.maxDrawdown.toFixed(2)}` : '0.00', color: '#f87171' },
              { label: 'Avg Win', value: performance.avgWin > 0 ? `+${performance.avgWin.toFixed(2)}` : '—', color: '#4ade80' },
              { label: 'Avg Loss', value: performance.avgLoss > 0 ? `-${performance.avgLoss.toFixed(2)}` : '—', color: '#f87171' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>{s.label}</p>
                <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Open Position ── */}
        <AnimatePresence>
          {openTrade && <OpenPositionCard key={openTrade.id} trade={openTrade} midPrice={midPrice} />}
        </AnimatePresence>

        {/* ── Trade Log ── */}
        <TradeLog trades={trades} />

        {/* ── Controls ── */}
        <div className="flex flex-col gap-2 pt-1">
          <AnimatePresence>
            {stopWarning && (
              <motion.div
                className="px-3 py-2 rounded-xl flex items-center gap-2"
                style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <i className="fas fa-lock text-xs" style={{ color: '#f87171' }} />
                <span className="text-xs font-medium" style={{ color: '#f87171' }}>
                  Close the open trade before stopping the bot.
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Force Entry button — only shown when no open position */}
          <AnimatePresence>
            {!openTrade && onForceEntry && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.button
                  onClick={handleForceEntry}
                  disabled={forceEntryLoading}
                  className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  style={{
                    background: forceEntryLoading
                      ? 'rgba(251,191,36,0.06)'
                      : 'rgba(251,191,36,0.12)',
                    color: forceEntryLoading ? 'rgba(251,191,36,0.45)' : '#fbbf24',
                    border: `1px solid ${forceEntryLoading ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.3)'}`,
                  }}
                  whileHover={!forceEntryLoading ? { background: 'rgba(251,191,36,0.2)' } : undefined}
                  whileTap={!forceEntryLoading ? { scale: 0.97 } : undefined}
                  title="Open a position immediately, bypassing the confidence threshold"
                >
                  {forceEntryLoading ? (
                    <>
                      <motion.i
                        className="fas fa-circle-notch text-xs"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      Opening position…
                    </>
                  ) : (
                    <>
                      <i className="fas fa-bolt text-xs" />
                      Force Entry
                    </>
                  )}
                </motion.button>
                <AnimatePresence>
                  {forceEntryMsg && (
                    <motion.p
                      className="text-xs text-center mt-1.5"
                      style={{ color: '#f87171' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {forceEntryMsg}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-2">
            <motion.button
              onClick={handleStop}
              className="py-2.5 rounded-xl text-xs font-bold"
              style={{
                background: openTrade ? 'rgba(248,113,113,0.06)' : 'rgba(248,113,113,0.12)',
                color: openTrade ? 'rgba(248,113,113,0.5)' : '#f87171',
                border: `1px solid ${openTrade ? 'rgba(248,113,113,0.15)' : 'rgba(248,113,113,0.25)'}`,
              }}
              whileHover={{ background: openTrade ? undefined : 'rgba(248,113,113,0.2)' }}
              whileTap={{ scale: 0.97 }}
              title={openTrade ? 'Close open trade first' : 'Stop bot'}
            >
              <i className="fas fa-stop-circle mr-1.5" />Stop Bot
              {openTrade && <i className="fas fa-lock ml-1.5 text-xs" />}
            </motion.button>
            <motion.button
              onClick={onOpenSettings}
              className="py-2.5 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}
              whileHover={{ background: 'rgba(139,92,246,0.2)' }}
              whileTap={{ scale: 0.97 }}
            >
              <i className="fas fa-sliders-h mr-1.5" />Settings
            </motion.button>
          </div>
        </div>

      </div>
    </motion.div>
  )
}
