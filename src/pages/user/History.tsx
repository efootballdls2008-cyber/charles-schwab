import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getTradeHistory } from '../../services/transactionService'
import type { TradeHistory } from '../../services/transactionService'
import { get } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import type { BotTrade } from '../../hooks/useAlgorithmEngine'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardHeader from '../../components/dashboard/DashboardHeader'

// ─── Asset icon ───────────────────────────────────────────────────────────────
const ASSET_ICONS: Record<string, string> = {
  BTC: 'fab fa-bitcoin',
  ETH: 'fab fa-ethereum',
}

function AssetIcon({ symbol, color }: { symbol: string; color: string }) {
  const icon = ASSET_ICONS[symbol]
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}22`, border: `1px solid ${color}44` }}
    >
      {icon
        ? <i className={`${icon} text-sm`} style={{ color }} />
        : <span className="text-xs font-bold" style={{ color }}>{symbol.slice(0, 2)}</span>
      }
    </div>
  )
}

// ─── Executor icon ────────────────────────────────────────────────────────────
function ExecutorIcon({ by }: { by: 'Trade Bot' | 'You' }) {
  if (by === 'Trade Bot') {
    return (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)' }}
      >
        <i className="fas fa-robot text-xs" style={{ color: '#4ade80' }} />
      </div>
    )
  }
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)' }}
    >
      <i className="fas fa-user text-xs" style={{ color: '#a78bfa' }} />
    </div>
  )
}

// ─── Type badge ───────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: 'Spot' | 'Futures' }) {
  const isSpot = type === 'Spot'
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-semibold"
      style={
        isSpot
          ? { background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }
          : { background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }
      }
    >
      {type}
    </span>
  )
}

// ─── Side badge ───────────────────────────────────────────────────────────────
function SideBadge({ side }: { side: 'Buy' | 'Sell' }) {
  const isBuy = side === 'Buy'
  return (
    <span className="text-xs font-semibold" style={{ color: isBuy ? '#4ade80' : '#f87171' }}>
      {side}
    </span>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: TradeHistory['status'] }) {
  if (status === 'processing') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
        style={{
          background: 'rgba(139,92,246,0.12)',
          color: '#a78bfa',
          border: '1px solid rgba(139,92,246,0.3)',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: '#a78bfa' }}
        />
        Processing
      </span>
    )
  }

  const map = {
    completed: { label: 'Completed', bg: 'rgba(74,222,128,0.12)',  color: '#4ade80', border: 'rgba(74,222,128,0.25)' },
    pending:   { label: 'Pending',   bg: 'rgba(251,191,36,0.10)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
    cancelled: { label: 'Cancelled', bg: 'rgba(248,113,113,0.10)', color: '#f87171', border: 'rgba(248,113,113,0.25)' },
  }
  const s = map[status]
  return (
    <span
      className="px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  )
}

// ─── Format date without year ─────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  const parts = dateStr.split(',')
  return parts[0]?.trim() ?? dateStr
}

// ─── Map a BotTrade → TradeHistory shape ──────────────────────────────────────
function botTradeToHistory(t: BotTrade): TradeHistory {
  const openedDate = new Date(t.openedAt)
  const dateLabel = openedDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const timeLabel = openedDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })

  // Derive asset symbol from pair (e.g. "BTC/USDT" → "BTC")
  const assetSymbol = t.pair.split('/')[0] ?? 'BTC'
  const colorMap: Record<string, string> = {
    BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff',
    BNB: '#f3ba2f', XRP: '#00aae4', ADA: '#0033ad',
  }
  const assetColor = colorMap[assetSymbol] ?? '#a78bfa'

  const pnl = t.pnl ?? 0
  const pnlPct = t.pnlPct ?? 0

  return {
    id: parseInt(t.id.replace('bot-', ''), 10) || Date.now(),
    userId: t.userId,
    tradeId: t.id,
    date: dateLabel,
    time: timeLabel,
    type: 'Spot',
    executedBy: 'Trade Bot',
    asset: assetSymbol,
    assetSymbol,
    assetColor,
    pair: t.pair,
    side: t.side === 'buy' ? 'Buy' : 'Sell',
    amount: t.amount,
    amountUsd: t.amount * t.entryPrice,
    entryPrice: t.entryPrice,
    exitPrice: t.exitPrice ?? t.entryPrice,
    profitLoss: pnl,
    plPct: pnlPct,
    status: t.status === 'open' ? 'processing' : 'completed',
    botTradeId: t.id,
    signal: t.signal,
    strategy: t.strategy,
  }
}

type TabKey = 'all' | 'bot' | 'user'

// ─── Main component ───────────────────────────────────────────────────────────
export default function History() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [trades, setTrades] = useState<TradeHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const PAGE_SIZE = 10

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)

    Promise.all([
      getTradeHistory(user.id),
      get<BotTrade[]>(ENDPOINTS.botTrades(user.id)).catch(() => [] as BotTrade[]),
    ])
      .then(([history, botTrades]) => {
        const botRows = botTrades.map(botTradeToHistory)
        // Merge: bot trades first (newest activity), then static history
        setTrades([...botRows, ...history])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.id])

  if (!isAuthenticated) return null

  const tabFiltered = useMemo(() => {
    if (tab === 'bot')  return trades.filter((t) => t.executedBy === 'Trade Bot')
    if (tab === 'user') return trades.filter((t) => t.executedBy === 'You')
    return trades
  }, [trades, tab])

  const searched = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return tabFiltered
    return tabFiltered.filter(
      (t) =>
        t.tradeId.toLowerCase().includes(q) ||
        t.asset.toLowerCase().includes(q) ||
        t.pair.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.side.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q),
    )
  }, [tabFiltered, search])

  const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE))
  const paginated = searched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all',  label: 'All History' },
    { key: 'bot',  label: 'Bot Trades' },
    { key: 'user', label: 'User Trades' },
  ]

  // ── Row click handler ──────────────────────────────────────────────────────
  const handleRowClick = (trade: TradeHistory) => {
    navigate('/user/trade', {
      state: {
        tradeId:     trade.botTradeId ?? trade.tradeId,
        pair:        trade.pair,
        side:        trade.side,
        entryPrice:  trade.entryPrice,
        exitPrice:   trade.exitPrice,
        profitLoss:  trade.profitLoss,
        plPct:       trade.plPct,
        signal:      trade.signal ?? null,
        strategy:    trade.strategy ?? null,
        status:      trade.status,
        executedBy:  trade.executedBy,
        assetSymbol: trade.assetSymbol,
        assetColor:  trade.assetColor,
        openedAt:    `${trade.date}, ${trade.time}`,
      },
    })
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0d0824' }}>
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#110b2d' }}>

          {/* ── Page header ── */}
          <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-white">Trading History</h1>
              <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                View all trades executed by your Trade Bot and your manual trades.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <i className="fas fa-sliders-h text-xs" />
                Filter
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-xs">May 24, 2024 – Jun 24, 2024</span>
                <i className="fas fa-calendar-alt text-xs" />
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                style={{ background: 'rgba(162,133,57,0.15)', color: '#c9a84c', border: '1px solid rgba(162,133,57,0.3)' }}
              >
                <i className="fas fa-download text-xs" />
                Export
              </button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-1 mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setPage(1) }}
                className="px-4 py-2.5 text-sm font-medium transition-all relative"
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

            {/* Search */}
            <div className="relative ml-auto mb-1">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#4b5563' }} />
              <input
                type="text"
                placeholder="Search trades…"
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
                    {[
                      { label: 'ID',           w: 'w-28' },
                      { label: 'Date & Time',  w: 'w-24' },
                      { label: 'Type',         w: 'w-20' },
                      { label: 'By',           w: 'w-10' },
                      { label: 'Asset',        w: 'w-10' },
                      { label: 'Pair',         w: 'w-24' },
                      { label: 'Side',         w: 'w-14' },
                      { label: 'Amount',       w: 'w-28' },
                      { label: 'Entry Price',  w: 'w-24' },
                      { label: 'Exit Price',   w: 'w-24' },
                      { label: 'Status',       w: 'w-24' },
                    ].map((col) => (
                      <th
                        key={col.label}
                        className={`${col.w} px-3 py-3.5 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap`}
                        style={{ color: '#6b7280' }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="text-center py-12 text-gray-500">
                        <i className="fas fa-spinner fa-spin mr-2" />
                        Loading history…
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-12 text-gray-500">
                        No trades found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((trade, i) => {
                      const isProcessing = trade.status === 'processing'
                      return (
                        <tr
                          key={trade.id}
                          onClick={() => handleRowClick(trade)}
                          className="transition-colors hover:bg-white/[0.05] cursor-pointer"
                          style={{
                            background: isProcessing
                              ? 'rgba(139,92,246,0.04)'
                              : i % 2 === 0
                              ? 'rgba(255,255,255,0.015)'
                              : 'transparent',
                            borderTop: '1px solid rgba(255,255,255,0.04)',
                            borderLeft: isProcessing
                              ? '2px solid rgba(139,92,246,0.5)'
                              : '2px solid transparent',
                          }}
                        >
                          {/* ID */}
                          <td className="px-3 py-3 font-mono text-xs" style={{ color: '#9ca3af' }}>
                            <div className="flex items-center gap-1.5">
                              {isProcessing && (
                                <i className="fas fa-robot text-xs" style={{ color: '#a78bfa' }} />
                              )}
                              {trade.tradeId}
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <p className="text-xs font-medium text-white">{formatDate(trade.date)}</p>
                            <p className="text-xs" style={{ color: '#6b7280' }}>{trade.time}</p>
                          </td>

                          {/* Type */}
                          <td className="px-3 py-3">
                            <TypeBadge type={trade.type} />
                          </td>

                          {/* By */}
                          <td className="px-3 py-3">
                            <ExecutorIcon by={trade.executedBy} />
                          </td>

                          {/* Asset */}
                          <td className="px-3 py-3">
                            <AssetIcon symbol={trade.assetSymbol} color={trade.assetColor} />
                          </td>

                          {/* Pair */}
                          <td className="px-3 py-3 text-xs font-medium text-white whitespace-nowrap">
                            {trade.pair}
                          </td>

                          {/* Side */}
                          <td className="px-3 py-3">
                            <SideBadge side={trade.side} />
                          </td>

                          {/* Amount + P&L */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <p className="text-xs font-medium text-white">
                              {trade.amount} {trade.assetSymbol}
                            </p>
                            {isProcessing ? (
                              <p className="text-xs" style={{ color: '#6b7280' }}>In progress…</p>
                            ) : (
                              <p
                                className="text-xs font-semibold"
                                style={{ color: trade.profitLoss >= 0 ? '#4ade80' : '#f87171' }}
                              >
                                {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss.toFixed(2)}
                              </p>
                            )}
                          </td>

                          {/* Entry Price */}
                          <td className="px-3 py-3 text-xs text-white whitespace-nowrap">
                            ${trade.entryPrice.toLocaleString()}
                          </td>

                          {/* Exit Price */}
                          <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ color: isProcessing ? '#4b5563' : 'white' }}>
                            {isProcessing ? '—' : `$${trade.exitPrice.toLocaleString()}`}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-3">
                            <StatusBadge status={trade.status} />
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
              className="flex items-center justify-between px-5 py-3"
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
                      <span key={`ellipsis-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-gray-500">
                        …
                      </span>
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
