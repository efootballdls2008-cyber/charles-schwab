import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import SectionBackground from '../../components/ui/SectionBackground'
import SectionHeader from '../../components/ui/SectionHeader'
import Badge from '../../components/ui/Badge'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EtfHeroCard {
  symbol: string
  name: string
  icon: string
  iconColor: string
  price: string
  change: string
  positive: boolean
}

interface EtfRow {
  symbol: string
  name: string
  price: string
  change: string
  expenseRatio: string
  positive: boolean
  category: 'equity' | 'bond' | 'commodity' | 'all'
}

interface FeatureCard {
  icon: string
  title: string
  description: string
}

interface CategoryCard {
  icon: string
  title: string
  description: string
  count: number
}

interface StepCard {
  number: string
  icon: string
  title: string
  description: string
}

// ─── Static data ──────────────────────────────────────────────────────────────

const heroCards: EtfHeroCard[] = [
  { symbol: 'SPY',  name: 'S&P 500 ETF',    icon: 'fas fa-chart-bar',    iconColor: '#4ade80', price: '$478.32', change: '+0.84%', positive: true  },
  { symbol: 'QQQ',  name: 'Nasdaq 100 ETF', icon: 'fas fa-microchip',    iconColor: '#627eea', price: '$412.17', change: '+1.12%', positive: true  },
  { symbol: 'GLD',  name: 'Gold ETF',       icon: 'fas fa-coins',        iconColor: '#c9a84c', price: '$189.54', change: '-0.23%', positive: false },
  { symbol: 'VTI',  name: 'Total Market',   icon: 'fas fa-globe-americas',iconColor: '#38bdf8', price: '$231.88', change: '+0.61%', positive: true  },
]

const etfRows: EtfRow[] = [
  { symbol: 'SPY',  name: 'SPDR S&P 500 ETF Trust',          price: '$478.32', change: '+0.84%', expenseRatio: '0.09%', positive: true,  category: 'equity'    },
  { symbol: 'QQQ',  name: 'Invesco QQQ Trust',               price: '$412.17', change: '+1.12%', expenseRatio: '0.20%', positive: true,  category: 'equity'    },
  { symbol: 'IWM',  name: 'iShares Russell 2000 ETF',        price: '$198.45', change: '+0.37%', expenseRatio: '0.19%', positive: true,  category: 'equity'    },
  { symbol: 'VTI',  name: 'Vanguard Total Stock Market ETF', price: '$231.88', change: '+0.61%', expenseRatio: '0.03%', positive: true,  category: 'equity'    },
  { symbol: 'EEM',  name: 'iShares MSCI Emerging Markets',   price: '$39.72',  change: '-0.45%', expenseRatio: '0.68%', positive: false, category: 'equity'    },
  { symbol: 'XLF',  name: 'Financial Select Sector SPDR',    price: '$38.91',  change: '+0.22%', expenseRatio: '0.10%', positive: true,  category: 'equity'    },
  { symbol: 'XLE',  name: 'Energy Select Sector SPDR',       price: '$87.34',  change: '-0.18%', expenseRatio: '0.10%', positive: false, category: 'equity'    },
  { symbol: 'ARKK', name: 'ARK Innovation ETF',              price: '$48.21',  change: '+2.34%', expenseRatio: '0.75%', positive: true,  category: 'equity'    },
  { symbol: 'TLT',  name: 'iShares 20+ Year Treasury Bond',  price: '$92.14',  change: '-0.31%', expenseRatio: '0.15%', positive: false, category: 'bond'      },
  { symbol: 'AGG',  name: 'iShares Core US Aggregate Bond',  price: '$96.87',  change: '-0.12%', expenseRatio: '0.03%', positive: false, category: 'bond'      },
  { symbol: 'GLD',  name: 'SPDR Gold Shares',                price: '$189.54', change: '-0.23%', expenseRatio: '0.40%', positive: false, category: 'commodity' },
  { symbol: 'SLV',  name: 'iShares Silver Trust',            price: '$22.18',  change: '-0.54%', expenseRatio: '0.50%', positive: false, category: 'commodity' },
  { symbol: 'SQQQ', name: 'ProShares UltraPro Short QQQ',    price: '$8.43',   change: '-3.21%', expenseRatio: '0.95%', positive: false, category: 'equity'    },
]

const featureCards: FeatureCard[] = [
  {
    icon: 'fas fa-layer-group',
    title: 'Instant Diversification',
    description: 'A single ETF gives you exposure to dozens or hundreds of securities. Spread your risk across entire markets, sectors, or asset classes with one trade.',
  },
  {
    icon: 'fas fa-tag',
    title: 'Lower Costs',
    description: 'ETFs typically carry lower expense ratios than mutual funds. Combined with our competitive spreads, you keep more of your returns working for you.',
  },
  {
    icon: 'fas fa-exchange-alt',
    title: 'Flexibility',
    description: 'Trade ETFs like stocks throughout the trading day. Go long or short, use leverage, and access equity, bond, commodity, and sector ETFs all in one place.',
  },
]

const categoryCards: CategoryCard[] = [
  {
    icon: 'fas fa-chart-bar',
    title: 'Equity ETFs',
    description: 'Track stock market indices like the S&P 500, Nasdaq 100, and Russell 2000. Gain broad market exposure or focus on specific regions.',
    count: 48,
  },
  {
    icon: 'fas fa-file-invoice-dollar',
    title: 'Bond ETFs',
    description: 'Access government and corporate bond markets. From short-duration Treasuries to high-yield corporate bonds, manage your fixed income exposure.',
    count: 24,
  },
  {
    icon: 'fas fa-coins',
    title: 'Commodity ETFs',
    description: 'Trade gold, silver, oil, and agricultural commodities through ETFs. Hedge inflation and diversify beyond traditional stocks and bonds.',
    count: 18,
  },
  {
    icon: 'fas fa-industry',
    title: 'Sector ETFs',
    description: 'Target specific sectors like technology, financials, energy, and healthcare. Overweight or underweight sectors based on your market outlook.',
    count: 32,
  },
]

const steps: StepCard[] = [
  { number: '01', icon: 'fas fa-search',    title: 'Choose Your ETF',  description: 'Browse our full ETF catalogue. Filter by asset class, sector, or region to find the right ETF for your strategy.' },
  { number: '02', icon: 'fas fa-user-plus', title: 'Open Account',     description: 'Create your free trading account in minutes. Complete verification and fund your account to get started.' },
  { number: '03', icon: 'fas fa-rocket',    title: 'Start Trading',    description: 'Place your first ETF trade. Use our advanced tools and real-time data to build and manage your portfolio.' },
]

const whyItems = [
  'Trade Equity, Bond, Commodity & Sector ETFs',
  'Access global markets 24 hours / 5 days a week',
  'Multilingual customer support',
  'Trade on the go on our mobile apps',
]

// ─── Hero price card ──────────────────────────────────────────────────────────

function EtfHeroCard({ card }: { card: EtfHeroCard }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border"
      style={{
        backgroundColor: 'rgba(22,15,53,0.8)',
        borderColor: 'rgba(162,133,57,0.25)',
      }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${card.iconColor}22` }}
      >
        <i className={card.icon} style={{ color: card.iconColor, fontSize: 16 }} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-400">Price</div>
        <div className="text-sm font-bold text-white truncate">{card.price}</div>
      </div>
      <div className="ml-auto text-right">
        <div className="text-xs text-gray-400">{card.symbol}</div>
        <div
          className="text-xs font-semibold"
          style={{ color: card.positive ? '#4ade80' : '#f87171' }}
        >
          {card.change}
        </div>
      </div>
    </div>
  )
}

// ─── ETF Market Table ─────────────────────────────────────────────────────────

type TabFilter = 'equity' | 'bond' | 'commodity' | 'all'

function EtfMarketTable() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all')

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'equity',    label: 'Equity' },
    { key: 'bond',      label: 'Bond' },
    { key: 'commodity', label: 'Commodity' },
    { key: 'all',       label: 'All ETFs' },
  ]

  const filtered = activeTab === 'all' ? etfRows : etfRows.filter(r => r.category === activeTab)

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
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">24h Change</th>
              <th className="px-4 py-3 text-right">Expense Ratio</th>
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
                <td className="px-4 py-3 text-right font-semibold text-white text-xs">{row.price}</td>
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
                <td className="px-4 py-3 text-right text-gray-400 text-xs">{row.expenseRatio}</td>
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

// ─── Why Trade ETFs Section ───────────────────────────────────────────────────

function WhyTradeEtfsSection() {
  return (
    <section className="py-20" style={{ backgroundColor: '#110b2d' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <SectionHeader
            badge="Benefits"
            title="Why Trade ETFs with Charles Schwab"
            subtitle="ETFs combine the diversification of mutual funds with the flexibility of stocks — the best of both worlds."
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

// ─── ETF Categories Section ───────────────────────────────────────────────────

function EtfCategoriesSection() {
  return (
    <section className="py-20" style={{ backgroundColor: '#160f35' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <SectionHeader
            badge="Categories"
            title="Explore ETF Categories"
            subtitle="From broad market indices to niche sectors — find the ETF that fits your investment thesis."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categoryCards.map(card => (
            <div
              key={card.title}
              className="rounded-2xl p-6 border flex flex-col gap-4"
              style={{
                backgroundColor: 'rgba(22,15,53,0.8)',
                borderColor: 'rgba(162,133,57,0.25)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(162,133,57,0.12)',
                    border: '1px solid rgba(162,133,57,0.3)',
                  }}
                >
                  <i className={card.icon} style={{ color: '#c9a84c', fontSize: 20 }} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-white">{card.title}</h3>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'rgba(162,133,57,0.12)',
                        border: '1px solid rgba(162,133,57,0.3)',
                        color: '#c9a84c',
                      }}
                    >
                      {card.count} ETFs
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{card.description}</p>
                </div>
              </div>
              <div>
                <Link
                  to="/trade"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-all"
                  style={{ color: '#c9a84c' }}
                >
                  Explore <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How to Trade ETFs Section ────────────────────────────────────────────────

function HowToTradeSection() {
  return (
    <section className="py-20" style={{ backgroundColor: '#0d0824' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <SectionHeader
            badge="Get Started"
            title="How to Trade ETFs"
            subtitle="Start building a diversified portfolio in three simple steps."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                style={{ background: 'linear-gradient(135deg,#a28539,#c9a84c)' }}
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
            Our platform provides you with the tools and access you need for successful ETF trading.
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
                alt="ETF trading platform"
                className="w-full h-72 object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              One of the primary goals of Charles Schwab is to provide the best product in the
              market. Our relationships with leading tier one financial institutions mean deep
              liquidity and competitive pricing for ETF traders.
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
          Start Trading{' '}
          <span
            style={{
              background: 'linear-gradient(90deg,#a28539,#c9a84c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ETFs Today
          </span>
        </h2>
        <p className="text-gray-300">
          Join thousands of traders using our platform to build diversified portfolios with ETFs.
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

export default function ETFs() {
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
                  Exchange-Traded Funds
                </span>
                <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold text-white leading-tight">
                  ETFs
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
                  Diversify with Exchange-Traded Funds
                </h2>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-lg">
                ETFs are baskets of securities traded like individual stocks on an exchange. They
                offer instant diversification across markets, sectors, and asset classes — with the
                flexibility to buy and sell throughout the trading day at market prices.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost-gold" to="/trade">
                  <Icon name="fas fa-chart-line mr-2" /> View ETFs
                </Button>
                <Button variant="start-trading" to="/register">
                  <Icon name="fas fa-rocket mr-2" /> Start Trading
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {heroCards.map(card => (
                <EtfHeroCard key={card.symbol} card={card} />
              ))}
            </div>
          </div>
        </div>
      </SectionBackground>

      {/* ── ETF Market Table ── */}
      <section className="py-16" style={{ backgroundColor: '#0d0824' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <SectionHeader
              badge="Live Markets"
              title="ETF Markets"
              subtitle="Trade CFDs on the world's most popular ETFs with competitive spreads and advanced tools."
            />
          </div>
          <EtfMarketTable />
        </div>
      </section>

      {/* ── Why Trade ETFs ── */}
      <WhyTradeEtfsSection />

      {/* ── ETF Categories ── */}
      <EtfCategoriesSection />

      {/* ── How to Trade ── */}
      <HowToTradeSection />

      {/* ── Trading Flexibility ── */}
      <TradingFlexibilitySection />

      {/* ── CTA ── */}
      <CtaBanner />
    </>
  )
}
