import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import SectionBackground from '../../components/ui/SectionBackground'
import SectionHeader from '../../components/ui/SectionHeader'
import Badge from '../../components/ui/Badge'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CryptoPair {
  symbol: string
  name: string
  icon: string
  iconColor: string
  price: string
  change: string
  positive: boolean
}

interface MarketRow {
  symbol: string
  name: string
  icon: string
  iconColor: string
  price: string
  change: string
  spread: string
  positive: boolean
}

// ─── Static data ──────────────────────────────────────────────────────────────

const heroPairs: CryptoPair[] = [
  { symbol: 'BTC/USD', name: 'Bitcoin',  icon: 'fab fa-bitcoin',   iconColor: '#f7931a', price: '$46,199.20', change: '+2.4%',  positive: true  },
  { symbol: 'ETH/USD', name: 'Ethereum', icon: 'fab fa-ethereum',  iconColor: '#627eea', price: '$2,873.53',  change: '+1.8%',  positive: true  },
  { symbol: 'USDT/USD',name: 'Tether',   icon: 'fas fa-dollar-sign',iconColor: '#26a17b', price: '$1.00',      change: '0.0%',   positive: true  },
  { symbol: 'XRP/USD', name: 'Ripple',   icon: 'fas fa-water',     iconColor: '#00aae4', price: '$0.72',      change: '-0.5%',  positive: false },
]

const marketRows: MarketRow[] = [
  { symbol: 'BTC/USD',  name: 'Bitcoin',   icon: 'fab fa-bitcoin',    iconColor: '#f7931a', price: '$46,199.20', change: '+2.40%', spread: '0.5',  positive: true  },
  { symbol: 'ETH/USD',  name: 'Ethereum',  icon: 'fab fa-ethereum',   iconColor: '#627eea', price: '$2,873.53',  change: '+1.80%', spread: '0.8',  positive: true  },
  { symbol: 'BNB/USD',  name: 'BNB',       icon: 'fas fa-coins',      iconColor: '#f3ba2f', price: '$312.40',    change: '+0.95%', spread: '1.2',  positive: true  },
  { symbol: 'SOL/USD',  name: 'Solana',    icon: 'fas fa-sun',        iconColor: '#9945ff', price: '$98.75',     change: '+3.20%', spread: '1.5',  positive: true  },
  { symbol: 'XRP/USD',  name: 'Ripple',    icon: 'fas fa-water',      iconColor: '#00aae4', price: '$0.72',      change: '-0.50%', spread: '0.3',  positive: false },
  { symbol: 'ADA/USD',  name: 'Cardano',   icon: 'fas fa-circle',     iconColor: '#0033ad', price: '$0.48',      change: '-1.10%', spread: '0.4',  positive: false },
  { symbol: 'DOGE/USD', name: 'Dogecoin',  icon: 'fas fa-dog',        iconColor: '#c2a633', price: '$0.082',     change: '+5.30%', spread: '0.6',  positive: true  },
  { symbol: 'AVAX/USD', name: 'Avalanche', icon: 'fas fa-mountain',   iconColor: '#e84142', price: '$35.60',     change: '+2.10%', spread: '1.8',  positive: true  },
]

const whyItems = [
  'Trade Forex, Indices, Shares & Commodities',
  'Access global markets 24 hours / 7 days',
  'Multilingual customer support',
  'Trade on the go on our mobile apps',
]

// ─── Hero price card ──────────────────────────────────────────────────────────

function PriceCard({ pair }: { pair: CryptoPair }) {
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
        style={{ backgroundColor: `${pair.iconColor}22` }}
      >
        <i className={pair.icon} style={{ color: pair.iconColor, fontSize: 16 }} aria-hidden="true" />
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

// ─── CoinLib market widget ────────────────────────────────────────────────────

function CoinLibWidget() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    if (ref.current.querySelector('script')) return

    const script = document.createElement('script')
    script.src = 'https://coinlib.io/embed/table.js'
    script.async = true
    ref.current.appendChild(script)
  }, [])

  return (
    <div ref={ref} className="w-full">
      {/* Fallback static table shown while/if widget doesn't load */}
      <div
        className="overflow-x-auto rounded-xl border"
        style={{ borderColor: 'rgba(43,25,120,0.4)' }}
      >
        {/* Search + filter bar */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-b"
          style={{
            backgroundColor: 'rgba(13,8,36,0.9)',
            borderColor: 'rgba(43,25,120,0.4)',
          }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border w-full sm:w-64"
            style={{
              backgroundColor: 'rgba(22,15,53,0.8)',
              borderColor: 'rgba(162,133,57,0.2)',
            }}
          >
            <i className="fas fa-search text-gray-500 text-xs" aria-hidden="true" />
            <span className="text-gray-500 text-sm">Search cryptocurrencies...</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1.5 rounded-lg text-xs text-gray-300 border"
              style={{ borderColor: 'rgba(162,133,57,0.2)', backgroundColor: 'rgba(22,15,53,0.6)' }}
            >
              All Cryptocurrencies
            </span>
            <button
              className="px-4 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }}
            >
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
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
              <th className="px-4 py-3 text-right">Spread</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {marketRows.map((row, i) => (
              <tr
                key={row.symbol}
                className="border-b transition-colors hover:bg-white hover:bg-opacity-5"
                style={{
                  borderColor: 'rgba(43,25,120,0.2)',
                  backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(22,15,53,0.3)',
                }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${row.iconColor}22` }}
                    >
                      <i className={row.icon} style={{ color: row.iconColor, fontSize: 13 }} aria-hidden="true" />
                    </div>
                    <span className="font-semibold text-white text-xs">{row.symbol}</span>
                  </div>
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
                <td className="px-4 py-3 text-right text-gray-400 text-xs">{row.spread}</td>
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

// ─── Trading flexibility section ──────────────────────────────────────────────

function TradingFlexibilitySection() {
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <section className="py-20" style={{ backgroundColor: '#110b2d' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
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
            Our platform provides you with the tools and access you need for successful trading.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — image */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 30% 50%, rgba(162,133,57,0.15), transparent 70%)',
              }}
              aria-hidden="true"
            />
            <div
              className="relative rounded-2xl overflow-hidden border"
              style={{ borderColor: 'rgba(162,133,57,0.2)' }}
            >
              {/* Placeholder gradient shown until image loads */}
              {!imgLoaded && (
                <div
                  className="w-full h-72 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#160f35,#0d0824)' }}
                >
                  <i className="fab fa-bitcoin text-6xl" style={{ color: '#f7931a', opacity: 0.4 }} aria-hidden="true" />
                </div>
              )}
              <img
                src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80"
                alt="Cryptocurrency trading — gold Bitcoin coins"
                className={`w-full h-72 object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                onLoad={() => setImgLoaded(true)}
              />
            </div>
          </div>

          {/* Right — text */}
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              One of the primary goals of Charles Schwab is to provide the best product in the
              market. Our relationships with leading tier one financial institutions mean deep
              liquidity and tighter spreads for Forex traders.
            </p>

            <ul className="space-y-3">
              {whyItems.map((item) => (
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

// ─── CTA banner ───────────────────────────────────────────────────────────────

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
          Ready to Start Trading{' '}
          <span
            style={{
              background: 'linear-gradient(90deg,#a28539,#c9a84c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Cryptocurrencies?
          </span>
        </h2>
        <p className="text-gray-300">
          Join thousands of traders using our platform to trade cryptocurrencies and other assets.
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

export default function Cryptocurrencies() {
  return (
    <>
      {/* ── Hero ── */}
      <SectionBackground withOrbs>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — copy */}
            <div className="space-y-6">
              <div>
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: '#a28539' }}
                >
                  Digital Assets
                </span>
                <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold text-white leading-tight">
                  Cryptocurrency
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
                  CFDs on Bitcoin, Ethereum, Ripple and more
                </h2>
              </div>

              <p className="text-gray-400 leading-relaxed max-w-lg">
                Cryptocurrency is a digital currency, created and held electronically. It is an
                internet-based medium of exchange which uses cryptographic functions to conduct
                financial transactions. They are not printed, like other currencies — they are
                produced by people, and increasingly businesses, running computers around the world,
                using software that solves mathematical problems.
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

            {/* Right — price cards grid */}
            <div className="grid grid-cols-2 gap-3">
              {heroPairs.map((pair) => (
                <PriceCard key={pair.symbol} pair={pair} />
              ))}
            </div>
          </div>
        </div>
      </SectionBackground>

      {/* ── Market Table ── */}
      <section className="py-16" style={{ backgroundColor: '#0d0824' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <SectionHeader
              badge="Live Markets"
              title="Cryptocurrency Markets"
              subtitle="Trade CFDs on the world's most popular cryptocurrencies with competitive spreads and advanced tools."
            />
          </div>
          <CoinLibWidget />
        </div>
      </section>

      {/* ── Trading Flexibility ── */}
      <TradingFlexibilitySection />

      {/* ── CTA ── */}
      <CtaBanner />
    </>
  )
}
