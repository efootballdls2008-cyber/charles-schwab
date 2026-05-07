import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveMarket, useStockQuotes } from '../../hooks/useLiveMarket'

const TABS = ['Stocks', 'Cryptocurrency', 'Indices'] as const
type Tab = (typeof TABS)[number]

const STOCK_LOGOS: Record<string, string> = {
  AAPL: 'https://img.logo.dev/apple.com?token=pk_X-1ZO13GSgeOoUrIuJ6BeQ',
  TSLA: 'https://img.logo.dev/tesla.com?token=pk_X-1ZO13GSgeOoUrIuJ6BeQ',
  AMZN: 'https://img.logo.dev/amazon.com?token=pk_X-1ZO13GSgeOoUrIuJ6BeQ',
  MSFT: 'https://img.logo.dev/microsoft.com?token=pk_X-1ZO13GSgeOoUrIuJ6BeQ',
}

const INDEX_LOGOS: Record<string, string> = {
  SPX: 'https://img.logo.dev/spglobal.com?token=pk_X-1ZO13GSgeOoUrIuJ6BeQ',
  NDX: 'https://img.logo.dev/nasdaq.com?token=pk_X-1ZO13GSgeOoUrIuJ6BeQ',
  DJI: 'https://img.logo.dev/dowjones.com?token=pk_X-1ZO13GSgeOoUrIuJ6BeQ',
  RUT: 'https://img.logo.dev/ftserussell.com?token=pk_X-1ZO13GSgeOoUrIuJ6BeQ',
}

// ─── Convert number array → smooth SVG cubic-bezier path ─────────────────────
function arrayToPath(data: number[]): string {
  if (data.length < 2) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const W = 72
  const H = 28
  const pad = 2
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * (W - pad * 2) + pad,
    y: H - pad - ((v - min) / range) * (H - pad * 2),
  }))
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`
  }
  return d
}

// ─── SVG Sparkline — matches CryptoPage Graph column design ──────────────────
function MiniSparkline({ path, positive, pct }: { path: string; positive: boolean; pct: number }) {
  const color = positive ? '#4ade80' : '#f87171'
  return (
    <div className="flex items-center gap-1.5">
      <svg viewBox="0 0 72 28" width="72" height="28" aria-hidden="true">
        <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span
        className="text-xs font-semibold flex items-center gap-0.5 whitespace-nowrap"
        style={{ color }}
      >
        <i className={`fas fa-caret-${positive ? 'up' : 'down'} text-xs`} aria-hidden="true" />
        {Math.abs(pct).toFixed(0)}%
      </span>
    </div>
  )
}

function LogoAvatar({
  src,
  fallback,
  bg = 'rgba(255,255,255,0.08)',
}: {
  src?: string
  fallback: string
  bg?: string
}) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ background: bg, border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {src ? (
        <img
          src={src}
          alt={fallback}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            const t = e.currentTarget
            t.style.display = 'none'
            const sib = t.nextElementSibling as HTMLElement | null
            if (sib) sib.style.display = 'flex'
          }}
        />
      ) : null}
      <span
        className="text-xs font-bold text-white items-center justify-center"
        style={{ display: src ? 'none' : 'flex' }}
      >
        {fallback.slice(0, 2).toUpperCase()}
      </span>
    </div>
  )
}

const ROW_COLS = 'grid items-center px-2 py-3 rounded-xl transition-colors hover:bg-white/[0.04] cursor-pointer'
const COL_TEMPLATE = { gridTemplateColumns: '1fr 110px 70px 58px' }

export default function MarketOverviewTable() {
  const [activeTab, setActiveTab] = useState<Tab>('Stocks')
  const stocks = useStockQuotes()
  const { coins, loading: cryptoLoading } = useLiveMarket()

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
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-base font-bold text-white">Market Overview</h2>
        <button
          className="text-xs font-medium transition-colors hover:text-white"
          style={{ color: '#8b5cf6' }}
        >
          View All
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 flex-shrink-0 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={
              activeTab === tab
                ? { background: '#7c3aed', color: '#fff' }
                : { color: '#6b7280' }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div className="grid items-center mb-1 px-2 flex-shrink-0" style={COL_TEMPLATE}>
        <span className="text-xs font-medium" style={{ color: '#4b5563' }}>Name</span>
        <span className="text-xs font-medium" style={{ color: '#4b5563' }}>Chart</span>
        <span className="text-xs font-medium text-right" style={{ color: '#4b5563' }}>Price</span>
        <span className="text-xs font-medium text-right" style={{ color: '#4b5563' }}>24h</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ── Stocks ── */}
          {activeTab === 'Stocks' && (
            <motion.div
              key="stocks"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {stocks.map((stock, i) => {
                const positive = stock.changePct >= 0
                const path = arrayToPath(stock.sparkline)
                return (
                  <motion.div
                    key={stock.symbol}
                    className={ROW_COLS}
                    style={COL_TEMPLATE}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <LogoAvatar src={STOCK_LOGOS[stock.symbol]} fallback={stock.symbol} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white leading-tight truncate">{stock.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{stock.symbol}</p>
                      </div>
                    </div>
                    <MiniSparkline path={path} positive={positive} pct={stock.changePct} />
                    <p className="text-sm font-semibold text-white text-right tabular-nums">
                      ${stock.price.toFixed(2)}
                    </p>
                    <p
                      className="text-xs font-bold text-right tabular-nums"
                      style={{ color: positive ? '#4ade80' : '#f87171' }}
                    >
                      {positive ? '+' : ''}{stock.changePct.toFixed(2)}%
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* ── Cryptocurrency ── */}
          {activeTab === 'Cryptocurrency' && (
            <motion.div
              key="crypto"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {cryptoLoading
                ? [...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 rounded-xl mb-1 animate-pulse"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    />
                  ))
                : coins.slice(0, 5).map((coin, i) => {
                    const positive = coin.price_change_percentage_24h >= 0
                    const path = arrayToPath(coin.sparkline_in_7d?.price.slice(-20) ?? [])
                    return (
                      <motion.div
                        key={coin.id}
                        className={ROW_COLS}
                        style={COL_TEMPLATE}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden"
                            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                          >
                            <img src={coin.image} alt={coin.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white leading-tight truncate">{coin.name}</p>
                            <p className="text-xs mt-0.5 uppercase" style={{ color: '#6b7280' }}>{coin.symbol}</p>
                          </div>
                        </div>
                        <MiniSparkline path={path} positive={positive} pct={coin.price_change_percentage_24h} />
                        <p className="text-sm font-semibold text-white text-right tabular-nums">
                          ${coin.current_price.toLocaleString()}
                        </p>
                        <p
                          className="text-xs font-bold text-right tabular-nums"
                          style={{ color: positive ? '#4ade80' : '#f87171' }}
                        >
                          {positive ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                        </p>
                      </motion.div>
                    )
                  })}
            </motion.div>
          )}

          {/* ── Indices ── */}
          {activeTab === 'Indices' && (
            <motion.div
              key="indices"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {[
                { name: 'S&P 500',      symbol: 'SPX', price: 5234.18,  pct:  0.82, sparkline: [5150,5170,5160,5190,5180,5210,5200,5215,5228,5234] },
                { name: 'NASDAQ',       symbol: 'NDX', price: 18420.50, pct:  1.14, sparkline: [18100,18200,18150,18300,18250,18350,18320,18400,18390,18420] },
                { name: 'Dow Jones',    symbol: 'DJI', price: 39127.80, pct: -0.32, sparkline: [39400,39350,39300,39280,39250,39200,39180,39160,39140,39127] },
                { name: 'Russell 2000', symbol: 'RUT', price: 2048.60,  pct:  0.55, sparkline: [2020,2025,2030,2028,2035,2038,2040,2042,2046,2048] },
              ].map((idx, i) => {
                const positive = idx.pct >= 0
                const path = arrayToPath(idx.sparkline)
                return (
                  <motion.div
                    key={idx.symbol}
                    className={ROW_COLS}
                    style={COL_TEMPLATE}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <LogoAvatar
                        src={INDEX_LOGOS[idx.symbol]}
                        fallback={idx.symbol}
                        bg="rgba(139,92,246,0.15)"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white leading-tight truncate">{idx.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{idx.symbol}</p>
                      </div>
                    </div>
                    <MiniSparkline path={path} positive={positive} pct={idx.pct} />
                    <p className="text-sm font-semibold text-white text-right tabular-nums">
                      {idx.price.toLocaleString()}
                    </p>
                    <p
                      className="text-xs font-bold text-right tabular-nums"
                      style={{ color: positive ? '#4ade80' : '#f87171' }}
                    >
                      {positive ? '+' : ''}{idx.pct.toFixed(2)}%
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  )
}
