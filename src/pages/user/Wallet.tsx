import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTransactions } from '../../hooks/useTransactions'
import DashboardLayout from '../../components/dashboard/DashboardLayout'

// ─── Card themes ────────────────────────────────────────────────────────────
const CARD_THEMES = [
  { bg: 'linear-gradient(135deg,#c4b5fd 0%,#a78bfa 100%)', text: '#fff', toggle: '#7c3aed' },
  { bg: 'linear-gradient(135deg,#a5b4fc 0%,#818cf8 100%)', text: '#fff', toggle: '#4338ca' },
  { bg: 'linear-gradient(135deg,#1e1b3a 0%,#0d0824 100%)', text: '#fff', toggle: '#fff' },
  { bg: 'linear-gradient(135deg,#bbf7d0 0%,#86efac 100%)', text: '#14532d', toggle: '#16a34a' },
]

// ─── Candlestick chart data ──────────────────────────────────────────────────
const CANDLES: [number, number, number, number][] = [
  [380, 420, 360, 400],
  [400, 440, 390, 320],
  [320, 380, 300, 360],
  [360, 400, 340, 380],
  [380, 460, 370, 450],
  [450, 500, 440, 480],
  [480, 560, 470, 540],
  [540, 600, 520, 580],
  [580, 640, 560, 300],
  [300, 360, 280, 340],
  [340, 380, 320, 360],
  [360, 420, 350, 400],
]
const X_LABELS = ['06', '07', '08', '09', '10', '11', '12', '13', '14']
const Y_LABELS = [100, 280, 460, 640, 820, 1000]
const Y_MIN = 50
const Y_MAX = 1050
const CHART_W = 500
const CHART_H = 200
const PAD_L = 40
const PAD_R = 10
const PAD_T = 10
const PAD_B = 28

function priceToY(p: number) {
  const ratio = (p - Y_MIN) / (Y_MAX - Y_MIN)
  return CHART_H - PAD_B - ratio * (CHART_H - PAD_T - PAD_B)
}

// ─── Donut chart ─────────────────────────────────────────────────────────────
function DonutChart() {
  const segments = [
    { pct: 56, color: '#a78bfa' },
    { pct: 15, color: '#fde68a' },
    { pct: 15, color: '#c4b5fd' },
    { pct: 14, color: '#818cf8' },
  ]
  const r = 38
  const cx = 50
  const cy = 50
  const circumference = 2 * Math.PI * r
  let offset = 0

  return (
    <svg viewBox="0 0 100 100" width="100" height="100" className="flex-shrink-0">
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circumference
        const gap = circumference - dash
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
          />
        )
        offset += dash
        return el
      })}
      {/* hole */}
      <circle cx={cx} cy={cy} r={24} fill="#1a1040" />
    </svg>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function Wallet() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const { transactions } = useTransactions(user?.id)

  const [activeCard, setActiveCard] = useState(2) // dark card active by default
  const [activeTab, setActiveTab] = useState<'Week' | 'Month' | 'Year'>('Week')
  const [activeActivity, setActiveActivity] = useState<'Week' | 'Month' | 'Year'>('Week')
  const [cardTheme, setCardTheme] = useState(2)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Show loading or redirect message while checking auth
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#0d0824' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#c9a84c' }} />
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const candleW = (CHART_W - PAD_L - PAD_R) / CANDLES.length
  const candleBodyW = Math.max(candleW * 0.5, 6)

  return (
    <DashboardLayout>
      <main
        className="flex-1 overflow-y-auto p-4 sm:p-6"
        style={{ backgroundColor: '#110b2d' }}
      >
          {/* ── Page heading ── */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">My Wallet</h2>
          </div>

          {/* ══════════════════════════════════════════════
              MY CARD section
          ══════════════════════════════════════════════ */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">My Card</h3>
              <button
                className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: '#c9a84c' }}
              >
                <i className="fas fa-plus-circle text-xs" />
                Add wallet
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {CARD_THEMES.map((theme, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveCard(idx); setCardTheme(idx) }}
                  className="relative rounded-2xl p-4 text-left transition-all focus:outline-none"
                  style={{
                    background: theme.bg,
                    border: activeCard === idx ? '2px solid #c9a84c' : '2px solid transparent',
                    minHeight: '120px',
                  }}
                >
                  {/* decorative circles */}
                  <div
                    className="absolute right-3 top-3 w-14 h-14 rounded-full opacity-20"
                    style={{ background: theme.text === '#fff' ? '#fff' : '#000' }}
                  />
                  <div
                    className="absolute right-8 top-8 w-10 h-10 rounded-full opacity-10"
                    style={{ background: theme.text === '#fff' ? '#fff' : '#000' }}
                  />

                  <p className="text-xs font-medium mb-1 opacity-70" style={{ color: theme.text }}>
                    Main Wallet
                  </p>
                  <p className="text-lg font-bold mb-4" style={{ color: theme.text }}>
                    $48,200,00
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs opacity-60" style={{ color: theme.text }}>
                      6219 8610 2888 8075
                    </p>
                    {/* toggle pill */}
                    <div
                      className="w-9 h-5 rounded-full flex items-center px-0.5 transition-all"
                      style={{
                        background: activeCard === idx ? theme.toggle : 'rgba(255,255,255,0.2)',
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full bg-white shadow transition-transform"
                        style={{ transform: activeCard === idx ? 'translateX(16px)' : 'translateX(0)' }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              CARD DETAILS section
          ══════════════════════════════════════════════ */}
          <section
            className="rounded-2xl p-6 mb-6"
            style={{
              background: 'rgba(22,15,53,0.9)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white">Card Details</h3>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                  <i className="fas fa-hashtag text-xs" />
                  Generate Number
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                  <i className="fas fa-edit text-xs" />
                  Edit
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left – card fields */}
              <div className="space-y-0">
                {[
                  { label: 'Card name', value: 'Main Wallet' },
                  { label: 'Valid Date', value: '08/26' },
                  { label: 'Card Number', value: '**** **** 2888 8075' },
                  { label: 'Bank Name', value: 'XYZ Central Bank' },
                  { label: 'Card Holder', value: `${user?.firstName ?? 'Jonathan'} ${user?.lastName ?? 'Smith'}` },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-sm text-gray-400">{row.label}</span>
                    <span className="text-sm font-medium text-white">{row.value}</span>
                  </div>
                ))}

                {/* Theme row */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-400">Theme</span>
                  <div className="flex items-center gap-2">
                    {CARD_THEMES.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => setCardTheme(i)}
                        className="w-5 h-5 rounded-full border-2 transition-all"
                        style={{
                          background: t.bg,
                          borderColor: cardTheme === i ? '#c9a84c' : 'transparent',
                        }}
                        aria-label={`Theme ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right – monthly limits + donut */}
              <div>
                <div className="flex items-start gap-6">
                  <div className="flex-1 space-y-4">
                    <h4 className="text-sm font-semibold text-white">Monthly Limits</h4>

                    {[
                      { label: 'Main Limits', sub: '$10,000', pct: 66, color: '#4ade80' },
                      { label: 'Seconds', sub: '$500', pct: 31, color: '#a78bfa' },
                      { label: 'Others', sub: '$100', pct: 7, color: '#818cf8' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="text-xs font-medium text-white">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.sub}</p>
                          </div>
                          <span className="text-xs text-gray-400">{item.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${item.pct}%`, background: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Donut + legend */}
                  <div className="flex flex-col items-center gap-3">
                    <DonutChart />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      {[
                        { label: 'Grocery', pct: '56%', color: '#a78bfa' },
                        { label: 'Shopping', pct: '15%', color: '#fde68a' },
                        { label: 'Health', pct: '56%', color: '#818cf8' },
                        { label: 'Rent', pct: '15%', color: '#c4b5fd' },
                      ].map((l) => (
                        <span key={l.label} className="flex items-center gap-1 text-gray-400">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
                          {l.label} <span className="text-white font-medium">{l.pct}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              BOTTOM ROW: Overview Balance + Wallet Activity
          ══════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Overview Balance (candlestick chart) ── */}
            <div
              className="lg:col-span-3 rounded-2xl p-5"
              style={{
                background: 'rgba(22,15,53,0.9)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="text-base font-semibold text-white">Overview Balance</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Avg. income</p>
                </div>
                <button
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {activeTab} (2023)
                  <i className="fas fa-chevron-down text-xs" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs text-gray-500">
                  Last Week <span style={{ color: '#c9a84c' }}>$583,443</span>
                </span>
                <span className="text-xl font-bold text-white">$557, 235.31</span>
                <span
                  className="text-xs font-medium px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}
                >
                  +7%
                </span>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-4">
                {(['Week', 'Month', 'Year'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                    style={
                      activeTab === t
                        ? { background: '#1e1b3a', color: '#fff' }
                        : { color: '#6b7280' }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Candlestick SVG */}
              <svg
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                width="100%"
                preserveAspectRatio="xMidYMid meet"
                aria-label="Overview balance candlestick chart"
              >
                {/* Grid lines + Y labels */}
                {Y_LABELS.map((price) => {
                  const y = priceToY(price)
                  return (
                    <g key={price}>
                      <line
                        x1={PAD_L} y1={y}
                        x2={CHART_W - PAD_R} y2={y}
                        stroke="rgba(255,255,255,0.05)" strokeWidth="1"
                      />
                      <text x={PAD_L - 4} y={y + 3} textAnchor="end" fontSize="9" fill="#6b7280">
                        {price >= 1000 ? `${price / 1000}k` : price}
                      </text>
                    </g>
                  )
                })}

                {/* Candles */}
                {CANDLES.map(([open, high, low, close], i) => {
                  const x = PAD_L + i * candleW + candleW / 2
                  const isBull = close >= open
                  const color = '#c4b5fd'
                  const bodyTop = priceToY(Math.max(open, close))
                  const bodyBot = priceToY(Math.min(open, close))
                  const bodyH = Math.max(bodyBot - bodyTop, 2)
                  return (
                    <g key={i}>
                      <line
                        x1={x} y1={priceToY(high)}
                        x2={x} y2={priceToY(low)}
                        stroke={color} strokeWidth="1.5"
                      />
                      <rect
                        x={x - candleBodyW / 2} y={bodyTop}
                        width={candleBodyW} height={bodyH}
                        fill={isBull ? '#c4b5fd' : 'rgba(196,181,253,0.3)'}
                        stroke={color} strokeWidth="0.5" rx="2"
                      />
                    </g>
                  )
                })}

                {/* X labels */}
                {X_LABELS.map((label, i) => {
                  const x = PAD_L + (i / (X_LABELS.length - 1)) * (CHART_W - PAD_L - PAD_R)
                  return (
                    <text key={label} x={x} y={CHART_H - 6} textAnchor="middle" fontSize="9" fill="#6b7280">
                      {label}
                    </text>
                  )
                })}
              </svg>
            </div>

            {/* ── Wallet Activity ── */}
            <div
              className="lg:col-span-2 rounded-2xl p-5 flex flex-col"
              style={{
                background: 'rgba(22,15,53,0.9)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">Wallet Activity</h3>
                <div
                  className="flex items-center rounded-lg p-0.5 gap-0.5"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  {(['Week', 'Month', 'Year'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveActivity(t)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                      style={
                        activeActivity === t
                          ? { background: '#1e1b3a', color: '#fff' }
                          : { color: '#6b7280' }
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity list */}
              <div className="flex-1 overflow-y-auto space-y-1">
                {/* Today group */}
                <p className="text-xs text-gray-500 mb-2">Today</p>

                {transactions.length > 0
                  ? transactions.slice(0, 3).map((tx) => (
                      <ActivityRow
                        key={tx.id}
                        label={`${tx.coin} Trade`}
                        time={tx.time}
                        amount={`$${tx.amount.toLocaleString()}`}
                        status={tx.status}
                        isNegative={false}
                      />
                    ))
                  : (
                    <>
                      <ActivityRow label="ATM Cash withdrawal" time="06:24:45 AM" amount="-$201.50" status="completed" isNegative />
                      <ActivityRow label="ATM Cash withdrawal" time="06:24:45 AM" amount="-$201.50" status="completed" isNegative />
                    </>
                  )
                }

                {/* 24 August group */}
                <p className="text-xs text-gray-500 mt-4 mb-2">24 August</p>
                <ActivityRow label="ATM Cash withdrawal" time="06:24:45 AM" amount="-$201.50" status="completed" isNegative />
              </div>

              {/* View All */}
              <button
                className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                style={{ color: '#c9a84c' }}
              >
                View All
                <i className="fas fa-external-link-alt text-xs" />
              </button>
            </div>

          </div>
        </main>
    </DashboardLayout>
  )
}

// ─── Activity row sub-component ───────────────────────────────────────────────
function ActivityRow({
  label,
  time,
  amount,
  status,
  isNegative,
}: {
  label: string
  time: string
  amount: string
  status: string
  isNegative?: boolean
}) {
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}
      >
        <i className="fas fa-arrow-down text-xs" style={{ color: '#4ade80' }} />
      </div>

      {/* Label + time */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">{label}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>

      {/* Amount + status */}
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-semibold" style={{ color: isNegative ? '#f87171' : '#4ade80' }}>
          {amount}
        </p>
        <p
          className="text-xs"
          style={{ color: status === 'completed' ? '#4ade80' : '#fbbf24' }}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </p>
      </div>
    </div>
  )
}
