import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useLiveTicker } from '../../hooks/useLiveTicker'
import { useOrderBook, useRecentTrades } from '../../hooks/useOrderBook'
import { useAlgorithmEngine } from '../../hooks/useAlgorithmEngine'
import type { AlgoState, StrategyName, RiskLevel, TradeCloseEvent } from '../../hooks/useAlgorithmEngine'
import AlgoBotPanel from '../../components/dashboard/AlgoBotPanel'
import Toast from '../../components/ui/Toast'
import { usePnlToast } from '../../hooks/usePnlToast'

// ─── Pairs ────────────────────────────────────────────────────────────────────

const PAIRS = [
  { base: 'BTC',  quote: 'USDT', name: 'Bitcoin / Tether',  color: '#f7931a', icon: 'fab fa-bitcoin' },
  { base: 'ETH',  quote: 'USDT', name: 'Ethereum / Tether', color: '#627eea', icon: 'fab fa-ethereum' },
  { base: 'SOL',  quote: 'USDT', name: 'Solana / Tether',   color: '#9945ff', icon: 'fas fa-sun' },
  { base: 'BNB',  quote: 'USDT', name: 'BNB / Tether',      color: '#f3ba2f', icon: 'fas fa-coins' },
]

// ─── TradingView Chart ────────────────────────────────────────────────────────

function TradingViewChart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = ''

    const wrapper = document.createElement('div')
    wrapper.className = 'tradingview-widget-container__widget'
    wrapper.style.cssText = 'height:100%;width:100%;'
    containerRef.current.appendChild(wrapper)

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${symbol}USDT`,
      interval: '1',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: 'rgba(10,7,32,0)',
      gridColor: 'rgba(255,255,255,0.04)',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    })
    containerRef.current.appendChild(script)

    return () => { if (containerRef.current) containerRef.current.innerHTML = '' }
  }, [symbol])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height: '100%', width: '100%' }}
    />
  )
}

// ─── Order Book ───────────────────────────────────────────────────────────────

function OrderBookPanel({ base, midPrice }: { base: string; midPrice: number }) {
  const book = useOrderBook(midPrice)

  return (
    <div
      className="rounded-2xl p-4 flex flex-col"
      style={{ background: 'rgba(10,7,32,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <h3 className="text-sm font-bold text-white mb-3">Order Book</h3>

      {/* Headers */}
      <div className="grid grid-cols-3 mb-2">
        <span className="text-xs" style={{ color: '#6b7280' }}>Price (USDT)</span>
        <span className="text-xs text-center" style={{ color: '#6b7280' }}>Amount ({base})</span>
        <span className="text-xs text-right" style={{ color: '#6b7280' }}>Total (USDT)</span>
      </div>

      {/* Asks (sell) — red */}
      <div className="space-y-0.5 mb-2">
        {book.asks.slice(0, 5).reverse().map((a, i) => (
          <div key={i} className="grid grid-cols-3 py-0.5 relative group">
            <div
              className="absolute inset-0 rounded opacity-10"
              style={{ background: '#f87171', width: `${Math.min((a.amount / 0.15) * 100, 100)}%` }}
            />
            <span className="text-xs font-medium relative z-10" style={{ color: '#f87171' }}>
              {a.price.toFixed(2)}
            </span>
            <span className="text-xs text-center text-gray-300 relative z-10">{a.amount.toFixed(4)}</span>
            <span className="text-xs text-right text-gray-300 relative z-10">{a.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Mid price */}
      <div
        className="flex items-center justify-center gap-2 py-2 my-1 rounded-lg"
        style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}
      >
        <span className="text-sm font-bold" style={{ color: '#4ade80' }}>
          {book.lastPrice.toFixed(2)}
        </span>
        <i className="fas fa-arrow-up text-xs" style={{ color: '#4ade80' }} />
        <span className="text-xs" style={{ color: '#4ade80' }}>+{book.lastChange}%</span>
      </div>

      {/* Bids (buy) — green */}
      <div className="space-y-0.5 mt-2">
        {book.bids.slice(0, 5).map((b, i) => (
          <div key={i} className="grid grid-cols-3 py-0.5 relative group">
            <div
              className="absolute inset-0 rounded opacity-10"
              style={{ background: '#4ade80', width: `${Math.min((b.amount / 0.15) * 100, 100)}%` }}
            />
            <span className="text-xs font-medium relative z-10" style={{ color: '#4ade80' }}>
              {b.price.toFixed(2)}
            </span>
            <span className="text-xs text-center text-gray-300 relative z-10">{b.amount.toFixed(4)}</span>
            <span className="text-xs text-right text-gray-300 relative z-10">{b.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Recent Trades ────────────────────────────────────────────────────────────

function RecentTradesPanel({ base, midPrice }: { base: string; midPrice: number }) {
  const trades = useRecentTrades(midPrice)

  return (
    <div
      className="rounded-2xl p-4 flex flex-col"
      style={{ background: 'rgba(10,7,32,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <h3 className="text-sm font-bold text-white mb-3">Recent Trades</h3>

      <div className="grid grid-cols-3 mb-2">
        <span className="text-xs" style={{ color: '#6b7280' }}>Price (USDT)</span>
        <span className="text-xs text-center" style={{ color: '#6b7280' }}>Amount ({base})</span>
        <span className="text-xs text-right" style={{ color: '#6b7280' }}>Time</span>
      </div>

      <div className="space-y-0.5">
        <AnimatePresence initial={false}>
          {trades.map((t, i) => (
            <motion.div
              key={`${t.time}-${i}`}
              className="grid grid-cols-3 py-1"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <span
                className="text-xs font-medium"
                style={{ color: t.side === 'buy' ? '#4ade80' : '#f87171' }}
              >
                {t.price.toFixed(2)}
              </span>
              <span className="text-xs text-center text-gray-300">{t.amount.toFixed(4)}</span>
              <span className="text-xs text-right" style={{ color: '#6b7280' }}>{t.time}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Bot Settings Modal ───────────────────────────────────────────────────────

function BotSettingsModal({
  open,
  onClose,
  algoState,
  onSave,
}: {
  open: boolean
  onClose: () => void
  algoState: AlgoState
  onSave: (updates: Partial<AlgoState>) => void
}) {
  const [local, setLocal] = useState<AlgoState>(algoState)
  const [saved, setSaved] = useState(false)

  // Sync when modal opens
  useEffect(() => { if (open) setLocal(algoState) }, [open, algoState])

  const set = <K extends keyof AlgoState>(key: K, value: AlgoState[K]) =>
    setLocal((prev) => ({ ...prev, [key]: value }))

  const handleSave = () => {
    onSave(local)
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1200)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const riskPct = local.riskLevel === 'Conservative' ? 30 : local.riskLevel === 'Moderate' ? 70 : 90

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          />
          <motion.div className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="w-full max-w-sm pointer-events-auto flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #0f0c2a 0%, #0d0b24 100%)',
                border: '1px solid rgba(139,92,246,0.3)',
                boxShadow: '0 0 60px rgba(139,92,246,0.15), 0 24px 48px rgba(0,0,0,0.6)',
                maxHeight: '90vh',
              }}
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
                    <i className="fas fa-robot text-sm" style={{ color: '#a78bfa' }} />
                  </div>
                  <span className="text-base font-bold text-white">Algorithm Settings</span>
                </div>
                <div className="flex items-center gap-3">
                  {algoState.running && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
                      <span className="text-xs font-semibold" style={{ color: '#4ade80' }}>Running</span>
                    </div>
                  )}
                  <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: '#6b7280' }}>
                    <i className="fas fa-times text-sm" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

                {/* Strategy */}
                <SelectField
                  label="Strategy"
                  value={local.strategy}
                  onChange={(v) => set('strategy', v as StrategyName)}
                  options={['AI Scalper Pro', 'Trend Follower', 'Mean Reversion', 'Grid Bot', 'DCA Strategy']}
                />

                {/* Strategy description */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
                    {local.strategy === 'AI Scalper Pro' && 'Combines RSI, MACD crossover, and EMA alignment for high-frequency scalping with tight risk controls.'}
                    {local.strategy === 'Trend Follower' && 'Rides strong directional trends using EMA9/EMA21 crossovers and MACD momentum confirmation.'}
                    {local.strategy === 'Mean Reversion' && 'Buys oversold dips and sells overbought peaks using Bollinger Bands and RSI divergence.'}
                    {local.strategy === 'Grid Bot' && 'Places buy/sell orders at fixed price intervals within Bollinger Band range for range-bound markets.'}
                    {local.strategy === 'DCA Strategy' && 'Dollar-cost averages into positions on dips and takes profit on significant price recoveries.'}
                  </p>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: '#9ca3af' }}>Risk Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Conservative', 'Moderate', 'Aggressive'] as RiskLevel[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => set('riskLevel', r)}
                        className="py-2 rounded-xl text-xs font-semibold transition-all"
                        style={local.riskLevel === r
                          ? { background: r === 'Conservative' ? 'rgba(74,222,128,0.2)' : r === 'Moderate' ? 'rgba(245,158,11,0.2)' : 'rgba(248,113,113,0.2)', color: r === 'Conservative' ? '#4ade80' : r === 'Moderate' ? '#f59e0b' : '#f87171', border: `1px solid ${r === 'Conservative' ? 'rgba(74,222,128,0.4)' : r === 'Moderate' ? 'rgba(245,158,11,0.4)' : 'rgba(248,113,113,0.4)'}` }
                          : { background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }
                        }
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#4ade80,#f59e0b,#f87171)' }} animate={{ width: `${riskPct}%` }} transition={{ duration: 0.5 }} />
                  </div>
                </div>

                {/* Trade Pair */}
                <SelectField
                  label="Trade Pair"
                  value={local.pair}
                  onChange={(v) => set('pair', v)}
                  options={['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT']}
                />

                {/* Timeframe */}
                <SelectField
                  label="Timeframe"
                  value={local.timeframe}
                  onChange={(v) => set('timeframe', v)}
                  options={['1m', '5m', '15m', '30m', '1h', '4h', '1D']}
                />

                {/* AI Settings */}
                <div>
                  <p className="text-sm font-bold mb-3" style={{ color: '#a78bfa' }}>Risk Parameters</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Take Profit (%)" value={String(local.takeProfit)} onChange={(v) => set('takeProfit', parseFloat(v) || 0)} suffix="%" />
                    <NumberField label="Stop Loss (%)" value={String(local.stopLoss)} onChange={(v) => set('stopLoss', parseFloat(v) || 0)} suffix="%" />
                    <NumberField label="Max Open Trades" value={String(local.maxOpenTrades)} onChange={(v) => set('maxOpenTrades', parseInt(v) || 1)} />
                    <NumberField label="Daily Profit Target (%)" value={String(local.dailyProfitTarget)} onChange={(v) => set('dailyProfitTarget', parseFloat(v) || 0)} suffix="%" />
                    <div className="col-span-2">
                      <NumberField label="Trailing Stop (%)" value={String(local.trailingStop)} onChange={(v) => set('trailingStop', parseFloat(v) || 0)} suffix="%" />
                    </div>
                  </div>
                </div>

                {/* Auto Reinvest */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <span className="text-sm text-white">Auto Reinvest Profits</span>
                    <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Compound gains back into next trade</p>
                  </div>
                  <button
                    onClick={() => set('autoReinvest', !local.autoReinvest)}
                    className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                    style={{ background: local.autoReinvest ? '#7c3aed' : 'rgba(255,255,255,0.1)' }}
                  >
                    <motion.div
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                      animate={{ left: local.autoReinvest ? '24px' : '4px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(139,92,246,0.15)' }}>
                <motion.button
                  onClick={handleSave}
                  className="w-full py-3 rounded-xl text-sm font-bold"
                  style={{
                    background: saved ? 'rgba(74,222,128,0.2)' : 'transparent',
                    border: `1px solid ${saved ? 'rgba(74,222,128,0.4)' : 'rgba(139,92,246,0.5)'}`,
                    color: saved ? '#4ade80' : '#a78bfa',
                  }}
                  whileHover={{ background: saved ? undefined : 'rgba(139,92,246,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saved ? '✓ Applied!' : 'Apply Settings'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Reusable form fields ─────────────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div>
      <label className="text-xs mb-1.5 block" style={{ color: '#9ca3af' }}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-4 py-3 rounded-xl text-sm font-medium text-white outline-none cursor-pointer pr-10"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          {options.map((o) => (
            <option key={o} value={o} style={{ background: '#0f0c2a' }}>{o}</option>
          ))}
        </select>
        <i
          className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
          style={{ color: '#6b7280' }}
        />
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  suffix?: string
}) {
  return (
    <div>
      <label className="text-xs mb-1.5 block" style={{ color: '#9ca3af' }}>{label}</label>
      <div
        className="flex items-center px-3 py-2.5 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.2)' }}
      >
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm font-semibold text-white outline-none min-w-0"
        />
        {suffix && (
          <span className="text-xs font-semibold ml-1 flex-shrink-0" style={{ color: '#6b7280' }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Manual Trade Form ────────────────────────────────────────────────────────

function ManualTradeForm({ base, availableBalance, midPrice }: { base: string; availableBalance: number; midPrice: number }) {
  const { user, updateBalance } = useAuth()
  const { showSuccess, showError } = usePnlToast()
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [orderType, setOrderType] = useState<'Market' | 'Limit' | 'Stop Limit'>('Market')
  const [amount, setAmount] = useState('')
  const [pct, setPct] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  
  const amountNum = parseFloat(amount) || 0
  const total = amountNum * midPrice
  const fee = total * 0.001
  const estTotal = total + fee
  const handlePct = (p: number) => { setPct(p); setAmount(((availableBalance / midPrice * p) / 100).toFixed(6)) }

  const handleSubmit = async () => {
    if (!user) {
      showError('Please log in to place orders')
      return
    }

    if (amountNum <= 0) {
      showError('Please enter a valid amount')
      return
    }

    if (side === 'buy' && estTotal > availableBalance) {
      showError('Insufficient balance')
      return
    }

    setSubmitting(true)
    try {
      const { createOrder } = await import('../../services/orderService')
      
      await createOrder({
        userId: user.id,
        type: side,
        coin: base,
        price: midPrice,
        amount: amountNum,
        total: total,
        status: 'pending'
      })

      // Deduct balance for buy orders
      if (side === 'buy') {
        updateBalance(availableBalance - estTotal)
      }

      showSuccess(`${side === 'buy' ? 'Buy' : 'Sell'} order placed successfully`)
      
      // Reset form
      setAmount('')
      setPct(0)
    } catch (error) {
      console.error('Order submission error:', error)
      showError('Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
      <div className="grid grid-cols-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {(['buy', 'sell'] as const).map((s) => (
          <button key={s} onClick={() => setSide(s)} className="py-3 text-sm font-bold capitalize transition-all"
            style={side === s ? { color: s === 'buy' ? '#4ade80' : '#f87171', borderBottom: `2px solid ${s === 'buy' ? '#4ade80' : '#f87171'}` } : { color: '#6b7280' }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-1 flex-wrap">
          {(['Market', 'Limit', 'Stop Limit'] as const).map((t) => (
            <button key={t} onClick={() => setOrderType(t)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={orderType === t ? { background: 'rgba(255,255,255,0.1)', color: '#fff' } : { color: '#6b7280' }}>{t}</button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#6b7280' }}>Available Balance</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-white">{availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT</span>
            <button className="text-xs" style={{ color: '#8b5cf6' }}><i className="fas fa-sync-alt" /></button>
          </div>
        </div>
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: '#6b7280' }}>Amount</label>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="flex-1 bg-transparent text-sm text-white outline-none" />
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(247,147,26,0.15)' }}>
              <i className="fab fa-bitcoin text-xs" style={{ color: '#f7931a' }} />
              <span className="text-xs font-semibold text-white">{base}</span>
              <i className="fas fa-chevron-down text-xs" style={{ color: '#6b7280' }} />
            </div>
          </div>
        </div>
        <div>
          <input type="range" min={0} max={100} step={25} value={pct} onChange={(e) => handlePct(Number(e.target.value))} className="w-full h-1 rounded-full appearance-none cursor-pointer" style={{ accentColor: '#7c3aed' }} />
          <div className="flex justify-between mt-1.5">
            {[0, 25, 50, 75, 100].map((p) => (
              <button key={p} onClick={() => handlePct(p)} className="text-xs transition-colors" style={{ color: pct >= p ? '#a78bfa' : '#4b5563' }}>{p}%</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: '#6b7280' }}>Total</label>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="flex-1 text-sm text-white">{total > 0 ? total.toFixed(2) : '0.00'}</span>
            <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>USDT</span>
          </div>
        </div>
        <motion.button 
          onClick={handleSubmit}
          disabled={submitting || amountNum <= 0}
          className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed" 
          style={{ background: side === 'buy' ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff' }} 
          whileHover={submitting || amountNum <= 0 ? {} : { scale: 1.02 }} 
          whileTap={submitting || amountNum <= 0 ? {} : { scale: 0.98 }}>
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fas fa-spinner fa-spin" />
              Processing...
            </span>
          ) : (
            `${side === 'buy' ? 'Buy' : 'Sell'} ${base}`
          )}
        </motion.button>
        <div className="space-y-1.5 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex justify-between"><span className="text-xs" style={{ color: '#6b7280' }}>Est. Fee (0.1%)</span><span className="text-xs text-white">{fee > 0 ? fee.toFixed(6) : '0.000000'} BTC</span></div>
          <div className="flex justify-between"><span className="text-xs font-semibold" style={{ color: '#6b7280' }}>Est. Total</span><span className="text-xs font-semibold text-white">{estTotal > 0 ? estTotal.toFixed(2) : '0.00'} USDT</span></div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Trade Panel Right ────────────────────────────────────────────────────────

function TradePanelRight({
  base,
  availableBalance,
  midPrice,
  algoEngine,
  onOpenSettings,
}: {
  base: string
  availableBalance: number
  midPrice: number
  algoEngine: ReturnType<typeof useAlgorithmEngine>
  onOpenSettings: () => void
}) {
  const { state, signal, trades, performance, scanStatus, elapsed, openTrade, start, stop } = algoEngine
  const botEnabled = state.running
  const [showWarning, setShowWarning] = useState(false)

  const handleToggle = async () => {
    if (botEnabled) {
      // Trying to stop
      const result = await stop()
      if (!result.ok && result.reason === 'open_trade') {
        setShowWarning(true)
        setTimeout(() => setShowWarning(false), 3000)
      }
    } else {
      start()
    }
  }

  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden"
      style={{ background: 'rgba(10,7,32,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* ── AI Trade Bot toggle row ── */}
      <div className="flex flex-col gap-2 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.2)' }}>
              <i className="fas fa-robot text-xs" style={{ color: '#a78bfa' }} />
            </div>
            <span className="text-sm font-semibold text-white">AI Trade Bot</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: botEnabled ? '#4ade80' : '#6b7280' }}>
              {botEnabled ? 'Running' : 'Idle'}
            </span>
            <button
              onClick={handleToggle}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{ background: botEnabled ? '#7c3aed' : 'rgba(255,255,255,0.1)' }}
              aria-label="Toggle AI bot"
            >
              <motion.div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                animate={{ left: botEnabled ? '22px' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>

        {/* Warning message when trying to stop with open trade */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              className="px-3 py-2 rounded-xl flex items-center gap-2"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <i className="fas fa-exclamation-triangle text-xs" style={{ color: '#f87171' }} />
              <span className="text-xs font-medium" style={{ color: '#f87171' }}>
                Cannot stop bot with open trade. Wait for trade to close.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!botEnabled && (
            <motion.button
              onClick={onOpenSettings}
              className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.35)' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ background: 'rgba(139,92,246,0.15)' }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="fas fa-cog text-sm" style={{ color: '#a78bfa' }} />
              <span className="text-sm font-bold" style={{ color: '#a78bfa' }}>Configure Algorithm</span>
              <i className="fas fa-cog text-sm" style={{ color: '#a78bfa' }} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Body: Algorithm panel OR manual form ── */}
      <AnimatePresence mode="wait">
        {botEnabled ? (
          <AlgoBotPanel
            key="algo"
            base={base}
            midPrice={midPrice}
            state={state}
            signal={signal}
            trades={trades}
            performance={performance}
            scanStatus={scanStatus}
            elapsed={elapsed}
            openTrade={openTrade}
            onStart={start}
            onStop={stop}
            onOpenSettings={onOpenSettings}
          />
        ) : (
          <AnimatePresence mode="wait">
            {!botEnabled && (
              <ManualTradeForm
                key="manual"
                base={base}
                availableBalance={availableBalance}
                midPrice={midPrice}
              />
            )}
          </AnimatePresence>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Ticker Header ────────────────────────────────────────────────────────────

function TickerHeader({
  pair,
  ticker,
  midPrice,
  onSelectPair,
}: {
  pair: typeof PAIRS[0]
  ticker: { price: number; changePct24h: number; change24h: number; high24h: number; low24h: number; volume24h: number } | null
  midPrice: number
  onSelectPair: (p: typeof PAIRS[0]) => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const price = ticker?.price ?? midPrice
  const pct = ticker?.changePct24h ?? 0
  const high = ticker?.high24h ?? 0
  const low = ticker?.low24h ?? 0
  const vol = ticker?.volume24h ?? 0
  const positive = pct >= 0
  const isLive = ticker !== null

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div
      className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-2xl"
      style={{ background: 'rgba(10,7,32,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Pair icon + name with dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center gap-3 group"
          onClick={() => setDropdownOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `${pair.color}22`, border: `1.5px solid ${pair.color}55` }}
          >
            <i className={`${pair.icon} text-base`} style={{ color: pair.color }} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">{pair.base}/{pair.quote}</span>
              <motion.i
                className="fas fa-chevron-down text-xs"
                style={{ color: '#6b7280' }}
                animate={{ rotate: dropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <p className="text-xs" style={{ color: '#6b7280' }}>{pair.name}</p>
          </div>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              role="listbox"
              className="absolute left-0 top-full mt-2 z-50 rounded-2xl overflow-hidden min-w-[220px]"
              style={{
                background: 'linear-gradient(160deg, #0f0c2a 0%, #0d0b24 100%)',
                border: '1px solid rgba(139,92,246,0.3)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 30px rgba(139,92,246,0.1)',
              }}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-semibold" style={{ color: '#6b7280' }}>Select Trading Pair</p>
              </div>
              {PAIRS.map((p) => {
                const isActive = p.base === pair.base
                return (
                  <motion.button
                    key={p.base}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => { onSelectPair(p); setDropdownOpen(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors"
                    style={{
                      background: isActive ? `${p.color}18` : 'transparent',
                    }}
                    whileHover={{ background: `${p.color}12` }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `${p.color}22`, border: `1.5px solid ${p.color}44` }}
                    >
                      <i className={`${p.icon} text-sm`} style={{ color: p.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-white">{p.base}/{p.quote}</p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>{p.name}</p>
                    </div>
                    {isActive && (
                      <i className="fas fa-check text-xs" style={{ color: p.color }} />
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live price */}
      <div>
        <motion.p
          className="text-xl font-bold"
          style={{ color: isLive ? (positive ? '#4ade80' : '#f87171') : '#9ca3af' }}
          key={price.toFixed(2)}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          {!isLive && (
            <span className="inline-flex items-center gap-1 ml-2">
              <span className="w-2.5 h-2.5 rounded-full border border-t-transparent animate-spin" style={{ borderColor: '#6b7280', borderTopColor: 'transparent' }} />
            </span>
          )}
        </motion.p>
        <p className="text-xs font-medium" style={{ color: positive ? '#4ade80' : '#f87171' }}>
          {isLive
            ? `${positive ? '+' : ''}${ticker!.change24h.toFixed(2)} (${positive ? '+' : ''}${pct.toFixed(2)}%)`
            : <span style={{ color: '#4b5563' }}>—</span>
          }
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 ml-2 flex-wrap">
        {[
          { label: '24h High', value: isLive && high > 0 ? high.toLocaleString('en-US', { minimumFractionDigits: 2 }) : null },
          { label: '24h Low',  value: isLive && low > 0  ? low.toLocaleString('en-US', { minimumFractionDigits: 2 })  : null },
          { label: '24h Volume', value: isLive && vol > 0 ? `${(vol / 1e9).toFixed(2)}B USDT` : null },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-xs" style={{ color: '#6b7280' }}>{s.label}</p>
            {s.value ? (
              <p className="text-sm font-semibold text-white">{s.value}</p>
            ) : (
              <span className="text-xs" style={{ color: '#4b5563' }}>—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ExchangePage ─────────────────────────────────────────────────────────────

export default function ExchangePage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activePair, setActivePair] = useState(PAIRS[0])
  const [botSettingsOpen, setBotSettingsOpen] = useState(false)

  const ticker = useLiveTicker(activePair.base)
  const FALLBACK_PRICES: Record<string, number> = { BTC: 78356.51, ETH: 3450.00, SOL: 145.00, BNB: 580.00 }
  const midPrice = ticker?.price ?? FALLBACK_PRICES[activePair.base] ?? 100

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
  }, [isAuthenticated, navigate])

  const availableBalance = user?.balance ?? 9542.39

  const { toast, showPnl, dismiss } = usePnlToast()

  const handleBotTradeClose = useCallback((event: TradeCloseEvent) => {
    const reasonLabel =
      event.reason === 'take-profit'    ? 'Take-profit reached' :
      event.reason === 'stop-loss'      ? 'Stop-loss triggered' :
                                          'Signal reversal'
    showPnl(event.pnl, event.pnlPct, event.pair, 'bot', reasonLabel)
  }, [showPnl])

  const algoEngine = useAlgorithmEngine(midPrice, user?.id ?? 0, availableBalance, handleBotTradeClose)

  if (!isAuthenticated) return null

  return (
    <>
      {/* P&L toast — bot trades */}
      {toast && (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          pnl={toast.pnl}
          pnlPct={toast.pnlPct}
          pair={toast.pair}
          source={toast.source}
          duration={toast.duration}
          onClose={dismiss}
        />
      )}
    <DashboardLayout>
      <main
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: '#0a0720' }}
      >
        <div className="px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
          <div className="max-w-[1600px] mx-auto flex flex-col gap-3">

            {/* ── Pair selector tabs ── */}
            <div className="flex items-center gap-2 flex-wrap">
              {PAIRS.map((p) => (
                <button
                  key={p.base}
                  onClick={() => setActivePair(p)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={
                    activePair.base === p.base
                      ? { background: `${p.color}22`, border: `1px solid ${p.color}55`, color: p.color }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }
                  }
                >
                  <i className={`${p.icon} text-xs`} style={{ color: activePair.base === p.base ? p.color : '#9ca3af' }} />
                  {p.base}/USDT
                </button>
              ))}
            </div>

            {/* ── Ticker header ── */}
            <TickerHeader pair={activePair} ticker={ticker} midPrice={midPrice} onSelectPair={setActivePair} />

            {/* ── Main layout: chart + bottom panels | right panel ── */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-3">

              {/* Left: chart + order book + recent trades */}
              <div className="flex flex-col gap-3 min-w-0">

                {/* TradingView chart */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(10,7,32,0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    height: 'clamp(340px, 50vh, 520px)',
                  }}
                >
                  <TradingViewChart symbol={activePair.base} />
                </div>

                {/* Order book + Recent trades */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <OrderBookPanel base={activePair.base} midPrice={midPrice} />
                  <RecentTradesPanel base={activePair.base} midPrice={midPrice} />
                </div>
              </div>

              {/* Right: Buy/Sell panel */}
              <div className="xl:sticky xl:top-3 xl:self-start">
                <TradePanelRight
                  base={activePair.base}
                  availableBalance={availableBalance}
                  midPrice={midPrice}
                  algoEngine={algoEngine}
                  onOpenSettings={() => setBotSettingsOpen(true)}
                />
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Bot Settings Modal — rendered outside main so it overlays everything */}
      <BotSettingsModal
        open={botSettingsOpen}
        onClose={() => setBotSettingsOpen(false)}
        algoState={algoEngine.state}
        onSave={algoEngine.updateSettings}
      />
    </DashboardLayout>
    </>
  )
}
