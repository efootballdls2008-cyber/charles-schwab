import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import BuyModal, { type BuyAsset } from '../../components/dashboard/BuyModal'
import { getHoldings, type Holding } from '../../services/holdingService'

// ─── Trade analysis state (passed via location.state from History) ────────────
interface TradeAnalysisState {
  tradeId: string
  pair: string
  side: 'Buy' | 'Sell'
  entryPrice: number
  exitPrice: number
  profitLoss: number
  plPct: number
  signal: string | null
  strategy: string | null
  status: 'processing' | 'completed' | 'pending' | 'cancelled'
  executedBy: 'Trade Bot' | 'You'
  assetSymbol: string
  assetColor: string
  openedAt: string
}

// ─── Market data ──────────────────────────────────────────────────────────────

interface MarketRow {
  id: number
  rank: number
  name: string
  symbol: string
  color: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  sparkline: string
  assetType: 'crypto' | 'stock'
}

const CRYPTO_ROWS: MarketRow[] = [
  { id: 1,  rank: 1,  name: 'Bitcoin',       symbol: 'BTC',  color: '#f7931a', price: 67420.00, change24h: 3.10,  volume24h: 31000000000, marketCap: 1320000000000, sparkline: 'M0,22 C5,18 10,14 16,15 C22,16 26,20 32,18 C38,16 42,10 48,11 C54,12 58,18 64,15 C70,12 74,8 80,9',  assetType: 'crypto' },
  { id: 2,  rank: 2,  name: 'Ethereum',      symbol: 'ETH',  color: '#627eea', price: 2873.00,  change24h: 1.80,  volume24h: 14000000000, marketCap: 345000000000,  sparkline: 'M0,18 C6,16 10,20 16,18 C22,16 26,12 32,13 C38,14 42,20 48,18 C54,16 58,10 64,12 C70,14 74,18 80,16', assetType: 'crypto' },
  { id: 3,  rank: 3,  name: 'Solana',        symbol: 'SOL',  color: '#9945ff', price: 137.80,   change24h: 6.00,  volume24h: 3200000000,  marketCap: 62000000000,   sparkline: 'M0,24 C6,22 10,16 16,15 C22,14 26,20 32,18 C38,16 42,10 48,11 C54,12 58,20 64,17 C70,14 74,8 80,9',  assetType: 'crypto' },
  { id: 4,  rank: 4,  name: 'BNB',           symbol: 'BNB',  color: '#f3ba2f', price: 649.00,   change24h: 2.40,  volume24h: 1800000000,  marketCap: 94000000000,   sparkline: 'M0,20 C4,18 8,22 14,20 C20,18 24,14 30,15 C36,16 40,22 46,20 C52,18 56,12 62,14 C68,16 72,20 80,18', assetType: 'crypto' },
  { id: 5,  rank: 5,  name: 'XRP',           symbol: 'XRP',  color: '#00aae4', price: 0.5304,   change24h: 2.00,  volume24h: 1200000000,  marketCap: 29000000000,   sparkline: 'M0,16 C6,14 10,18 16,16 C22,14 26,10 32,11 C38,12 42,18 48,16 C54,14 58,8 64,10 C70,12 74,16 80,14', assetType: 'crypto' },
  { id: 6,  rank: 6,  name: 'Cardano',       symbol: 'ADA',  color: '#0033ad', price: 0.3977,   change24h: -3.00, volume24h: 620000000,   marketCap: 14000000000,   sparkline: 'M0,22 C5,20 8,15 14,14 C20,13 22,18 28,16 C34,14 36,8 42,9 C48,10 50,18 56,15 C62,12 64,7 70,8 C74,9 77,12 80,10', assetType: 'crypto' },
  { id: 7,  rank: 7,  name: 'Avalanche',     symbol: 'AVAX', color: '#e84142', price: 39.60,    change24h: 10.00, volume24h: 890000000,   marketCap: 16000000000,   sparkline: 'M0,24 C6,22 10,16 16,15 C22,14 26,20 32,18 C38,16 42,10 48,11 C54,12 58,20 64,17 C70,14 74,8 80,9',  assetType: 'crypto' },
  { id: 8,  rank: 8,  name: 'Chainlink',     symbol: 'LINK', color: '#2a5ada', price: 17.17,    change24h: 5.99,  volume24h: 540000000,   marketCap: 10000000000,   sparkline: 'M0,18 C4,16 8,20 14,18 C20,16 24,12 30,13 C36,14 40,20 46,18 C52,16 56,10 62,12 C68,14 72,18 80,16', assetType: 'crypto' },
]

const STOCK_ROWS: MarketRow[] = [
  { id: 101, rank: 1,  name: 'Apple Inc.',        symbol: 'AAPL',  color: '#a2a2a2', price: 189.30, change24h: 1.24,  volume24h: 58200000,  marketCap: 2940000000000, sparkline: 'M0,22 C5,18 10,14 16,15 C22,16 26,20 32,18 C38,16 42,10 48,11 C54,12 58,18 64,15 C70,12 74,8 80,9',  assetType: 'stock' },
  { id: 102, rank: 2,  name: 'Microsoft',          symbol: 'MSFT',  color: '#00a4ef', price: 415.20, change24h: 0.87,  volume24h: 22100000,  marketCap: 3080000000000, sparkline: 'M0,18 C6,16 10,20 16,18 C22,16 26,12 32,13 C38,14 42,20 48,18 C54,16 58,10 64,12 C70,14 74,18 80,16', assetType: 'stock' },
  { id: 103, rank: 3,  name: 'NVIDIA Corp.',       symbol: 'NVDA',  color: '#76b900', price: 875.40, change24h: 3.52,  volume24h: 41800000,  marketCap: 2160000000000, sparkline: 'M0,24 C6,22 10,16 16,15 C22,14 26,20 32,18 C38,16 42,10 48,11 C54,12 58,20 64,17 C70,14 74,8 80,9',  assetType: 'stock' },
  { id: 104, rank: 4,  name: 'Amazon',             symbol: 'AMZN',  color: '#ff9900', price: 182.60, change24h: -0.43, volume24h: 35600000,  marketCap: 1890000000000, sparkline: 'M0,20 C4,18 8,22 14,20 C20,18 24,14 30,15 C36,16 40,22 46,20 C52,18 56,12 62,14 C68,16 72,20 80,18', assetType: 'stock' },
  { id: 105, rank: 5,  name: 'Alphabet Inc.',      symbol: 'GOOGL', color: '#4285f4', price: 172.80, change24h: 1.10,  volume24h: 24300000,  marketCap: 2140000000000, sparkline: 'M0,16 C6,14 10,18 16,16 C22,14 26,10 32,11 C38,12 42,18 48,16 C54,14 58,8 64,10 C70,12 74,16 80,14', assetType: 'stock' },
  { id: 106, rank: 6,  name: 'Meta Platforms',     symbol: 'META',  color: '#0081fb', price: 492.10, change24h: 2.30,  volume24h: 18700000,  marketCap: 1250000000000, sparkline: 'M0,22 C5,20 8,15 14,14 C20,13 22,18 28,16 C34,14 36,8 42,9 C48,10 50,18 56,15 C62,12 64,7 70,8 C74,9 77,12 80,10', assetType: 'stock' },
  { id: 107, rank: 7,  name: 'Tesla Inc.',         symbol: 'TSLA',  color: '#cc0000', price: 177.90, change24h: -1.85, volume24h: 92400000,  marketCap: 566000000000,  sparkline: 'M0,18 C4,16 8,20 14,18 C20,16 24,12 30,13 C36,14 40,20 46,18 C52,16 56,10 62,12 C68,14 72,18 80,16', assetType: 'stock' },
  { id: 108, rank: 8,  name: 'JPMorgan Chase',     symbol: 'JPM',   color: '#005eb8', price: 196.40, change24h: 0.72,  volume24h: 9800000,   marketCap: 567000000000,  sparkline: 'M0,22 C5,20 8,15 14,14 C20,13 22,18 28,16 C34,14 36,8 42,9 C48,10 50,18 56,15 C62,12 64,7 70,8 C74,9 77,12 80,10', assetType: 'stock' },
]

type TabKey = 'crypto' | 'stocks'

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ path, positive }: { path: string; positive: boolean }) {
  const color = positive ? '#4ade80' : '#f87171'
  return (
    <svg viewBox="0 0 80 30" width="64" height="24" aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// ─── Holdings panel ───────────────────────────────────────────────────────────
function HoldingsPanel({ holdings, loading }: { holdings: Holding[]; loading: boolean }) {
  const totalValue = holdings.reduce((s, h) => s + h.quantity * h.currentPrice, 0)
  const totalCost  = holdings.reduce((s, h) => s + h.quantity * h.avgBuyPrice, 0)
  const totalPnl   = totalValue - totalCost
  const pnlPct     = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div>
          <h3 className="text-sm font-bold text-white">My Portfolio</h3>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Holdings & P&L</p>
        </div>
        {!loading && holdings.length > 0 && (
          <div className="text-right">
            <p className="text-sm font-bold text-white">{fmt(totalValue)}</p>
            <p
              className="text-xs font-semibold"
              style={{ color: totalPnl >= 0 ? '#4ade80' : '#f87171' }}
            >
              {totalPnl >= 0 ? '+' : ''}{fmt(totalPnl)} ({pnlPct.toFixed(2)}%)
            </p>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
            <i className="fas fa-spinner fa-spin mr-2" />
            Loading…
          </div>
        ) : holdings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <i className="fas fa-briefcase text-2xl" style={{ color: '#374151' }} />
            <p className="text-sm text-gray-500">No holdings yet</p>
            <p className="text-xs text-gray-600">Buy an asset to get started</p>
          </div>
        ) : (
          holdings.map((h) => {
            const value = h.quantity * h.currentPrice
            const pnl   = (h.currentPrice - h.avgBuyPrice) * h.quantity
            const pct   = ((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100
            const isUp  = pnl >= 0
            return (
              <div key={h.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${h.color}22`, border: `1px solid ${h.color}44`, color: h.color }}
                >
                  {h.symbol.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-white truncate">{h.name}</p>
                    <p className="text-xs font-bold text-white ml-2">{fmt(value)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      {h.quantity} {h.symbol}
                    </p>
                    <p
                      className="text-xs font-semibold ml-2"
                      style={{ color: isUp ? '#4ade80' : '#f87171' }}
                    >
                      {isUp ? '+' : ''}{fmt(pnl)} ({pct.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Trade Analysis Panel ─────────────────────────────────────────────────────
function TradeAnalysisPanel({ trade, onClose }: { trade: TradeAnalysisState; onClose: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  // Build TradingView embed URL
  const tvSymbol = trade.pair.replace('/', '')  // "BTC/USDT" → "BTCUSDT"
  const tvUrl = `https://www.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=BINANCE:${tvSymbol}&interval=60&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=0d0824&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart&utm_term=BINANCE:${tvSymbol}`

  const isProcessing = trade.status === 'processing'
  const isProfit = trade.profitLoss >= 0

  return (
    <motion.div
      className="xl:w-96 flex-shrink-0 flex flex-col gap-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div
        className="rounded-2xl p-4 flex items-center justify-between"
        style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <h3 className="text-sm font-bold text-white">Trade Analysis</h3>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
            {trade.executedBy} · {trade.openedAt}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
          style={{ color: '#6b7280' }}
        >
          <i className="fas fa-times text-sm" />
        </button>
      </div>

      {/* TradingView Chart */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.08)', height: '400px' }}
      >
        <iframe
          ref={iframeRef}
          src={tvUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={`${trade.pair} Chart`}
        />
      </div>

      {/* Trade Summary */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: isProcessing ? 'rgba(139,92,246,0.08)' : 'rgba(22,15,53,0.9)',
          border: isProcessing ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: `${trade.assetColor}22`, border: `1px solid ${trade.assetColor}44`, color: trade.assetColor }}
            >
              {trade.assetSymbol.slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{trade.pair}</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>{trade.strategy ?? 'Manual Trade'}</p>
            </div>
          </div>
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase"
            style={{
              background: trade.side === 'Buy' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
              color: trade.side === 'Buy' ? '#4ade80' : '#f87171',
            }}
          >
            {trade.side === 'Buy' ? 'Long' : 'Short'}
          </span>
        </div>

        {/* Price Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs mb-1" style={{ color: '#6b7280' }}>Entry Price</p>
            <p className="text-sm font-bold text-white">${trade.entryPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#6b7280' }}>
              {isProcessing ? 'Current Price' : 'Exit Price'}
            </p>
            <p className="text-sm font-bold text-white">
              {isProcessing ? '—' : `$${trade.exitPrice.toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* P&L */}
        {!isProcessing && (
          <div
            className="rounded-xl p-3"
            style={{
              background: isProfit ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
              border: `1px solid ${isProfit ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>Profit & Loss</p>
                <p className="text-lg font-bold" style={{ color: isProfit ? '#4ade80' : '#f87171' }}>
                  {isProfit ? '+' : ''}${trade.profitLoss.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>Return</p>
                <p className="text-lg font-bold" style={{ color: isProfit ? '#4ade80' : '#f87171' }}>
                  {isProfit ? '+' : ''}{trade.plPct.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#6b7280' }}>Status</span>
            {isProcessing ? (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#a78bfa' }} />
                Processing
              </span>
            ) : (
              <span
                className="px-2 py-0.5 rounded text-xs font-semibold"
                style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}
              >
                Completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Signal Info (bot trades only) */}
      {trade.signal && (
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: '#9ca3af' }}>Signal Reason</p>
          <p className="text-xs leading-relaxed" style={{ color: '#d1d5db' }}>
            {trade.signal}
          </p>
        </div>
      )}
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TradePage() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [tab, setTab] = useState<TabKey>('crypto')
  const [search, setSearch] = useState('')
  const [buyAsset, setBuyAsset] = useState<BuyAsset | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [holdingsLoading, setHoldingsLoading] = useState(true)

  // Trade analysis panel — populated when navigating from History
  const [analysisState, setAnalysisState] = useState<TradeAnalysisState | null>(
    (location.state as TradeAnalysisState | null) ?? null
  )

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
  }, [isAuthenticated, navigate])

  const loadHoldings = useCallback(async () => {
    if (!user?.id) return
    setHoldingsLoading(true)
    try {
      const data = await getHoldings(user.id)
      setHoldings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setHoldingsLoading(false)
    }
  }, [user?.id])

  useEffect(() => { loadHoldings() }, [loadHoldings])

  if (!isAuthenticated) return null

  const activeRows = tab === 'crypto' ? CRYPTO_ROWS : STOCK_ROWS

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return activeRows
    return activeRows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.symbol.toLowerCase().includes(q)
    )
  }, [activeRows, search])

  const accentColor = tab === 'crypto' ? '#f59e0b' : '#60a5fa'
  const accentBg    = tab === 'crypto' ? 'rgba(245,158,11,0.12)' : 'rgba(96,165,250,0.12)'
  const accentBorder = tab === 'crypto' ? 'rgba(245,158,11,0.3)' : 'rgba(96,165,250,0.3)'

  return (
    <DashboardLayout>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ backgroundColor: '#110b2d' }}>

        {/* Buy Modal */}
        {buyAsset && (
          <BuyModal
            asset={buyAsset}
            onClose={() => setBuyAsset(null)}
            onSuccess={() => { setBuyAsset(null); loadHoldings() }}
          />
        )}

        {/* ── Page header ── */}
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-white">Trade</h1>
            <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
              {analysisState
                ? `Viewing analysis for ${analysisState.pair} · ${analysisState.strategy ?? 'Manual'}`
                : 'Buy stocks and cryptocurrencies instantly.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {analysisState && (
              <button
                onClick={() => setAnalysisState(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <i className="fas fa-times text-xs" />
                Close Analysis
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
              <span className="text-xs text-gray-400">Live prices</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-5">

          {/* ── Left: market table ── */}
          <div className="flex-1 min-w-0">

            {/* Tab toggle */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="relative flex items-center p-1 rounded-xl"
                style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div
                  className="absolute top-1 bottom-1 rounded-lg transition-all duration-300"
                  style={{
                    width: 'calc(50% - 4px)',
                    left: tab === 'crypto' ? '4px' : 'calc(50%)',
                    background: 'linear-gradient(135deg,#a28539,#c9a84c)',
                  }}
                />
                <button
                  onClick={() => { setTab('crypto'); setSearch('') }}
                  className="relative z-10 flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{ color: tab === 'crypto' ? '#0d0824' : '#9ca3af' }}
                >
                  <i className="fas fa-coins text-xs" />
                  Crypto
                </button>
                <button
                  onClick={() => { setTab('stocks'); setSearch('') }}
                  className="relative z-10 flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{ color: tab === 'stocks' ? '#0d0824' : '#9ca3af' }}
                >
                  <i className="fas fa-chart-bar text-xs" />
                  Stocks
                </button>
              </div>

              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#6b7280' }} />
                <input
                  type="text"
                  placeholder={tab === 'crypto' ? 'Search coin…' : 'Search stock…'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm text-gray-300 rounded-xl outline-none"
                  style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>

            {/* Table */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['#', tab === 'crypto' ? 'Coin' : 'Stock', 'Price', '24h Change', 'Volume', 'Chart', ''].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                          style={{ color: '#6b7280' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
                          No results found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((row, i) => {
                        const isPositive = row.change24h >= 0
                        return (
                          <motion.tr
                            key={row.id}
                            className="transition-colors hover:bg-white/[0.03]"
                            style={{
                              borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: i * 0.03 }}
                          >
                            {/* Rank */}
                            <td className="px-4 py-3.5 text-xs text-gray-500">#{row.rank}</td>

                            {/* Asset */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                  style={{ background: `${row.color}22`, border: `1.5px solid ${row.color}55`, color: row.color }}
                                >
                                  {row.symbol.slice(0, 2)}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white leading-none">{row.name}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{row.symbol}</p>
                                </div>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-4 py-3.5">
                              <span className="text-sm font-bold text-white">
                                ${row.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: row.price < 1 ? 4 : 2 })}
                              </span>
                            </td>

                            {/* Change */}
                            <td className="px-4 py-3.5">
                              <span
                                className="inline-flex items-center gap-1 text-sm font-semibold"
                                style={{ color: isPositive ? '#4ade80' : '#f87171' }}
                              >
                                <i className={`fas fa-caret-${isPositive ? 'up' : 'down'} text-xs`} />
                                {Math.abs(row.change24h).toFixed(2)}%
                              </span>
                            </td>

                            {/* Volume */}
                            <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                              ${(row.volume24h / 1e9).toFixed(1)}B
                            </td>

                            {/* Sparkline */}
                            <td className="px-4 py-3.5">
                              <Sparkline path={row.sparkline} positive={isPositive} />
                            </td>

                            {/* Buy button */}
                            <td className="px-4 py-3.5">
                              <button
                                onClick={() => setBuyAsset({
                                  type: row.assetType,
                                  symbol: row.symbol,
                                  name: row.name,
                                  color: row.color,
                                  price: row.price,
                                  change24h: row.change24h,
                                })}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 whitespace-nowrap"
                                style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}
                              >
                                <i className="fas fa-plus text-xs" />
                                Buy
                              </button>
                            </td>
                          </motion.tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-xs text-gray-500">
                  Showing <span className="text-white font-medium">{filtered.length}</span> of{' '}
                  <span className="text-white font-medium">{activeRows.length}</span>{' '}
                  {tab === 'crypto' ? 'coins' : 'stocks'}
                </p>
                <p className="text-xs text-gray-600">Prices update every 30s</p>
              </div>
            </div>
          </div>

          {/* ── Right: analysis panel or holdings ── */}
          <AnimatePresence mode="wait">
            {analysisState ? (
              <TradeAnalysisPanel
                key="analysis"
                trade={analysisState}
                onClose={() => setAnalysisState(null)}
              />
            ) : (
              <motion.div
                key="holdings"
                className="xl:w-72 flex-shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <HoldingsPanel holdings={holdings} loading={holdingsLoading} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </DashboardLayout>
  )
}
