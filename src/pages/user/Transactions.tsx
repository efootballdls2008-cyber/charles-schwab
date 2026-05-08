import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import DepositWithdrawModal, { type ModalMode } from '../../components/dashboard/DepositWithdrawModal'
import BuyModal, { type BuyAsset } from '../../components/dashboard/BuyModal'
import { DEFAULT_STOCK, DEFAULT_CRYPTO } from '../../components/dashboard/QuickActions'
import { getDeposits, type Deposit } from '../../services/depositService'
import { getTransactions, getTradeHistory } from '../../services/transactionService'
import type { Transaction, TradeHistory } from '../../services/transactionService'
import { get } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'

interface Purchase {
  id: number
  userId: number
  type: 'buy_stock' | 'buy_crypto'
  symbol: string
  name: string
  color: string
  quantity: number
  price: number
  totalCost: number
  date: string
  time: string
  txId: string
  status: 'completed' | 'pending' | 'cancelled'
}

// ─── Unified row type ─────────────────────────────────────────────────────────
type TxCategory = 'deposit' | 'withdraw' | 'crypto_transfer' | 'trade' | 'buy_stock' | 'buy_crypto'

interface UnifiedTx {
  id: string
  category: TxCategory
  date: string        // ISO or display string
  time: string
  label: string       // asset name / method
  symbol?: string
  color?: string
  amount: number
  amountUsd?: number
  status: 'completed' | 'pending' | 'cancelled' | 'processing'
  txId: string
  side?: 'Buy' | 'Sell'
  method?: string
  note?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mapDeposit(d: Deposit): UnifiedTx {
  return {
    id: `dep-${d.id}`,
    category: d.type,
    date: d.date,
    time: d.time,
    label: d.method,
    amount: d.amount,
    status: d.status,
    txId: d.txId,
    method: d.method,
    note: d.note,
  }
}

function mapTransaction(t: Transaction): UnifiedTx {
  return {
    id: `tx-${t.id}`,
    category: 'crypto_transfer',
    date: t.date,
    time: t.time,
    label: t.coin,
    symbol: t.coinSymbol,
    color: t.coinColor,
    amount: t.amount,
    status: t.status,
    txId: t.txId,
  }
}

function mapTrade(t: TradeHistory): UnifiedTx {
  return {
    id: `trade-${t.id}`,
    category: 'trade',
    date: t.date,
    time: t.time,
    label: t.asset,
    symbol: t.assetSymbol,
    color: t.assetColor,
    amount: t.amountUsd,
    status: t.status,
    txId: t.tradeId,
    side: t.side,
  }
}

function mapPurchase(p: Purchase): UnifiedTx {
  return {
    id: `purchase-${p.id}`,
    category: p.type,
    date: p.date,
    time: p.time,
    label: p.name,
    symbol: p.symbol,
    color: p.color,
    amount: p.totalCost,
    status: p.status,
    txId: p.txId,
    side: 'Buy',
  }
}

// ─── Badge components ─────────────────────────────────────────────────────────
const CATEGORY_META: Record<TxCategory, { label: string; icon: string; color: string; bg: string; border: string }> = {
  deposit:         { label: 'Deposit',       icon: 'fas fa-arrow-down',    color: '#4ade80', bg: 'rgba(74,222,128,0.12)',   border: 'rgba(74,222,128,0.25)'   },
  withdraw:        { label: 'Withdraw',      icon: 'fas fa-arrow-up',      color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)'  },
  crypto_transfer: { label: 'Transfer',      icon: 'fas fa-exchange-alt',  color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.25)'   },
  trade:           { label: 'Trade',         icon: 'fas fa-chart-line',    color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)'   },
  buy_stock:       { label: 'Buy Stock',     icon: 'fas fa-shopping-cart', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.25)'   },
  buy_crypto:      { label: 'Buy Crypto',    icon: 'fas fa-shopping-cart', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)'   },
}

function CategoryBadge({ category }: { category: TxCategory }) {
  const m = CATEGORY_META[category]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
      style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
    >
      <i className={`${m.icon} text-xs`} />
      {m.label}
    </span>
  )
}

function StatusBadge({ status }: { status: UnifiedTx['status'] }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    completed:  { label: 'Completed',  bg: 'rgba(74,222,128,0.12)',  color: '#4ade80', border: 'rgba(74,222,128,0.25)'  },
    pending:    { label: 'Pending',    bg: 'rgba(251,191,36,0.10)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)'  },
    cancelled:  { label: 'Cancelled',  bg: 'rgba(248,113,113,0.10)', color: '#f87171', border: 'rgba(248,113,113,0.25)' },
    processing: { label: 'Processing', bg: 'rgba(139,92,246,0.10)',  color: '#a78bfa', border: 'rgba(139,92,246,0.25)'  },
  }
  const s = map[status] ?? map['pending']
  return (
    <span
      className="px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  )
}

function AssetDot({ symbol, color, label }: { symbol?: string; color?: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={{
          background: color ? `${color}22` : 'rgba(255,255,255,0.08)',
          border: `1px solid ${color ? `${color}44` : 'rgba(255,255,255,0.12)'}`,
          color: color ?? '#9ca3af',
        }}
      >
        {symbol ? symbol.slice(0, 2) : <i className="fas fa-dollar-sign text-xs" />}
      </div>
      <div>
        <p className="text-xs font-semibold text-white leading-tight">{label}</p>
        {symbol && <p className="text-xs" style={{ color: '#6b7280' }}>{symbol}</p>}
      </div>
    </div>
  )
}

// ─── Summary cards ────────────────────────────────────────────────────────────
function SummaryCard({ icon, label, value, color, bg }: {
  icon: string; label: string; value: string; color: string; bg: string
}) {
  return (
    <motion.div
      className="rounded-2xl px-5 py-4 flex items-center gap-4"
      style={{ background: bg, border: `1px solid ${color}33` }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}22`, border: `1px solid ${color}44` }}
      >
        <i className={`${icon} text-base`} style={{ color }} />
      </div>
      <div>
        <p className="text-xs" style={{ color: '#9ca3af' }}>{label}</p>
        <p className="text-base font-bold text-white">{value}</p>
      </div>
    </motion.div>
  )
}

type TabKey = 'all' | 'deposit' | 'withdraw' | 'crypto_transfer' | 'trade' | 'buy_stock' | 'buy_crypto'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',            label: 'All'       },
  { key: 'deposit',        label: 'Deposits'  },
  { key: 'withdraw',       label: 'Withdrawals' },
  { key: 'buy_stock',      label: 'Stock Buys' },
  { key: 'buy_crypto',     label: 'Crypto Buys' },
  { key: 'crypto_transfer',label: 'Transfers' },
  { key: 'trade',          label: 'Trades'    },
]

const PAGE_SIZE = 12

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Transactions() {
  const { user } = useAuth()

  const [allTx, setAllTx] = useState<UnifiedTx[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<ModalMode | null>(null)
  const [buyAsset, setBuyAsset] = useState<BuyAsset | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [deposits, transactions, trades, purchases] = await Promise.all([
        getDeposits(user.id),
        getTransactions(user.id),
        getTradeHistory(user.id),
        get<Purchase[]>(ENDPOINTS.purchases(user.id)),
      ])
      const unified: UnifiedTx[] = [
        ...deposits.map(mapDeposit),
        ...transactions.map(mapTransaction),
        ...trades.map(mapTrade),
        ...purchases.map(mapPurchase),
      ].sort((a, b) => {
        const da = new Date(`${a.date} ${a.time}`).getTime()
        const db = new Date(`${b.date} ${b.time}`).getTime()
        return isNaN(da) || isNaN(db) ? 0 : db - da
      })
      setAllTx(unified)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { loadData() }, [loadData])

  // ── Derived stats ──
  const totalDeposited = allTx
    .filter((t) => t.category === 'deposit' && t.status === 'completed')
    .reduce((s, t) => s + t.amount, 0)
  const totalWithdrawn = allTx
    .filter((t) => t.category === 'withdraw' && t.status === 'completed')
    .reduce((s, t) => s + t.amount, 0)
  const totalTrades = allTx.filter((t) => t.category === 'trade').length

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  // ── Filtered ──
  const tabFiltered = useMemo(() => {
    if (tab === 'all') return allTx
    return allTx.filter((t) => t.category === tab)
  }, [allTx, tab])

  const searched = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return tabFiltered
    return tabFiltered.filter(
      (t) =>
        t.txId.toLowerCase().includes(q) ||
        t.label.toLowerCase().includes(q) ||
        (t.symbol ?? '').toLowerCase().includes(q) ||
        (t.method ?? '').toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q),
    )
  }, [tabFiltered, search])

  const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE))
  const paginated = searched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0d0824' }}>
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Deposit / Withdraw Modal */}
      {modal && (
        <DepositWithdrawModal
          mode={modal}
          onClose={() => setModal(null)}
          onSuccess={() => { setModal(null); loadData() }}
        />
      )}

      {/* Buy Stock / Crypto Modal */}
      {buyAsset && (
        <BuyModal
          asset={buyAsset}
          onClose={() => setBuyAsset(null)}
          onSuccess={() => { setBuyAsset(null); loadData() }}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ backgroundColor: '#110b2d' }}>

          {/* ── Page header ── */}
          <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-white">Transactions</h1>
              <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                All deposits, withdrawals, transfers and trades in one place.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <motion.button
                onClick={() => setModal('deposit')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <i className="fas fa-arrow-down text-xs" />
                Deposit
              </motion.button>
              <motion.button
                onClick={() => setModal('withdraw')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <i className="fas fa-arrow-up text-xs" />
                Withdraw
              </motion.button>
              <motion.button
                onClick={() => setBuyAsset(DEFAULT_STOCK)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <i className="fas fa-chart-line text-xs" />
                Buy Stocks
              </motion.button>
              <motion.button
                onClick={() => setBuyAsset(DEFAULT_CRYPTO)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <i className="fab fa-bitcoin text-xs" />
                Buy Crypto
              </motion.button>
            </div>
          </div>

          {/* ── Available Balance card ── */}
          <motion.div
            className="rounded-2xl px-5 py-4 mb-5 flex items-center justify-between flex-wrap gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(26,16,64,0.95) 0%, rgba(45,27,142,0.6) 100%)',
              border: '1px solid rgba(139,92,246,0.25)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.35)' }}
              >
                <i className="fas fa-wallet text-base" style={{ color: '#a78bfa' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'rgba(196,181,253,0.7)' }}>
                  Available Balance
                </p>
                <motion.p
                  key={user?.balance}
                  className="text-2xl font-bold text-white leading-tight"
                  initial={{ opacity: 0.5, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                  }).format(user?.balance ?? 0)}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}
              >
                <i className="fas fa-circle text-xs" style={{ fontSize: '6px' }} />
                Account Active
              </span>
              <span className="text-xs" style={{ color: 'rgba(156,163,175,0.6)' }}>
                {allTx.length} total transactions
              </span>
            </div>
          </motion.div>

          {/* ── Summary cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <SummaryCard icon="fas fa-arrow-down"   label="Total Deposited"  value={fmt(totalDeposited)} color="#4ade80" bg="rgba(74,222,128,0.06)"   />
            <SummaryCard icon="fas fa-arrow-up"     label="Total Withdrawn"  value={fmt(totalWithdrawn)} color="#a78bfa" bg="rgba(167,139,250,0.06)"  />
            <SummaryCard icon="fas fa-chart-line"   label="Total Trades"     value={String(totalTrades)} color="#fbbf24" bg="rgba(251,191,36,0.06)"   />
            <SummaryCard icon="fas fa-list-alt"     label="All Transactions" value={String(allTx.length)} color="#60a5fa" bg="rgba(96,165,250,0.06)"  />
          </div>

          {/* ── Tabs + search ── */}
          <div
            className="flex items-center gap-1 mb-4 flex-wrap"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setPage(1) }}
                className="px-4 py-2.5 text-sm font-medium transition-all relative whitespace-nowrap"
                style={{ color: tab === t.key ? '#fff' : '#6b7280' }}
              >
                {t.label}
                {tab === t.key && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                    style={{ background: '#c9a84c' }}
                  />
                )}
              </button>
            ))}

            <div className="relative ml-auto mb-1">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#4b5563' }} />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-8 pr-3 py-1.5 text-xs text-gray-300 rounded-xl outline-none w-44"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          </div>

          {/* ── Table ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1a1040' }}>
                    {['Tx ID', 'Date & Time', 'Type', 'Asset / Method', 'Amount (USD)', 'Status'].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap"
                        style={{ color: '#6b7280' }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-500">
                        <i className="fas fa-spinner fa-spin mr-2" />
                        Loading transactions…
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-500">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((tx, i) => (
                      <tr
                        key={tx.id}
                        className="transition-colors hover:bg-white/[0.03]"
                        style={{
                          background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                          borderTop: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {/* Tx ID */}
                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap" style={{ color: '#9ca3af' }}>
                          {tx.txId}
                        </td>

                        {/* Date & Time */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-xs font-medium text-white">{tx.date}</p>
                          <p className="text-xs" style={{ color: '#6b7280' }}>{tx.time}</p>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <CategoryBadge category={tx.category} />
                        </td>

                        {/* Asset / Method */}
                        <td className="px-4 py-3">
                          <AssetDot symbol={tx.symbol} color={tx.color} label={tx.label} />
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p
                            className="text-sm font-bold"
                            style={{
                              color:
                                tx.category === 'deposit'
                                  ? '#4ade80'
                                  : tx.category === 'withdraw'
                                  ? '#f87171'
                                  : tx.side === 'Sell'
                                  ? '#f87171'
                                  : '#fff',
                            }}
                          >
                            {tx.category === 'deposit' ? '+' : tx.category === 'withdraw' ? '−' : ''}
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tx.amount)}
                          </p>
                          {tx.side && (
                            <p className="text-xs" style={{ color: tx.side === 'Buy' ? '#4ade80' : '#f87171' }}>
                              {tx.side}
                            </p>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={tx.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            <div
              className="flex items-center justify-between px-5 py-3 flex-wrap gap-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#1a1040' }}
            >
              <p className="text-xs" style={{ color: '#6b7280' }}>
                Showing{' '}
                <span className="text-white font-medium">
                  {searched.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                </span>{' '}
                to{' '}
                <span className="text-white font-medium">
                  {Math.min(page * PAGE_SIZE, searched.length)}
                </span>{' '}
                of{' '}
                <span className="text-white font-medium">{searched.length}</span> results
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="w-7 h-7 rounded-lg text-xs transition-all disabled:opacity-30"
                  style={{ color: '#6b7280', background: 'rgba(255,255,255,0.04)' }}
                >
                  <i className="fas fa-angle-double-left text-xs" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '…')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('…')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, idx) =>
                    p === '…' ? (
                      <span key={`e-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-gray-500">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                        style={
                          page === p
                            ? { background: 'rgba(201,168,76,0.2)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.35)' }
                            : { color: '#6b7280', background: 'rgba(255,255,255,0.04)' }
                        }
                      >
                        {p}
                      </button>
                    ),
                  )}

                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="w-7 h-7 rounded-lg text-xs transition-all disabled:opacity-30"
                  style={{ color: '#6b7280', background: 'rgba(255,255,255,0.04)' }}
                >
                  <i className="fas fa-angle-double-right text-xs" />
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
