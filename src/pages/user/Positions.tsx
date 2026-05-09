import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLiveTicker } from '../../hooks/useLiveTicker'
import { get, patch, put } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import type { BotTrade } from '../../hooks/useAlgorithmEngine'
import type { Holding } from '../../services/holdingService'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import PositionDetailsModal from '../../components/dashboard/PositionDetailsModal'
import type { PositionDetails } from '../../components/dashboard/PositionDetailsModal'

// ─── Constants ────────────────────────────────────────────────────────────────

const SUPPORTED_CRYPTO_BASES = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'MATIC', 'LINK', 'AVAX', 'DOT']
const SUPPORTED_STOCK_BASES  = ['AAPL', 'TSLA', 'AMZN', 'MSFT', 'GOOGL', 'META', 'NVDA']
const SUPPORTED_BASES = [...SUPPORTED_CRYPTO_BASES, ...SUPPORTED_STOCK_BASES]

// Simulated stock base prices (mirrors useStockQuotes in useLiveMarket)
const STOCK_BASE_PRICES: Record<string, number> = {
  AAPL: 193.42, TSLA: 248.75, AMZN: 187.35, MSFT: 417.20,
  GOOGL: 175.50, META: 512.30, NVDA: 875.40,
}

const COIN_COLOR: Record<string, string> = {
  BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', BNB: '#f3ba2f',
  XRP: '#00aae4', ADA: '#0033ad', MATIC: '#8247e5', LINK: '#2a5ada',
  AVAX: '#e84142', DOT: '#e6007a', AAPL: '#a2a2a2', MSFT: '#00a4ef',
}

// ─── Unified position row ─────────────────────────────────────────────────────

type PositionSource = 'bot' | 'user'

interface Position {
  id: string
  source: PositionSource
  pair: string          // "BTC/USDT"
  base: string          // "BTC"
  side: 'buy' | 'sell'
  entryPrice: number
  amount: number
  openedAt: string
  status: 'open' | 'closed'
  // bot extras
  strategy?: string
  signal?: string
  finalPnl?: number | null
  pnl?: number
  pnlPct?: number
  remainingSeconds?: number | null
  // user holding extras
  holdingName?: string
  holdingType?: 'stock' | 'crypto'
}

// ─── Hidden ticker feed ───────────────────────────────────────────────────────

/** Crypto feed — uses Binance WebSocket / REST */
function CryptoTickerFeed({ base, onPrice }: { base: string; onPrice: (base: string, price: number) => void }) {
  const ticker = useLiveTicker(base)
  const cbRef = useRef(onPrice)
  useEffect(() => { cbRef.current = onPrice }, [onPrice])
  useEffect(() => {
    if (ticker?.price) cbRef.current(base, ticker.price)
  }, [base, ticker?.price])
  return null
}

/** Stock feed — simulates live ticks from a base price */
function StockTickerFeed({ base, onPrice }: { base: string; onPrice: (base: string, price: number) => void }) {
  const cbRef = useRef(onPrice)
  useEffect(() => { cbRef.current = onPrice }, [onPrice])

  useEffect(() => {
    const basePrice = STOCK_BASE_PRICES[base] ?? 100
    // Emit an initial price immediately
    let current = basePrice
    cbRef.current(base, current)

    const id = setInterval(() => {
      const tick = (Math.random() - 0.48) * (current * 0.001) // ±0.1% tick
      current = parseFloat((current + tick).toFixed(2))
      cbRef.current(base, current)
    }, 3000)
    return () => clearInterval(id)
  }, [base])

  return null
}

function TickerFeed({ base, onPrice }: { base: string; onPrice: (base: string, price: number) => void }) {
  if (SUPPORTED_STOCK_BASES.includes(base)) {
    return <StockTickerFeed base={base} onPrice={onPrice} />
  }
  return <CryptoTickerFeed base={base} onPrice={onPrice} />
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: PositionSource }) {
  return source === 'bot' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
      style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
      <i className="fas fa-robot text-xs" /> Bot
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
      style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
      <i className="fas fa-user text-xs" /> Manual
    </span>
  )
}

function SideBadge({ side }: { side: 'buy' | 'sell' }) {
  return (
    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase"
      style={{ color: side === 'buy' ? '#4ade80' : '#f87171', background: side === 'buy' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)' }}>
      {side}
    </span>
  )
}

function CoinIcon({ base }: { base: string }) {
  const color = COIN_COLOR[base] ?? '#9ca3af'
  const iconMap: Record<string, string> = { BTC: 'fab fa-bitcoin', ETH: 'fab fa-ethereum' }
  const icon = iconMap[base]
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}22`, border: `1.5px solid ${color}55` }}>
      {icon
        ? <i className={`${icon} text-sm`} style={{ color }} />
        : <span className="text-xs font-bold" style={{ color }}>{base.slice(0, 2)}</span>}
    </div>
  )
}

function LivePriceCell({ price }: { price: number | null }) {
  const prevRef = useRef<number | null>(null)
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (price === null) return
    if (prevRef.current !== null && prevRef.current !== price) {
      setFlash(price > prevRef.current ? 'up' : 'down')
      const t = setTimeout(() => setFlash(null), 700)
      return () => clearTimeout(t)
    }
    prevRef.current = price
  }, [price])

  useEffect(() => { prevRef.current = price }, [price])

  if (!price) return <span className="text-xs text-gray-500 animate-pulse">fetching…</span>
  return (
    <span className="text-sm font-semibold transition-colors duration-500"
      style={{ color: flash === 'up' ? '#4ade80' : flash === 'down' ? '#f87171' : '#fff' }}>
      ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  )
}

function PnlCell({ position, currentPrice }: { position: Position; currentPrice: number | null }) {
  // For open bot trades: show fluctuating simulated P&L (not real calculated value)
  const [simulatedPnl, setSimulatedPnl] = useState<number | null>(null)
  const [simulatedPct, setSimulatedPct] = useState<number | null>(null)

  useEffect(() => {
    if (position.source !== 'bot' || position.status !== 'open') return
    // Start with a small random seed
    const seed = (Math.random() - 0.5) * position.amount * (position.entryPrice * 0.002)
    setSimulatedPnl(parseFloat(seed.toFixed(2)))
    setSimulatedPct(parseFloat(((seed / (position.entryPrice * position.amount)) * 100).toFixed(2)))

    const id = setInterval(() => {
      setSimulatedPnl(prev => {
        const drift = (Math.random() - 0.48) * position.amount * (position.entryPrice * 0.001)
        const next = parseFloat(((prev ?? 0) + drift).toFixed(2))
        setSimulatedPct(parseFloat(((next / (position.entryPrice * position.amount)) * 100).toFixed(2)))
        return next
      })
    }, 2500)
    return () => clearInterval(id)
  }, [position.id, position.source, position.status, position.entryPrice, position.amount])

  // Closed bot trade: show final P&L
  if (position.source === 'bot' && position.status === 'closed') {
    const pnl = position.finalPnl ?? position.pnl ?? 0
    const pct = position.pnlPct ?? 0
    const isProfit = pnl >= 0
    const color = isProfit ? '#4ade80' : '#f87171'
    return (
      <div>
        <p className="text-sm font-bold" style={{ color }}>
          {isProfit ? '+' : ''}${Math.abs(pnl).toFixed(2)}
        </p>
        <p className="text-xs font-medium" style={{ color }}>
          {isProfit ? '+' : ''}{pct.toFixed(2)}%
        </p>
      </div>
    )
  }

  // Open bot trade: show fluctuating simulated value
  if (position.source === 'bot' && position.status === 'open') {
    if (simulatedPnl === null) return <span className="text-xs text-gray-500 animate-pulse">calculating…</span>
    const isProfit = simulatedPnl >= 0
    const color = isProfit ? '#4ade80' : '#f87171'
    return (
      <div>
        <p className="text-sm font-bold animate-pulse" style={{ color }}>
          {isProfit ? '+' : ''}${Math.abs(simulatedPnl).toFixed(2)}
        </p>
        <p className="text-xs font-medium" style={{ color }}>
          {isProfit ? '+' : ''}{Math.abs(simulatedPct ?? 0).toFixed(2)}%
        </p>
      </div>
    )
  }

  // Manual holdings: use real live price
  if (!currentPrice) return <span className="text-xs text-gray-500">—</span>
  const pnl = position.side === 'buy'
    ? (currentPrice - position.entryPrice) * position.amount
    : (position.entryPrice - currentPrice) * position.amount
  const pnlPct = position.side === 'buy'
    ? ((currentPrice - position.entryPrice) / position.entryPrice) * 100
    : ((position.entryPrice - currentPrice) / position.entryPrice) * 100
  const isProfit = pnl >= 0
  const color = isProfit ? '#4ade80' : '#f87171'
  return (
    <div>
      <p className="text-sm font-bold" style={{ color }}>
        {isProfit ? '+' : ''}${Math.abs(pnl).toFixed(2)}
      </p>
      <p className="text-xs font-medium" style={{ color }}>
        {isProfit ? '+' : ''}{pnlPct.toFixed(2)}%
      </p>
    </div>
  )
}

function StatCard({ label, value, sub, color, icon }: {
  label: string; value: string; sub?: string; color: string; icon: string
}) {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-4"
      style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <i className={`${icon} text-sm`} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-base font-bold text-white">{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color }}>{sub}</p>}
      </div>
    </div>
  )
}

// ─── Time Left Cell ───────────────────────────────────────────────────────────

function TimeLeftCell({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
    if (seconds <= 0) return
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(id); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [seconds])

  if (remaining <= 0) {
    return <span className="text-xs font-semibold animate-pulse" style={{ color: '#f59e0b' }}>Closing…</span>
  }

  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60
  const display = h > 0
    ? `${h}h ${m}m`
    : m > 0
    ? `${m}m ${s}s`
    : `${s}s`

  const urgentColor = remaining < 60 ? '#f87171' : remaining < 300 ? '#f59e0b' : '#4ade80'

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: urgentColor }} />
      <span className="text-xs font-semibold font-mono" style={{ color: urgentColor }}>{display}</span>
    </div>
  )
}

function EmptyState() {
  const navigate = useNavigate()
  return (
    <tr>
      <td colSpan={11}>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <i className="fas fa-chart-area text-2xl" style={{ color: '#4ade80', opacity: 0.5 }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">No open positions</p>
            <p className="text-xs text-gray-500 mt-1">
              Start the AI bot on the Exchange page, or buy assets from the Crypto page.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/user/exchange')}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
              <i className="fas fa-robot mr-1.5" /> Start AI Bot
            </button>
            <button onClick={() => navigate('/user/crypto')}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
              <i className="fas fa-shopping-cart mr-1.5" /> Buy Assets
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Positions() {
  const { user } = useAuth()

  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})
  const [filter, setFilter] = useState<'all' | 'bot' | 'user'>('all')
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [selectedPosition, setSelectedPosition] = useState<PositionDetails | null>(null)
  const [closingId, setClosingId] = useState<string | null>(null)

  // ── Load real positions ─────────────────────────────────────────────────────
  const loadPositions = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [botTrades, holdings] = await Promise.all([
        // Bot: open trades persisted to db
        get<BotTrade[]>(ENDPOINTS.botTrades(user.id)).catch((error) => {
          console.error('Failed to load bot trades:', error)
          return [] as BotTrade[]
        }),
        // User: holdings bought via BuyModal
        get<Holding[]>(ENDPOINTS.holdings(user.id)).catch((error) => {
          console.error('Failed to load holdings:', error)
          return [] as Holding[]
        }),
      ])

      const rows: Position[] = []

      // ── Bot open trades ──────────────────────────────────────────────────
      for (const t of botTrades) {
        if (t.status !== 'open') continue
        const base = t.pair.split('/')[0] ?? 'BTC'
        rows.push({
          id: t.id,
          source: 'bot',
          pair: t.pair,
          base,
          side: t.side,
          entryPrice: t.entryPrice,
          amount: t.amount,
          openedAt: t.openedAt,
          status: t.status,
          strategy: t.strategy,
          signal: t.signal,
          finalPnl: t.finalPnl ?? null,
          pnl: t.pnl,
          pnlPct: t.pnlPct,
          remainingSeconds: t.remainingSeconds ?? null,
        })
      }

      // ── User holdings (bought assets) ────────────────────────────────────
      // Each holding is a long position: user bought at avgBuyPrice
      for (const h of holdings) {
        if (h.quantity <= 0) continue
        const base = h.symbol.toUpperCase()
        rows.push({
          id: `holding-${h.id}`,
          source: 'user',
          pair: `${base}/USD`,
          base,
          side: 'buy',                    // holdings are always long (bought)
          entryPrice: h.avgBuyPrice,
          amount: h.quantity,
          openedAt: '—',
          status: 'open',
          holdingName: h.name,
          holdingType: h.type,
        })
      }

      setPositions(rows)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error loading positions:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { loadPositions() }, [loadPositions])

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const id = setInterval(loadPositions, 15_000)
    return () => clearInterval(id)
  }, [loadPositions])

  // ── Live price callback ─────────────────────────────────────────────────────
  const handlePrice = useCallback((base: string, price: number) => {
    setLivePrices((prev) => prev[base] === price ? prev : { ...prev, [base]: price })
  }, [])

  // ── Open position detail modal ──────────────────────────────────────────────
  const openPositionModal = useCallback((pos: Position) => {
    const cp = livePrices[pos.base] ?? null
    setSelectedPosition({
      id: pos.id,
      source: pos.source,
      pair: pos.pair,
      base: pos.base,
      side: pos.side,
      entryPrice: pos.entryPrice,
      currentPrice: cp,
      amount: pos.amount,
      openedAt: pos.openedAt,
      strategy: pos.strategy,
      signal: pos.signal,
      holdingName: pos.holdingName,
      holdingType: pos.holdingType,
    })
  }, [livePrices])

  // ── Close a position ────────────────────────────────────────────────────────
  const closePosition = useCallback(async (e: React.MouseEvent, pos: Position) => {
    e.stopPropagation()
    if (closingId) return
    setClosingId(pos.id)
    try {
      if (pos.source === 'bot') {
        // Mark bot trade as closed — pass current P&L so the backend can credit balance
        const cp = livePrices[pos.base] ?? pos.entryPrice
        const pnl = pos.side === 'buy'
          ? parseFloat(((cp - pos.entryPrice) * pos.amount).toFixed(2))
          : parseFloat(((pos.entryPrice - cp) * pos.amount).toFixed(2))
        const pnlPct = pos.side === 'buy'
          ? parseFloat((((cp - pos.entryPrice) / pos.entryPrice) * 100).toFixed(2))
          : parseFloat((((pos.entryPrice - cp) / pos.entryPrice) * 100).toFixed(2))
        await patch(ENDPOINTS.botTradeById(pos.id), {
          status: 'closed',
          exitPrice: cp,
          pnl,
          pnlPct,
          finalPnl: pnl,
          closedAt: new Date().toISOString(),
          closeReason: 'manual',
        })
      } else {
        // For user holdings: id is "holding-<numericId>"
        const numericId = parseInt(pos.id.replace('holding-', ''), 10)
        const holdings = await get<{ id: number; quantity: number }[]>(ENDPOINTS.holdings(user!.id))
        const holding = holdings.find((h) => h.id === numericId)
        if (holding) {
          await put(ENDPOINTS.holdingById(numericId), { ...holding, quantity: 0 })
        }
      }
      // Refresh positions after close
      await loadPositions()
    } catch (err) {
      console.error('Failed to close position:', err)
    } finally {
      setClosingId(null)
    }
  }, [closingId, user, loadPositions])

  // ── Derived ─────────────────────────────────────────────────────────────────
  const filtered = filter === 'all' ? positions : positions.filter((p) => p.source === filter)

  const uniqueBases = [...new Set(
    positions.map((p) => p.base).filter((b) => SUPPORTED_BASES.includes(b))
  )]

  let totalUnrealizedPnl = 0
  let profitCount = 0
  let lossCount = 0
  for (const p of positions) {
    const cp = livePrices[p.base]
    if (!cp) continue
    const pnl = p.side === 'buy'
      ? (cp - p.entryPrice) * p.amount
      : (p.entryPrice - cp) * p.amount
    totalUnrealizedPnl += pnl
    if (pnl >= 0) profitCount++; else lossCount++
  }

  const botCount  = positions.filter((p) => p.source === 'bot').length
  const userCount = positions.filter((p) => p.source === 'user').length

  return (
    <>
      <DashboardLayout>
        {/* Hidden live price feeds */}
        {uniqueBases.map((base) => (
          <TickerFeed key={base} base={base} onPrice={handlePrice} />
        ))}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ backgroundColor: '#110b2d' }}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ background: '#4ade80' }} />
              Open Positions
            </h1>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              Live unrealized P&amp;L · auto-refreshes every 15s ·{' '}
              last updated {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
          <button onClick={loadPositions} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
            <i className={`fas fa-sync-alt text-xs ${loading ? 'fa-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total Positions" icon="fas fa-layer-group" color="#4ade80"
            value={String(positions.length)}
            sub={`${botCount} bot · ${userCount} manual`}
          />
          <StatCard
            label="Unrealized P&L" color={totalUnrealizedPnl >= 0 ? '#4ade80' : '#f87171'}
            icon={totalUnrealizedPnl >= 0 ? 'fas fa-arrow-trend-up' : 'fas fa-arrow-trend-down'}
            value={`${totalUnrealizedPnl >= 0 ? '+' : ''}$${Math.abs(totalUnrealizedPnl).toFixed(2)}`}
            sub={totalUnrealizedPnl >= 0 ? 'In profit' : 'In loss'}
          />
          <StatCard
            label="In Profit" icon="fas fa-check-circle" color="#4ade80"
            value={String(profitCount)} sub="positions in green"
          />
          <StatCard
            label="In Loss" icon="fas fa-exclamation-circle" color="#f87171"
            value={String(lossCount)} sub="positions in red"
          />
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex items-center gap-1 mb-4 p-1 rounded-xl w-fit"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {(['all', 'bot', 'user'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={filter === f ? { background: 'rgba(74,222,128,0.12)', color: '#fff' } : { color: '#6b7280' }}>
              {f === 'all' ? 'All' : f === 'bot' ? '🤖 Bot' : '👤 Manual'}
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#9ca3af', fontSize: '10px' }}>
                {f === 'all' ? positions.length : f === 'bot' ? botCount : userCount}
              </span>
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {[
                    'Source', 'Asset', 'Side', 'Entry Price',
                    'Current Price', 'Size', 'Est. P&L', 'Time Left', 'Opened', 'Info', 'Action',
                  ].map((col) => (
                    <th key={col}
                      className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                      style={{ color: '#6b7280' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="text-center py-14 text-gray-500">
                      <i className="fas fa-spinner fa-spin mr-2" />Loading positions…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <EmptyState />
                ) : (
                  filtered.map((pos, i) => {
                    const cp = livePrices[pos.base] ?? null
                    const rowPnl = cp
                      ? pos.side === 'buy'
                        ? (cp - pos.entryPrice) * pos.amount
                        : (pos.entryPrice - cp) * pos.amount
                      : null
                    const isLast = i === filtered.length - 1

                    return (
                      <tr key={pos.id}
                        onClick={() => openPositionModal(pos)}
                        className="transition-all hover:bg-white/[0.06] cursor-pointer group"
                        style={{
                          borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                          borderLeft: rowPnl === null
                            ? '3px solid transparent'
                            : rowPnl >= 0
                            ? '3px solid rgba(74,222,128,0.5)'
                            : '3px solid rgba(248,113,113,0.5)',
                        }}>

                        {/* Source */}
                        <td className="px-4 py-3.5">
                          <SourceBadge source={pos.source} />
                        </td>

                        {/* Asset */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <CoinIcon base={pos.base} />
                            <div>
                              <p className="text-sm font-semibold text-white">{pos.pair}</p>
                              {pos.holdingName && (
                                <p className="text-xs text-gray-500">{pos.holdingName}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Side */}
                        <td className="px-4 py-3.5">
                          <SideBadge side={pos.side} />
                        </td>

                        {/* Entry Price */}
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-white">
                            ${pos.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Current Price — live */}
                        <td className="px-4 py-3.5">
                          <LivePriceCell price={cp} />
                        </td>

                        {/* Size */}
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-white">{pos.amount}</p>
                          <p className="text-xs text-gray-500">{pos.base}</p>
                        </td>

                        {/* Unrealized P&L */}
                        <td className="px-4 py-3.5">
                          <PnlCell position={pos} currentPrice={cp} />
                        </td>

                        {/* Time Left — only for bot trades */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {pos.source === 'bot' && pos.remainingSeconds !== null && pos.remainingSeconds !== undefined ? (
                            <TimeLeftCell seconds={pos.remainingSeconds} />
                          ) : (
                            <span className="text-xs text-gray-600">—</span>
                          )}
                        </td>

                        {/* Opened */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {pos.openedAt === '—' ? (
                            <span className="text-xs text-gray-500">—</span>
                          ) : (
                            <>
                              <p className="text-xs text-white">
                                {new Date(pos.openedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(pos.openedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </>
                          )}
                        </td>

                        {/* Info */}
                        <td className="px-4 py-3.5 max-w-[200px]">
                          <div className="flex items-center justify-between gap-2">
                            {pos.source === 'bot' ? (
                              <div className="min-w-0">
                                <p className="text-xs font-semibold truncate" style={{ color: '#a78bfa' }}>
                                  {pos.strategy}
                                </p>
                                {pos.signal && (
                                  <p className="text-xs text-gray-500 truncate mt-0.5" title={pos.signal}>
                                    {pos.signal.length > 50 ? pos.signal.slice(0, 50) + '…' : pos.signal}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-md"
                                style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>
                                {pos.holdingType === 'stock' ? '📈 Stock' : '🪙 Crypto'}
                              </span>
                            )}
                            <i className="fas fa-chevron-right text-xs flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: '#4ade80' }} />
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => closePosition(e, pos)}
                            disabled={closingId === pos.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                            style={{
                              background: 'rgba(248,113,113,0.12)',
                              color: '#f87171',
                              border: '1px solid rgba(248,113,113,0.25)',
                            }}>
                            {closingId === pos.id
                              ? <><i className="fas fa-spinner fa-spin text-xs" /> Closing…</>
                              : <><i className="fas fa-times-circle text-xs" /> Close</>}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 flex-wrap gap-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs" style={{ color: '#6b7280' }}>
                <span className="text-white font-medium">{filtered.length}</span> open position{filtered.length !== 1 ? 's' : ''}
                {filter !== 'all' && <span> · filtered by <span className="text-white">{filter}</span></span>}
                <span className="ml-2 opacity-60">· click any row to view details</span>
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
                <span className="text-xs" style={{ color: '#4ade80' }}>Prices updating live via Binance</span>
              </div>
            </div>
          )}
        </div>

        {/* Source legend */}
        <div className="flex items-center gap-6 mt-4 px-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
              style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
              <i className="fas fa-robot text-xs" /> Bot
            </span>
            <span className="text-xs text-gray-500">Trades opened by the AI bot on the Exchange page</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
              style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
              <i className="fas fa-user text-xs" /> Manual
            </span>
            <span className="text-xs text-gray-500">Assets you bought from the Crypto page</span>
          </div>
        </div>

        </main>
      </DashboardLayout>

      {/* Position Details Modal */}
      {selectedPosition && (
        <PositionDetailsModal
          position={selectedPosition}
          onClose={() => setSelectedPosition(null)}
        />
      )}
    </>
  )
}
