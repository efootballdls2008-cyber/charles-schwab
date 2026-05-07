import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import BuyModal, { type BuyAsset } from '../../components/dashboard/BuyModal'

// ─── Stock data ───────────────────────────────────────────────────────────────

interface StockRow {
  id: number
  rank: number
  name: string
  symbol: string
  color: string
  lastPrice: number
  change24h: number
  volume24h: number
  marketCap: number
  sparkline: string
}

const STOCK_DATA: StockRow[] = [
  { id: 1,  rank: 1,  name: 'Apple Inc.',       symbol: 'AAPL',  color: '#a2a2a2', lastPrice: 189.30, change24h: 1.24,  volume24h: 58200000,  marketCap: 2940000000000, sparkline: 'M0,22 C5,18 10,14 16,15 C22,16 26,20 32,18 C38,16 42,10 48,11 C54,12 58,18 64,15 C70,12 74,8 80,9' },
  { id: 2,  rank: 2,  name: 'Microsoft',         symbol: 'MSFT',  color: '#00a4ef', lastPrice: 415.20, change24h: 0.87,  volume24h: 22100000,  marketCap: 3080000000000, sparkline: 'M0,18 C6,16 10,20 16,18 C22,16 26,12 32,13 C38,14 42,20 48,18 C54,16 58,10 64,12 C70,14 74,18 80,16' },
  { id: 3,  rank: 3,  name: 'NVIDIA Corp.',      symbol: 'NVDA',  color: '#76b900', lastPrice: 875.40, change24h: 3.52,  volume24h: 41800000,  marketCap: 2160000000000, sparkline: 'M0,24 C6,22 10,16 16,15 C22,14 26,20 32,18 C38,16 42,10 48,11 C54,12 58,20 64,17 C70,14 74,8 80,9' },
  { id: 4,  rank: 4,  name: 'Amazon',            symbol: 'AMZN',  color: '#ff9900', lastPrice: 182.60, change24h: -0.43, volume24h: 35600000,  marketCap: 1890000000000, sparkline: 'M0,20 C4,18 8,22 14,20 C20,18 24,14 30,15 C36,16 40,22 46,20 C52,18 56,12 62,14 C68,16 72,20 80,18' },
  { id: 5,  rank: 5,  name: 'Alphabet Inc.',     symbol: 'GOOGL', color: '#4285f4', lastPrice: 172.80, change24h: 1.10,  volume24h: 24300000,  marketCap: 2140000000000, sparkline: 'M0,16 C6,14 10,18 16,16 C22,14 26,10 32,11 C38,12 42,18 48,16 C54,14 58,8 64,10 C70,12 74,16 80,14' },
  { id: 6,  rank: 6,  name: 'Meta Platforms',    symbol: 'META',  color: '#0081fb', lastPrice: 492.10, change24h: 2.30,  volume24h: 18700000,  marketCap: 1250000000000, sparkline: 'M0,22 C5,20 8,15 14,14 C20,13 22,18 28,16 C34,14 36,8 42,9 C48,10 50,18 56,15 C62,12 64,7 70,8 C74,9 77,12 80,10' },
  { id: 7,  rank: 7,  name: 'Tesla Inc.',        symbol: 'TSLA',  color: '#cc0000', lastPrice: 177.90, change24h: -1.85, volume24h: 92400000,  marketCap: 566000000000,  sparkline: 'M0,18 C4,16 8,20 14,18 C20,16 24,12 30,13 C36,14 40,20 46,18 C52,16 56,10 62,12 C68,14 72,18 80,16' },
  { id: 8,  rank: 8,  name: 'Berkshire Hathaway',symbol: 'BRK.B', color: '#8b4513', lastPrice: 408.50, change24h: 0.55,  volume24h: 4200000,   marketCap: 880000000000,  sparkline: 'M0,24 C6,22 10,16 16,15 C22,14 26,20 32,18 C38,16 42,10 48,11 C54,12 58,20 64,17 C70,14 74,8 80,9' },
  { id: 9,  rank: 9,  name: 'JPMorgan Chase',    symbol: 'JPM',   color: '#005eb8', lastPrice: 196.40, change24h: 0.72,  volume24h: 9800000,   marketCap: 567000000000,  sparkline: 'M0,22 C5,20 8,15 14,14 C20,13 22,18 28,16 C34,14 36,8 42,9 C48,10 50,18 56,15 C62,12 64,7 70,8 C74,9 77,12 80,10' },
  { id: 10, rank: 10, name: 'Visa Inc.',         symbol: 'V',     color: '#1a1f71', lastPrice: 274.60, change24h: -0.30, volume24h: 6100000,   marketCap: 558000000000,  sparkline: 'M0,20 C4,18 8,22 14,20 C20,18 24,14 30,15 C36,16 40,22 46,20 C52,18 56,12 62,14 C68,16 72,20 80,18' },
  { id: 11, rank: 11, name: 'Johnson & Johnson', symbol: 'JNJ',   color: '#d50032', lastPrice: 147.20, change24h: 0.18,  volume24h: 7300000,   marketCap: 354000000000,  sparkline: 'M0,16 C6,14 10,18 16,16 C22,14 26,10 32,11 C38,12 42,18 48,16 C54,14 58,8 64,10 C70,12 74,16 80,14' },
  { id: 12, rank: 12, name: 'Walmart Inc.',      symbol: 'WMT',   color: '#0071ce', lastPrice: 65.80,  change24h: 1.45,  volume24h: 11200000,  marketCap: 529000000000,  sparkline: 'M0,22 C5,20 8,15 14,14 C20,13 22,18 28,16 C34,14 36,8 42,9 C48,10 50,18 56,15 C62,12 64,7 70,8 C74,9 77,12 80,10' },
]

// ─── Static crypto data ───────────────────────────────────────────────────────

interface CryptoRow {
  id: number
  rank: number
  name: string
  symbol: string
  color: string
  lastPrice: number
  change24h: number
  volume24h: number
  sparkline: string
}

const CRYPTO_DATA: CryptoRow[] = [
  {
    id: 1, rank: 1, name: 'Ethereum', symbol: 'ETH', color: '#627eea',
    lastPrice: 11000.48, change24h: 2.54, volume24h: 220555007621,
    sparkline: 'M0,22 C5,18 10,14 16,15 C22,16 26,20 32,18 C38,16 42,10 48,11 C54,12 58,18 64,15 C70,12 74,8 80,9',
  },
  {
    id: 2, rank: 2, name: 'Ethereum', symbol: 'ETH', color: '#627eea',
    lastPrice: 11511.48, change24h: 3.54, volume24h: 220083007631,
    sparkline: 'M0,18 C6,16 10,20 16,18 C22,16 26,12 32,13 C38,14 42,20 48,18 C54,16 58,10 64,12 C70,14 74,18 80,16',
  },
  {
    id: 3, rank: 3, name: 'Monero', symbol: 'XMR', color: '#ff6600',
    lastPrice: 11411.48, change24h: 4.54, volume24h: 220083007631,
    sparkline: 'M0,24 C6,22 10,16 16,15 C22,14 26,20 32,18 C38,16 42,10 48,11 C54,12 58,20 64,17 C70,14 74,8 80,9',
  },
  {
    id: 4, rank: 4, name: 'Ethereum', symbol: 'ETH', color: '#627eea',
    lastPrice: 71911.48, change24h: 2.54, volume24h: 220083457631,
    sparkline: 'M0,20 C4,18 8,22 14,20 C20,18 24,14 30,15 C36,16 40,22 46,20 C52,18 56,12 62,14 C68,16 72,20 80,18',
  },
  {
    id: 5, rank: 5, name: 'Monero', symbol: 'XMR', color: '#ff6600',
    lastPrice: 10911.48, change24h: 7.54, volume24h: 220083557631,
    sparkline: 'M0,16 C6,14 10,18 16,16 C22,14 26,10 32,11 C38,12 42,18 48,16 C54,14 58,8 64,10 C70,12 74,16 80,14',
  },
  {
    id: 6, rank: 6, name: 'Bitcoin', symbol: 'BTC', color: '#f7931a',
    lastPrice: 11900.48, change24h: -2.40, volume24h: 220083007600,
    sparkline: 'M0,22 C5,20 8,15 14,14 C20,13 22,18 28,16 C34,14 36,8 42,9 C48,10 50,18 56,15 C62,12 64,7 70,8 C74,9 77,12 80,10',
  },
  {
    id: 7, rank: 7, name: 'Ethereum', symbol: 'ETH', color: '#627eea',
    lastPrice: 11991.48, change24h: 2.54, volume24h: 220083507631,
    sparkline: 'M0,18 C4,16 8,20 14,18 C20,16 24,12 30,13 C36,14 40,20 46,18 C52,16 56,10 62,12 C68,14 72,18 80,16',
  },
  {
    id: 8, rank: 8, name: 'Monero', symbol: 'XMR', color: '#ff6600',
    lastPrice: 11967.48, change24h: 2.54, volume24h: 220083007031,
    sparkline: 'M0,24 C6,22 10,16 16,15 C22,14 26,20 32,18 C38,16 42,10 48,11 C54,12 58,20 64,17 C70,14 74,8 80,9',
  },
  {
    id: 9, rank: 9, name: 'Bitcoin', symbol: 'BTC', color: '#f7931a',
    lastPrice: 11911.48, change24h: -2.54, volume24h: 220083017631,
    sparkline: 'M0,22 C5,20 8,15 14,14 C20,13 22,18 28,16 C34,14 36,8 42,9 C48,10 50,18 56,15 C62,12 64,7 70,8 C74,9 77,12 80,10',
  },
  {
    id: 10, rank: 10, name: 'Ethereum', symbol: 'ETH', color: '#627eea',
    lastPrice: 12100.00, change24h: 1.20, volume24h: 218000007000,
    sparkline: 'M0,20 C4,18 8,22 14,20 C20,18 24,14 30,15 C36,16 40,22 46,20 C52,18 56,12 62,14 C68,16 72,20 80,18',
  },
  {
    id: 11, rank: 11, name: 'Monero', symbol: 'XMR', color: '#ff6600',
    lastPrice: 9850.00, change24h: -1.80, volume24h: 195000007000,
    sparkline: 'M0,16 C6,14 10,18 16,16 C22,14 26,10 32,11 C38,12 42,18 48,16 C54,14 58,8 64,10 C70,12 74,16 80,14',
  },
  {
    id: 12, rank: 12, name: 'Bitcoin', symbol: 'BTC', color: '#f7931a',
    lastPrice: 67420.00, change24h: 3.10, volume24h: 310000007000,
    sparkline: 'M0,22 C5,20 8,15 14,14 C20,13 22,18 28,16 C34,14 36,8 42,9 C48,10 50,18 56,15 C62,12 64,7 70,8 C74,9 77,12 80,10',
  },
]

type Tab = 'crypto' | 'stocks'
type SortKey = 'rank' | 'lastPrice' | 'change24h' | 'volume24h'
type SortDir = 'asc' | 'desc'
type FilterOption = 'Newest' | 'Oldest' | 'Highest Price' | 'Lowest Price'

// ─── Mini sparkline ───────────────────────────────────────────────────────────

function Sparkline({ path, positive }: { path: string; positive: boolean }) {
  const color = positive ? '#4ade80' : '#f87171'
  return (
    <svg viewBox="0 0 80 30" width="72" height="28" aria-hidden="true">
      <defs>
        <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="inline-flex flex-col ml-1 opacity-50" style={{ opacity: active ? 1 : 0.4 }}>
      <i
        className="fas fa-caret-up text-xs leading-none"
        style={{ color: active && dir === 'asc' ? '#c9a84c' : '#6b7280' }}
      />
      <i
        className="fas fa-caret-down text-xs leading-none"
        style={{ color: active && dir === 'desc' ? '#c9a84c' : '#6b7280' }}
      />
    </span>
  )
}

// ─── CryptoPage ───────────────────────────────────────────────────────────────

export default function CryptoPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('crypto')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterOption, setFilterOption] = useState<FilterOption>('Newest')
  const [sortDropOpen, setSortDropOpen] = useState(false)
  const [buyAsset, setBuyAsset] = useState<BuyAsset | null>(null)

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) return null

  // Reset selection when switching tabs
  const handleTabSwitch = (t: Tab) => {
    setTab(t)
    setSelected(new Set())
    setSearch('')
  }

  // Sort handler
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const activeData = tab === 'crypto' ? CRYPTO_DATA : STOCK_DATA

  // Filtered + sorted rows
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const rows = useMemo(() => {
    let data = activeData.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.symbol.toLowerCase().includes(search.toLowerCase()),
    )
    data = [...data].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      return (a[sortKey] - b[sortKey]) * mul
    })
    return data
  }, [search, sortKey, sortDir, activeData])

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))
  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(rows.map((r) => r.id)))
    }
  }
  const toggleRow = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filterOptions: FilterOption[] = ['Newest', 'Oldest', 'Highest Price', 'Lowest Price']

  return (
    <DashboardLayout>
      <main
        className="flex-1 overflow-y-auto p-4 sm:p-6"
        style={{ backgroundColor: '#110b2d' }}
      >
        {/* Buy Modal */}
        {buyAsset && (
          <BuyModal
            asset={buyAsset}
            onClose={() => setBuyAsset(null)}
          />
        )}
        {/* ── Crypto / Stocks Toggle Switch ── */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="relative flex items-center p-1 rounded-xl"
            style={{ background: 'rgba(22,15,53,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* sliding pill */}
            <div
              className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-in-out"
              style={{
                width: 'calc(50% - 4px)',
                left: tab === 'crypto' ? '4px' : 'calc(50%)',
                background: 'linear-gradient(135deg,#a28539,#c9a84c)',
              }}
            />
            <button
              onClick={() => handleTabSwitch('crypto')}
              className="relative z-10 flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
              style={{ color: tab === 'crypto' ? '#0d0824' : '#9ca3af' }}
            >
              <i className="fas fa-coins text-xs" aria-hidden="true" />
              Crypto
            </button>
            <button
              onClick={() => handleTabSwitch('stocks')}
              className="relative z-10 flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
              style={{ color: tab === 'stocks' ? '#0d0824' : '#9ca3af' }}
            >
              <i className="fas fa-chart-bar text-xs" aria-hidden="true" />
              Stocks
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: '#4ade80' }}
            />
            <span className="text-xs text-gray-400">Live prices</span>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <i
              className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: '#6b7280' }}
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder={tab === 'crypto' ? 'Search coin...' : 'Search stock...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm text-gray-300 rounded-xl outline-none transition-all"
              style={{
                background: 'rgba(22,15,53,0.9)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Get Report */}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }}
            >
              <i className="fas fa-file-alt text-xs" aria-hidden="true" />
              <span className="hidden sm:inline">Get Report</span>
            </button>

            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => { setFilterOpen((o) => !o); setSortDropOpen(false) }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
                style={{
                  background: 'rgba(22,15,53,0.9)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#c8c8d8',
                }}
              >
                <i className="fas fa-sliders-h text-xs" aria-hidden="true" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              {filterOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-xl shadow-2xl py-1 z-20"
                  style={{ background: '#160f35', border: '1px solid rgba(162,133,57,0.25)' }}
                >
                  {filterOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setFilterOption(opt); setFilterOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:text-white"
                      style={{ color: filterOption === opt ? '#c9a84c' : '#c8c8d8' }}
                    >
                      {filterOption === opt && (
                        <i className="fas fa-check text-xs mr-2" style={{ color: '#c9a84c' }} />
                      )}
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => { setSortDropOpen((o) => !o); setFilterOpen(false) }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
                style={{
                  background: 'rgba(22,15,53,0.9)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#c8c8d8',
                }}
              >
                <span>{filterOption}</span>
                <i className="fas fa-chevron-down text-xs" aria-hidden="true" />
              </button>
              {sortDropOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-xl shadow-2xl py-1 z-20"
                  style={{ background: '#160f35', border: '1px solid rgba(162,133,57,0.25)' }}
                >
                  {filterOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setFilterOption(opt); setSortDropOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:text-white"
                      style={{ color: filterOption === opt ? '#c9a84c' : '#c8c8d8' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* More options */}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-white/10"
              style={{
                background: 'rgba(22,15,53,0.9)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#c8c8d8',
              }}
              aria-label="More options"
            >
              <i className="fas fa-ellipsis-v text-sm" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(22,15,53,0.9)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Scrollable wrapper for small screens */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {/* Checkbox */}
                  <th className="w-10 pl-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded accent-yellow-500 cursor-pointer"
                      aria-label="Select all"
                    />
                  </th>

                  {/* Rank */}
                  <th
                    className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                    style={{ color: '#9ca3af' }}
                    onClick={() => handleSort('rank')}
                  >
                    Rank
                    <SortIcon active={sortKey === 'rank'} dir={sortDir} />
                  </th>

                  {/* Coin / Stock */}
                  <th
                    className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                    style={{ color: '#9ca3af' }}
                  >
                    {tab === 'crypto' ? 'Coin' : 'Stock'}
                    <i className="fas fa-caret-down ml-1 text-xs opacity-40" aria-hidden="true" />
                  </th>

                  {/* Last Price */}
                  <th
                    className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                    style={{ color: '#9ca3af' }}
                    onClick={() => handleSort('lastPrice')}
                  >
                    Last Price
                    <SortIcon active={sortKey === 'lastPrice'} dir={sortDir} />
                  </th>

                  {/* Change 24h */}
                  <th
                    className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                    style={{ color: '#9ca3af' }}
                    onClick={() => handleSort('change24h')}
                  >
                    Change (24h)
                    <SortIcon active={sortKey === 'change24h'} dir={sortDir} />
                  </th>

                  {/* Volume */}
                  <th
                    className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                    style={{ color: '#9ca3af' }}
                    onClick={() => handleSort('volume24h')}
                  >
                    Volume (24h)
                    <SortIcon active={sortKey === 'volume24h'} dir={sortDir} />
                  </th>

                  {/* Graph */}
                  <th
                    className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: '#9ca3af' }}
                  >
                    Graph
                    <i className="fas fa-sliders-h ml-1 text-xs opacity-40" aria-hidden="true" />
                  </th>

                  {/* Actions */}
                  <th className="w-8 pr-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-gray-500 text-sm">
                      No {tab === 'crypto' ? 'coins' : 'stocks'} match your search.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => {
                    const isSelected = selected.has(row.id)
                    const isPositive = row.change24h >= 0
                    const isLast = idx === rows.length - 1

                    return (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-white/[0.03] cursor-pointer"
                        style={{
                          borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                          background: isSelected ? 'rgba(162,133,57,0.06)' : undefined,
                          borderLeft: isSelected ? '3px solid #c9a84c' : '3px solid transparent',
                        }}
                        onClick={() => toggleRow(row.id)}
                      >
                        {/* Checkbox */}
                        <td className="pl-3 py-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(row.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded accent-yellow-500 cursor-pointer"
                            aria-label={`Select ${row.name}`}
                          />
                        </td>

                        {/* Rank */}
                        <td className="px-3 py-3.5">
                          <span className="text-sm text-gray-400">#{row.rank}</span>
                        </td>

                        {/* Coin */}
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ background: `${row.color}22`, border: `1.5px solid ${row.color}55`, color: row.color }}
                            >
                              {row.symbol.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white leading-none">{row.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{row.symbol}</p>
                            </div>
                          </div>
                        </td>

                        {/* Last Price */}
                        <td className="px-3 py-3.5">
                          <span className="text-sm font-semibold text-white">
                            ${row.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Change 24h */}
                        <td className="px-3 py-3.5">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: isPositive ? '#4ade80' : '#f87171' }}
                          >
                            {isPositive ? '+' : ''}{row.change24h.toFixed(2)}%
                          </span>
                        </td>

                        {/* Volume */}
                        <td className="px-3 py-3.5">
                          <span className="text-sm text-gray-300">
                            ${row.volume24h.toLocaleString('en-US')}
                          </span>
                        </td>

                        {/* Graph */}
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2">
                            <Sparkline path={row.sparkline} positive={isPositive} />
                            <span
                              className="text-xs font-semibold flex items-center gap-0.5"
                              style={{ color: isPositive ? '#4ade80' : '#f87171' }}
                            >
                              <i
                                className={`fas fa-caret-${isPositive ? 'up' : 'down'} text-xs`}
                                aria-hidden="true"
                              />
                              {Math.abs(row.change24h).toFixed(0)}%
                            </span>
                          </div>
                        </td>

                        {/* Row actions */}
                        <td className="pr-4 py-3.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setBuyAsset({
                                type: tab === 'stocks' ? 'stock' : 'crypto',
                                symbol: row.symbol,
                                name: row.name,
                                color: row.color,
                                price: row.lastPrice,
                                change24h: row.change24h,
                              })
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                            style={{
                              background: tab === 'crypto'
                                ? 'rgba(245,158,11,0.15)'
                                : 'rgba(96,165,250,0.15)',
                              color: tab === 'crypto' ? '#f59e0b' : '#60a5fa',
                              border: `1px solid ${tab === 'crypto' ? 'rgba(245,158,11,0.3)' : 'rgba(96,165,250,0.3)'}`,
                            }}
                          >
                            <i className="fas fa-shopping-cart text-xs" />
                            Buy
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination footer ── */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-wrap gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs text-gray-500">
              Showing <span className="text-white font-medium">{rows.length}</span> of{' '}
              <span className="text-white font-medium">{activeData.length}</span> {tab === 'crypto' ? 'coins' : 'stocks'}
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className="w-7 h-7 rounded-lg text-xs font-semibold transition-all"
                  style={
                    page === 1
                      ? { background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }
                      : { color: '#6b7280', background: 'transparent' }
                  }
                >
                  {page}
                </button>
              ))}
              <button className="w-7 h-7 rounded-lg text-xs text-gray-500 hover:text-white transition-colors">
                <i className="fas fa-chevron-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
