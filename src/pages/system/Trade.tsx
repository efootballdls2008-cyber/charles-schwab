import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import SectionBackground from '../../components/ui/SectionBackground'
import SectionHeader from '../../components/ui/SectionHeader'
import Badge from '../../components/ui/Badge'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface PlatformFeature {
  icon: string
  iconColor: string
  title: string
  description: string
}

interface PlatformTab {
  key: string
  label: string
  icon: string
}

interface MarketRow {
  symbol: string
  name: string
  price: string
  change: string
  spread: string
  positive: boolean
  icon: string
  iconColor: string
}

const platformFeatures: PlatformFeature[] = [
  {
    icon: 'fas fa-shield-alt',
    iconColor: '#60a5fa',
    title: 'Reliable',
    description:
      'Featuring the market\'s sharpest execution, Charles Schwab fills your orders in milliseconds without any requotes or price manipulation.',
  },
  {
    icon: 'fas fa-lightbulb',
    iconColor: '#c9a84c',
    title: 'Intelligent',
    description:
      'Make informed decisions with smart market analysis tools, Live Sentiment data and in-platform market insights from Trading Central.',
  },
  {
    icon: 'fas fa-desktop',
    iconColor: '#4ade80',
    title: 'Transparent',
    description:
      'Access transaction statistics, equity charts and detailed history of your deals for a crystal clear understanding of your performance.',
  },
  {
    icon: 'fas fa-puzzle-piece',
    iconColor: '#a78bfa',
    title: 'Intuitive',
    description:
      'Easy to use and navigate, Charles Schwab Trade was built with real traders\' needs in mind. Trade and experience its distinct advantage.',
  },
]

const platformTabs: PlatformTab[] = [
  { key: 'web',     label: 'Web Terminal', icon: 'fas fa-globe' },
  { key: 'desktop', label: 'Desktop App',  icon: 'fas fa-desktop' },
  { key: 'mobile',  label: 'Mobile App',   icon: 'fas fa-mobile-alt' },
]

const marketRows: MarketRow[] = [
  { symbol: 'BTC/USD',  name: 'Bitcoin',      price: '$46,199',  change: '+2.40%', spread: '0.5', positive: true,  icon: 'fab fa-bitcoin',    iconColor: '#f7931a' },
  { symbol: 'EUR/USD',  name: 'Euro / Dollar', price: '1.08542',  change: '+0.12%', spread: '0.4', positive: true,  icon: 'fas fa-euro-sign',  iconColor: '#4ade80' },
  { symbol: 'GBP/USD',  name: 'Pound / Dollar',price: '1.26731',  change: '+0.08%', spread: '0.4', positive: true,  icon: 'fas fa-pound-sign', iconColor: '#60a5fa' },
  { symbol: 'XAU/USD',  name: 'Gold',          price: '$2,312.40',change: '+0.55%', spread: '0.3', positive: true,  icon: 'fas fa-coins',      iconColor: '#c9a84c' },
  { symbol: 'SPX500',   name: 'S&P 500',       price: '5,248.00', change: '-0.21%', spread: '0.6', positive: false, icon: 'fas fa-chart-bar',  iconColor: '#a78bfa' },
  { symbol: 'ETH/USD',  name: 'Ethereum',      price: '$2,873',   change: '+1.80%', spread: '0.8', positive: true,  icon: 'fab fa-ethereum',   iconColor: '#627eea' },
]

const toolItems = [
  { icon: 'fas fa-chart-line',      color: '#c9a84c', title: 'Advanced Charting',      desc: 'TradingView-powered charts with 100+ indicators, multiple timeframes, and drawing tools.' },
  { icon: 'fas fa-calendar-alt',    color: '#4ade80', title: 'Economic Calendar',       desc: 'Track high-impact market events, central bank decisions, and economic data releases.' },
  { icon: 'fas fa-brain',           color: '#60a5fa', title: 'Market Sentiment',        desc: 'Real-time sentiment data showing long/short ratios across all major instruments.' },
  { icon: 'fas fa-calculator',      color: '#a78bfa', title: 'Risk Calculator',         desc: 'Calculate position size, pip value, and potential profit/loss before placing any trade.' },
  { icon: 'fas fa-bell',            color: '#f87171', title: 'Price Alerts',            desc: 'Set custom price alerts and receive instant notifications when your levels are hit.' },
  { icon: 'fas fa-history',         color: '#c9a84c', title: 'Trade History',           desc: 'Full audit trail of all your trades with detailed statistics and performance analytics.' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureCard({ feat }: { feat: PlatformFeature }) {
  return (
    <div
      className="rounded-2xl p-6 border flex flex-col gap-4 transition-all hover:scale-[1.01]"
      style={{
        background: 'rgba(22,15,53,0.8)',
        borderColor: 'rgba(162,133,57,0.2)',
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${feat.iconColor}18`, border: `1px solid ${feat.iconColor}40` }}
      >
        <i className={feat.icon} style={{ color: feat.iconColor, fontSize: 20 }} aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-white">{feat.title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{feat.description}</p>
    </div>
  )
}

// ─── Platform Showcase ────────────────────────────────────────────────────────

function PlatformShowcase() {
  const [activeTab, setActiveTab] = useState('web')

  const tabContent: Record<string, { headline: string; points: string[] }> = {
    web: {
      headline: 'Trade from any browser, anywhere in the world',
      points: [
        'No download required — launch instantly',
        'Full feature parity with desktop',
        'Secure SSL-encrypted connection',
        'Supports all major browsers',
      ],
    },
    desktop: {
      headline: 'Maximum performance on Windows & macOS',
      points: [
        'Ultra-low latency order execution',
        'Multi-monitor support',
        'Offline chart analysis',
        'Custom workspace layouts',
      ],
    },
    mobile: {
      headline: 'Trade on the go with iOS & Android',
      points: [
        'Full trading functionality on mobile',
        'Biometric login (Face ID / fingerprint)',
        'Push notifications for price alerts',
        'One-tap order placement',
      ],
    },
  }

  const content = tabContent[activeTab]

  return (
    <section className="py-20" style={{ backgroundColor: '#160f35' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <SectionHeader
            badge="Multi-Platform"
            title="Trade on Any Device"
            subtitle="Our platform is available on web, desktop, and mobile — seamlessly synced across all your devices."
          />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {platformTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={
                activeTab === tab.key
                  ? { background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }
                  : { background: 'rgba(22,15,53,0.6)', color: '#9ca3af', border: '1px solid rgba(162,133,57,0.2)' }
              }
            >
              <i className={tab.icon} aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left — mock platform UI */}
          <div
            className="rounded-2xl overflow-hidden border"
            style={{ borderColor: 'rgba(162,133,57,0.2)', background: 'rgba(13,8,36,0.95)' }}
          >
            {/* Mock toolbar */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(22,15,53,0.9)' }}
            >
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-70" />
              <div className="w-3 h-3 rounded-full bg-green-500 opacity-70" />
              <span className="ml-3 text-xs text-gray-500">Charles Schwab — {platformTabs.find(t => t.key === activeTab)?.label}</span>
            </div>

            {/* Mock market table */}
            <div className="p-4">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Symbol', 'Price', 'Change', 'Spread', 'Action'].map((h) => (
                      <th key={h} className="pb-2 text-left font-medium" style={{ color: '#6b7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {marketRows.map((row, i) => (
                    <tr
                      key={row.symbol}
                      className="transition-colors hover:bg-white/5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: `${row.iconColor}22` }}
                          >
                            <i className={row.icon} style={{ color: row.iconColor, fontSize: 10 }} aria-hidden="true" />
                          </div>
                          <span className="font-semibold text-white">{row.symbol}</span>
                        </div>
                      </td>
                      <td className="py-2 font-semibold text-white">{row.price}</td>
                      <td className="py-2">
                        <span
                          className="px-1.5 py-0.5 rounded text-xs font-semibold"
                          style={{
                            color: row.positive ? '#4ade80' : '#f87171',
                            background: row.positive ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                          }}
                        >
                          {row.change}
                        </span>
                      </td>
                      <td className="py-2 text-gray-400">{row.spread}</td>
                      <td className="py-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-semibold cursor-pointer"
                          style={{ background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }}
                        >
                          Trade
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right — text */}
          <div className="space-y-6">
            <h3 className="text-2xl font-extrabold text-white leading-snug">{content.headline}</h3>
            <ul className="space-y-3">
              {content.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(162,133,57,0.15)', border: '1px solid rgba(162,133,57,0.4)' }}
                  >
                    <i className="fas fa-check text-xs" style={{ color: '#a28539' }} aria-hidden="true" />
                  </span>
                  <span className="text-gray-300 text-sm">{point}</span>
                </li>
              ))}
            </ul>
            <Button variant="ghost-gold" to="/register">
              Open Free Account <Icon name="fas fa-arrow-right ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Trading Tools Grid ───────────────────────────────────────────────────────

function TradingToolsSection() {
  return (
    <section className="py-20" style={{ backgroundColor: '#110b2d' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <SectionHeader
            badge="Built-In Tools"
            title="Everything You Need to Trade"
            subtitle="Professional-grade tools built directly into the platform — no third-party plugins required."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {toolItems.map((tool) => (
            <div
              key={tool.title}
              className="rounded-2xl p-6 border flex gap-4 transition-all hover:scale-[1.01]"
              style={{ background: 'rgba(22,15,53,0.8)', borderColor: 'rgba(162,133,57,0.2)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${tool.color}18`, border: `1px solid ${tool.color}40` }}
              >
                <i className={tool.icon} style={{ color: tool.color, fontSize: 18 }} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{tool.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Expert Support Section ───────────────────────────────────────────────────

function ExpertSupportSection() {
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <section className="py-20" style={{ backgroundColor: '#0d0824' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — image */}
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
              {!imgLoaded && (
                <div
                  className="w-full h-72 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#160f35,#0d0824)' }}
                >
                  <i className="fas fa-chart-candlestick text-5xl" style={{ color: '#a28539', opacity: 0.3 }} aria-hidden="true" />
                </div>
              )}
              <img
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80"
                alt="Advanced trading charts"
                className={`w-full h-72 object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                onLoad={() => setImgLoaded(true)}
              />
            </div>
          </div>

          {/* Right — info panels */}
          <div className="space-y-5">
            <Badge withDot>Premium Support</Badge>

            <div
              className="rounded-2xl p-6 border"
              style={{ background: 'rgba(22,15,53,0.8)', borderColor: 'rgba(162,133,57,0.2)' }}
            >
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <i className="fas fa-bolt text-sm" style={{ color: '#c9a84c' }} aria-hidden="true" />
                Stay Up To Date With Our Experts!
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Our local and international teams are here to support you on a 24/5 basis in more
                than 20 languages, while our wide range of payment methods gives you greater
                flexibility when it comes to deposits and withdrawals.
              </p>
            </div>

            <div
              className="rounded-2xl p-6 border"
              style={{ background: 'rgba(22,15,53,0.8)', borderColor: 'rgba(162,133,57,0.2)' }}
            >
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <i className="fas fa-star text-sm" style={{ color: '#c9a84c' }} aria-hidden="true" />
                Experience More Than Trading
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Our success is centred around a number of core values. They include providing
                competitive brokerage fees through tight spreads, ensuring lightning-fast execution,
                access to advanced trading platforms with a wide range of products, and exceptional
                customer service.
              </p>
            </div>

            <Button variant="ghost-gold" to="/contacts">
              Learn More About Our Services <Icon name="fas fa-arrow-right ml-2" />
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
          Start Trading with{' '}
          <span
            style={{
              background: 'linear-gradient(90deg,#a28539,#c9a84c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Charles Schwab Trade
          </span>
        </h2>
        <p className="text-gray-300">
          Access global markets with professional tools, tight spreads, and lightning-fast execution.
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

export default function Trade() {
  return (
    <>
      {/* ── Hero ── */}
      <SectionBackground withOrbs>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl space-y-6">
            <Badge withDot>Professional Trading Platform</Badge>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Charles Schwab{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg,#a28539,#c9a84c)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Trade
              </span>
            </h1>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-gray-300 transition-colors">Home</Link>
              <i className="fas fa-chevron-right text-xs" aria-hidden="true" />
              <Link to="/trade" className="hover:text-gray-300 transition-colors">Trade</Link>
            </nav>

            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
              Access the world's most advanced trading platform. Trade Forex, Crypto, Stocks,
              Indices, and Commodities with institutional-grade tools, ultra-fast execution, and
              deep liquidity — all from a single account.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="ghost-gold" to="/register">
                <Icon name="fas fa-rocket mr-2" /> Start Trading
              </Button>
              <Button variant="login" to="/register">
                <Icon name="fas fa-flask mr-2" /> Try Demo Account
              </Button>
            </div>

            {/* Platform badges */}
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                { icon: 'fas fa-globe',      label: 'Web' },
                { icon: 'fas fa-desktop',    label: 'Desktop' },
                { icon: 'fab fa-android',    label: 'Android' },
                { icon: 'fab fa-apple',      label: 'iOS' },
              ].map((p) => (
                <span
                  key={p.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background: 'rgba(162,133,57,0.1)',
                    border: '1px solid rgba(162,133,57,0.25)',
                    color: '#c9a84c',
                  }}
                >
                  <i className={p.icon} aria-hidden="true" />
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SectionBackground>

      {/* ── Platform Features (4 cards) ── */}
      <section className="py-20" style={{ backgroundColor: '#0d0824' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {platformFeatures.map((feat) => (
              <FeatureCard key={feat.title} feat={feat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Showcase (tabs) ── */}
      <PlatformShowcase />

      {/* ── Trading Tools ── */}
      <TradingToolsSection />

      {/* ── Expert Support ── */}
      <ExpertSupportSection />

      {/* ── CTA ── */}
      <CtaBanner />
    </>
  )
}
