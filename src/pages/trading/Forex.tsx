import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import SectionBackground from '../../components/ui/SectionBackground'
import SectionHeader from '../../components/ui/SectionHeader'
import Badge from '../../components/ui/Badge'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ForexPair {
  symbol: string
  flag: string
  price: string
  change: string
  positive: boolean
}

interface MarketRow {
  symbol: string
  name: string
  bid: string
  ask: string
  spread: string
  change: string
  positive: boolean
  category: 'major' | 'minor' | 'exotic'
}

interface FeatureCard {
  icon: string
  title: string
  description: string
}

interface ToolItem {
  id: number
  title: string
  description: string
}

interface StepCard {
  number: string
  icon: string
  title: string
  description: string
}

// ─── Static data ──────────────────────────────────────────────────────────────

const heroPairs: ForexPair[] = [
  { symbol: 'EUR/USD', flag: '🇪🇺', price: '1.08542', change: '+0.12%', positive: true },
  { symbol: 'GBP/USD', flag: '🇬🇧', price: '1.26731', change: '+0.08%', positive: true },
  { symbol: 'USD/JPY', flag: '🇯🇵', price: '149.823', change: '-0.21%', positive: false },
  { symbol: 'AUD/USD', flag: '🇦🇺', price: '0.65412', change: '-0.05%', positive: false },
]

const marketRows: MarketRow[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar',          bid: '1.08538', ask: '1.08542', spread: '0.4', change: '+0.12%', positive: true,  category: 'major' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', bid: '1.26727', ask: '1.26731', spread: '0.4', change: '+0.08%', positive: true,  category: 'major' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen',  bid: '149.819', ask: '149.823', spread: '0.5', change: '-0.21%', positive: false, category: 'major' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc',   bid: '0.89612', ask: '0.89618', spread: '0.6', change: '+0.04%', positive: true,  category: 'major' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / USD',   bid: '0.65408', ask: '0.65412', spread: '0.4', change: '-0.05%', positive: false, category: 'major' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar',bid: '1.36241', ask: '1.36247', spread: '0.6', change: '+0.09%', positive: true,  category: 'major' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / USD',  bid: '0.60312', ask: '0.60318', spread: '0.6', change: '-0.14%', positive: false, category: 'major' },
  { symbol: 'EUR/GBP', name: 'Euro / British Pound',      bid: '0.85621', ask: '0.85629', spread: '0.8', change: '+0.03%', positive: true,  category: 'minor' },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen',       bid: '162.541', ask: '162.549', spread: '0.8', change: '-0.10%', positive: false, category: 'minor' },
  { symbol: 'GBP/JPY', name: 'British Pound / Yen',       bid: '189.712', ask: '189.722', spread: '1.0', change: '-0.18%', positive: false, category: 'minor' },
  { symbol: 'AUD/JPY', name: 'Australian Dollar / Yen',   bid: '97.9812', ask: '97.9912', spread: '1.0', change: '-0.26%', positive: false, category: 'minor' },
  { symbol: 'EUR/AUD', name: 'Euro / Australian Dollar',  bid: '1.65912', ask: '1.65924', spread: '1.2', change: '+0.17%', positive: true,  category: 'minor' },
  { symbol: 'GBP/CHF', name: 'British Pound / Swiss Franc',bid: '1.13421', ask: '1.13433', spread: '1.2', change: '+0.05%', positive: true,  category: 'minor' },
  { symbol: 'USD/TRY', name: 'US Dollar / Turkish Lira',  bid: '32.1240', ask: '32.1340', spread: '10.0',change: '+0.31%', positive: true,  category: 'exotic' },
  { symbol: 'USD/ZAR', name: 'US Dollar / South African Rand', bid: '18.7412', ask: '18.7512', spread: '10.0', change: '-0.42%', positive: false, category: 'exotic' },
  { symbol: 'USD/MXN', name: 'US Dollar / Mexican Peso',  bid: '17.1241', ask: '17.1341', spread: '10.0',change: '+0.22%', positive: true,  category: 'exotic' },
  { symbol: 'USD/SGD', name: 'US Dollar / Singapore Dollar', bid: '1.34121', ask: '1.34131', spread: '1.0', change: '+0.06%', positive: true, category: 'exotic' },
  { symbol: 'USD/HKD', name: 'US Dollar / Hong Kong Dollar', bid: '7.82412', ask: '7.82422', spread: '1.0', change: '-0.01%', positive: false, category: 'exotic' },
  { symbol: 'EUR/NOK', name: 'Euro / Norwegian Krone',    bid: '11.5412', ask: '11.5432', spread: '2.0', change: '+0.14%', positive: true,  category: 'exotic' },
  { symbol: 'USD/SEK', name: 'US Dollar / Swedish Krona', bid: '10.4121', ask: '10.4141', spread: '2.0', change: '-0.08%', positive: false, category: 'exotic' },
]

const featureCards: FeatureCard[] = [
  {
    icon: 'fas fa-percentage',
    title: 'Competitive Spreads',
    description: 'Trade major forex pairs with tight spreads starting from 0.0 pips. Our deep liquidity pool ensures you always get the best available price.',
  },
  {
    icon: 'fas fa-chart-line',
    title: 'Powerful Leverage',
    description: 'Amplify your trading potential with leverage up to 1:500 on major currency pairs. Trade larger positions with a smaller initial capital outlay.',
  },
  {
    icon: 'fas fa-shield-alt',
    title: 'Advanced Risk Management',
    description: 'Protect your capital with built-in stop loss, take profit, and trailing stop tools. Set your risk parameters and trade with confidence.',
  },
]

const toolItems: ToolItem[] = [
  {
    id: 1,
    title: 'Real-time Forex Quotes',
    description: 'Access live streaming prices for all major, minor, and exotic currency pairs. Our real-time data feed ensures you never miss a market move, with bid/ask prices updating every millisecond.',
  },
  {
    id: 2,
    title: 'Advanced Charting',
    description: 'Powered by TradingView, our advanced charting suite offers 100+ technical indicators, multiple chart types, and drawing tools. Analyze price action with precision on any timeframe.',
  },
  {
    id: 3,
    title: 'Economic Calendar',
    description: 'Stay ahead of market-moving events with our integrated economic calendar. Track central bank decisions, NFP releases, CPI data, and other high-impact events that drive forex volatility.',
  },
]

const steps: StepCard[] = [
  { number: '01', icon: 'fas fa-search',    title: 'Discover Forex',  description: 'Explore the world\'s largest financial market. Learn about currency pairs, pips, and how forex trading works.' },
  { number: '02', icon: 'fas fa-user-plus', title: 'Open Account',    description: 'Create your free trading account in minutes. Complete verification and fund your account to get started.' },
  { number: '03', icon: 'fas fa-rocket',    title: 'Start Trading',   description: 'Place your first forex trade. Use our advanced tools and real-time data to execute your strategy.' },
]

const whyItems = [
  'Trade Forex, Indices, Shares & Commodities',
  'Access global markets 24 hours / 5 days a week',
  'Multilingual customer support',
  'Trade on the go on our mobile apps',
]

// ─── Hero price card ──────────────────────────────────────────────────────────

function PriceCard({ pair }: { pair: ForexPair }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border"
      style={{
        backgroundColor: 'rgba(22,15,53,0.8)',
        borderColor: 'rgba(162,133,57,0.25)',
      }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
        style={{ backgroundColor: 'rgba(162,133,57,0.12)' }}
      >
        {pair.flag}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-400">Price</div>
        <div className="text-sm font-bold text-white truncate">{pair.price}</div>
      </div>
      <div className="ml-auto text-right">
        <div className="text-xs text-gray-400">{pair.symbol}</div>
        <div
          className="text-xs font-semibold"
          style={{ color: pair.positive ? '#4ade80' : '#f87171' }}
        >
          {pair.change}
        </div>
      </div>
    </div>
  )
}

// ─── Market Table ─────────────────────────────────────────────────────────────

type TabFilter = 'major' | 'minor' | 'exotic' | 'all'

function MarketTable() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all')

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'major',  label: 'Majors' },
    { key: 'minor',  label: 'Minors' },
    { key: 'exotic', label: 'Exotics' },
    { key: 'all',    label: 'All Pairs' },
  ]

  const filtered = activeTab === 'all' ? marketRows : marketRows.filter(r => r.category === activeTab)

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={
              activeTab === tab.key
                ? { background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }
                : { backgroundColor: 'rgba(22,15,53,0.6)', color: '#9ca3af', border: '1px solid rgba(162,133,57,0.2)' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-xl border"
        style={{ borderColor: 'rgba(43,25,120,0.4)' }}
      >
        <table className="w-full text-sm" style={{ backgroundColor: 'rgba(17,11,45,0.95)' }}>
          <thead>
            <tr
              className="text-xs uppercase tracking-wider text-gray-500 border-b"
              style={{ borderColor: 'rgba(43,25,120,0.3)' }}
            >
              <th className="px-4 py-3 text-left">Symbol</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-right">Bid</th>
              <th className="px-4 py-3 text-right">Ask</th>
              <th className="px-4 py-3 text-right">Spread</th>
              <th className="px-4 py-3 text-right">Change</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr
                key={row.symbol}
                className="border-b transition-colors hover:bg-white hover:bg-opacity-5"
                style={{
                  borderColor: 'rgba(43,25,120,0.2)',
                  backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(22,15,53,0.3)',
                }}
              >
                <td className="px-4 py-3">
                  <span className="font-semibold text-white text-xs">{row.symbol}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{row.name}</td>
                <td className="px-4 py-3 text-right font-semibold text-white text-xs">{row.bid}</td>
                <td className="px-4 py-3 text-right font-semibold text-white text-xs">{row.ask}</td>
                <td className="px-4 py-3 text-right text-gray-400 text-xs">{row.spread}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{
                      color: row.positive ? '#4ade80' : '#f87171',
                      backgroundColor: row.positive ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                    }}
                  >
                    {row.change}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to="/trade"
                    className="px-3 py-1 rounded text-xs font-semibold transition-all"
                    style={{
                      background: 'linear-gradient(135deg,#a28539,#c9a84c)',
                      color: '#0d0824',
                    }}
                  >
                    Trade
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Advanced Features Section ────────────────────────────────────────────────

function AdvancedFeaturesSection() {
  return (
    <section className="py-20" style={{ backgroundColor: '#110b2d' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <SectionHeader
            badge="Advanced Trading"
            title="Advanced Forex Trading Features"
            subtitle="Everything you need to trade forex like a professional, all in one platform."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map(card => (
            <div
              key={card.title}
              className="rounded-2xl p-6 border flex flex-col gap-4"
              style={{
                backgroundColor: 'rgba(22,15,53,0.8)',
                borderColor: 'rgba(162,133,57,0.25)',
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(162,133,57,0.12)',
                  border: '1px solid rgba(162,133,57,0.3)',
                }}
              >
                <i className={card.icon} style={{ color: '#c9a84c', fontSize: 20 }} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-white">{card.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Professional Tools Section ───────────────────────────────────────────────

function ProfessionalToolsSection() {
  const [openId, setOpenId] = useState<number>(1)

  return (
    <section className="py-20" style={{ backgroundColor: '#160f35' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <SectionHeader
            badge="Platform"
            title="Professional Forex Trading Tools"
            subtitle="Powerful tools designed to give you the edge in the world's most liquid market."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left — accordion */}
          <div className="space-y-3">
            {toolItems.map(item => {
              const isOpen = openId === item.id
              return (
                <div
                  key={item.id}
                  className="rounded-xl border overflow-hidden"
                  style={{
                    borderColor: isOpen ? 'rgba(162,133,57,0.4)' : 'rgba(43,25,120,0.4)',
                    backgroundColor: isOpen ? 'rgba(22,15,53,0.9)' : 'rgba(13,8,36,0.6)',
                  }}
                >
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                    onClick={() => setOpenId(isOpen ? 0 : item.id)}
                  >
                    <span className="font-semibold text-white text-sm">{item.title}</span>
                    <i
                      className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-xs`}
                      style={{ color: '#c9a84c' }}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4">
                      <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right — mock price panel */}
          <div
            className="rounded-2xl border p-6"
            style={{
              backgroundColor: 'rgba(13,8,36,0.9)',
              borderColor: 'rgba(162,133,57,0.25)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-bold text-lg">EUR/USD</span>
              <span
                className="text-xs px-2 py-0.5 rounded font-semibold"
                style={{ backgroundColor: 'rgba(74,222,128,0.1)', color: '#4ade80' }}
              >
                LIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
              >
                <div className="text-xs text-gray-400 mb-1">BID</div>
                <div className="text-2xl font-extrabold" style={{ color: '#f87171' }}>1.08538</div>
              </div>
              <div
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}
              >
                <div className="text-xs text-gray-400 mb-1">ASK</div>
                <div className="text-2xl font-extrabold" style={{ color: '#4ade80' }}>1.08542</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
              <span>Spread: <span className="text-white font-semibold">0.4 pips</span></span>
              <span>Change: <span style={{ color: '#4ade80' }} className="font-semibold">+0.12%</span></span>
            </div>

            {/* Mini chart placeholder */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: 'rgba(22,15,53,0.6)', border: '1px solid rgba(43,25,120,0.3)', height: 100 }}
            >
              <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a28539" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#a28539" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  points="0,70 30,65 60,72 90,55 120,60 150,45 180,50 210,38 240,42 270,35 300,30"
                  fill="none"
                  stroke="#c9a84c"
                  strokeWidth="2"
                />
                <polygon
                  points="0,70 30,65 60,72 90,55 120,60 150,45 180,50 210,38 240,42 270,35 300,30 300,100 0,100"
                  fill="url(#chartGrad)"
                />
              </svg>
            </div>

            <div className="mt-4">
              <Link
                to="/trade"
                className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }}
              >
                Trade EUR/USD
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── How to Start Section ─────────────────────────────────────────────────────

function HowToStartSection() {
  return (
    <section className="py-20" style={{ backgroundColor: '#0d0824' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <SectionHeader
            badge="Get Started"
            title="How to Start Trading Forex"
            subtitle="Get up and running in three simple steps and start trading the world's most liquid market."
          />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map(step => (
            <div
              key={step.number}
              className="rounded-2xl p-6 border text-center flex flex-col items-center gap-4"
              style={{
                backgroundColor: 'rgba(22,15,53,0.8)',
                borderColor: 'rgba(162,133,57,0.25)',
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg,#a28539,#c9a84c)',
                }}
              >
                <i className={step.icon} style={{ color: '#0d0824', fontSize: 22 }} aria-hidden="true" />
              </div>
              <div
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#a28539' }}
              >
                Step {step.number}
              </div>
              <h3 className="text-lg font-bold text-white">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Info panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="rounded-2xl p-6 border"
            style={{
              backgroundColor: 'rgba(22,15,53,0.8)',
              borderColor: 'rgba(162,133,57,0.25)',
            }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i className="fas fa-star" style={{ color: '#c9a84c' }} aria-hidden="true" />
              Why Trade Forex?
            </h3>
            <ul className="space-y-3">
              {[
                'Largest financial market — $6.6 trillion daily volume',
                'Trade 24 hours a day, 5 days a week',
                'High liquidity means tight spreads and fast execution',
                'Leverage amplifies your trading potential',
                'Profit in both rising and falling markets',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(162,133,57,0.15)', border: '1px solid rgba(162,133,57,0.4)' }}
                  >
                    <i className="fas fa-check text-xs" style={{ color: '#a28539' }} aria-hidden="true" />
                  </span>
                  <span className="text-gray-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-2xl p-6 border"
            style={{
              backgroundColor: 'rgba(22,15,53,0.8)',
              borderColor: 'rgba(162,133,57,0.25)',
            }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i className="fas fa-clock" style={{ color: '#c9a84c' }} aria-hidden="true" />
              Market Hours
            </h3>
            <div className="space-y-3">
              {[
                { session: 'Sydney Session',  hours: '10:00 PM – 7:00 AM GMT',  active: false },
                { session: 'Tokyo Session',   hours: '12:00 AM – 9:00 AM GMT',  active: false },
                { session: 'London Session',  hours: '8:00 AM – 5:00 PM GMT',   active: true  },
                { session: 'New York Session',hours: '1:00 PM – 10:00 PM GMT',  active: true  },
              ].map(s => (
                <div
                  key={s.session}
                  className="flex items-center justify-between py-2 border-b"
                  style={{ borderColor: 'rgba(43,25,120,0.3)' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: s.active ? '#4ade80' : '#6b7280' }}
                    />
                    <span className="text-gray-300 text-sm">{s.session}</span>
                  </div>
                  <span className="text-gray-400 text-xs">{s.hours}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-3">Forex market is open 24/5 — Sunday 10 PM to Friday 10 PM GMT.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Trading Flexibility Section ──────────────────────────────────────────────

function TradingFlexibilitySection() {
  return (
    <section className="py-20" style={{ backgroundColor: '#110b2d' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <Badge withDot>Trading Flexibility</Badge>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Trade what you want,{' '}
            <span
              style={{
                background: 'linear-gradient(90deg,#a28539,#c9a84c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              When you want
            </span>
          </h2>
          <p className="mt-3 text-gray-400 max-w-xl mx-auto">
            Our platform provides you with the tools and access you need for successful forex trading.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ background: 'radial-gradient(circle at 30% 50%, rgba(162,133,57,0.15), transparent 70%)' }}
              aria-hidden="true"
            />
            <div
              className="relative rounded-2xl overflow-hidden border"
              style={{ borderColor: 'rgba(162,133,57,0.2)' }}
            >
              <img
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80"
                alt="Forex trading platform"
                className="w-full h-72 object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              One of the primary goals of Charles Schwab is to provide the best product in the
              market. Our relationships with leading tier one financial institutions mean deep
              liquidity and tighter spreads for Forex traders.
            </p>
            <ul className="space-y-3">
              {whyItems.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(162,133,57,0.15)', border: '1px solid rgba(162,133,57,0.4)' }}
                  >
                    <i className="fas fa-check text-xs" style={{ color: '#a28539' }} aria-hidden="true" />
                  </span>
                  <span className="text-gray-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Button variant="ghost-gold" to="/register">
              Learn More <Icon name="fas fa-arrow-right ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CtaBanner() {
  return (
    <section
      className="py-16"
      style={{
        background: 'linear-gradient(135deg, #1a0f4f 0%, #2b1978 50%, #1a0f4f 100%)',
        borderTop: '1px solid rgba(162,133,57,0.2)',
        borderBottom: '1px solid rgba(162,133,57,0.2)',
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          Start Your{' '}
          <span
            style={{
              background: 'linear-gradient(90deg,#a28539,#c9a84c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Forex Trading Journey
          </span>
        </h2>
        <p className="text-gray-300">
          Join thousands of traders using our platform to access the world's largest financial market.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="ghost-gold" to="/register">
            <Icon name="fas fa-rocket mr-2" /> Create Free Account
          </Button>
          <Button variant="login" to="/login">
            <Icon name="fas fa-sign-in-alt mr-2" /> Login
          </Button>
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Forex() {
  return (
    <>
      {/* ── Hero ── */}
      <SectionBackground withOrbs>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: '#a28539' }}
                >
                  Forex Market
                </span>
                <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold text-white leading-tight">
                  Forex
                </h1>
                <h2
                  className="text-3xl sm:text-4xl font-extrabold leading-tight"
                  style={{
                    background: 'linear-gradient(90deg,#a28539,#c9a84c)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Foreign Exchange Market
                </h2>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-lg">
                The foreign exchange market is the world's largest and most liquid financial market,
                with over $6.6 trillion traded daily. Trade major, minor, and exotic currency pairs
                with tight spreads, deep liquidity, and powerful leverage on our advanced platform.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost-gold" to="/trade">
                  <Icon name="fas fa-chart-line mr-2" /> View Markets
                </Button>
                <Button variant="start-trading" to="/register">
                  <Icon name="fas fa-rocket mr-2" /> Start Trading
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {heroPairs.map(pair => (
                <PriceCard key={pair.symbol} pair={pair} />
              ))}
            </div>
          </div>
        </div>
      </SectionBackground>

      {/* ── Market Overview ── */}
      <section className="py-16" style={{ backgroundColor: '#0d0824' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <SectionHeader
              badge="Live Markets"
              title="Market Overview"
              subtitle="Live forex rates for major, minor, and exotic currency pairs. Trade directly from the table."
            />
          </div>
          <MarketTable />
        </div>
      </section>

      {/* ── Advanced Features ── */}
      <AdvancedFeaturesSection />

      {/* ── Professional Tools ── */}
      <ProfessionalToolsSection />

      {/* ── How to Start ── */}
      <HowToStartSection />

      {/* ── Trading Flexibility ── */}
      <TradingFlexibilitySection />

      {/* ── CTA ── */}
      <CtaBanner />
    </>
  )
}
