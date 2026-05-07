import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import SectionBackground from '../../components/ui/SectionBackground'
import SectionHeader from '../../components/ui/SectionHeader'
import Badge from '../../components/ui/Badge'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface FeatureCard {
  icon: string
  iconColor: string
  title: string
  description: string
}

interface Step {
  number: string
  icon: string
  title: string
  description: string
}

interface TraderCard {
  name: string
  initials: string
  avatarColor: string
  strategy: string
  roi: string
  roiPositive: boolean
  followers: number
  winRate: string
  risk: 'Low' | 'Medium' | 'High'
}

const features: FeatureCard[] = [
  {
    icon: 'fas fa-copy',
    iconColor: '#c9a84c',
    title: 'Copy 400+ Strategies',
    description:
      'Access hundreds of strategies for more than 1000 instruments across 7 asset classes, providing diverse opportunities for every trading style.',
  },
  {
    icon: 'fas fa-search-dollar',
    iconColor: '#4ade80',
    title: 'Select Top Performers',
    description:
      'Use our advanced reporting tools to search strategies by performance and select the most suitable ones for your unique circumstances.',
  },
  {
    icon: 'fas fa-shield-alt',
    iconColor: '#60a5fa',
    title: 'Stay Protected',
    description:
      'Our system employs sophisticated solutions to restrict your exposure at an asset level for your account, protecting your investments.',
  },
  {
    icon: 'fas fa-layer-group',
    iconColor: '#a78bfa',
    title: 'Combine With Other Methods',
    description:
      'Our integrated platform allows you to combine copy trading with manual and automated trading, tailoring your approach to your preferences.',
  },
]

const steps: Step[] = [
  {
    number: '1',
    icon: 'fas fa-list-ul',
    title: 'Browse Strategies',
    description:
      'Explore our catalogue of trading strategies. Filter by performance metrics, risk level, asset class, and more to find strategies that match your investment goals.',
  },
  {
    number: '2',
    icon: 'fas fa-mouse-pointer',
    title: 'Select & Subscribe',
    description:
      'Choose the strategies you want to follow. Set your risk parameters and allocation amount to customise how much capital you want to allocate to each strategy.',
  },
  {
    number: '3',
    icon: 'fas fa-robot',
    title: 'Automated Trading',
    description:
      'Once subscribed, trades will be automatically executed in your account based on the strategy provider\'s activity, adjusted to your risk settings at a scaled ratio.',
  },
]

const topTraders: TraderCard[] = [
  {
    name: 'Alex Morgan',
    initials: 'AM',
    avatarColor: '#c9a84c',
    strategy: 'Gold & Forex Scalper',
    roi: '+142.3%',
    roiPositive: true,
    followers: 2841,
    winRate: '74%',
    risk: 'Medium',
  },
  {
    name: 'Sarah Chen',
    initials: 'SC',
    avatarColor: '#4ade80',
    strategy: 'Crypto Momentum',
    roi: '+98.7%',
    roiPositive: true,
    followers: 1923,
    winRate: '68%',
    risk: 'High',
  },
  {
    name: 'James Okafor',
    initials: 'JO',
    avatarColor: '#60a5fa',
    strategy: 'Conservative Indices',
    roi: '+54.1%',
    roiPositive: true,
    followers: 3412,
    winRate: '81%',
    risk: 'Low',
  },
  {
    name: 'Maria Santos',
    initials: 'MS',
    avatarColor: '#a78bfa',
    strategy: 'Swing Forex Pro',
    roi: '+76.5%',
    roiPositive: true,
    followers: 1654,
    winRate: '71%',
    risk: 'Medium',
  },
]

const riskColor: Record<string, string> = {
  Low: '#4ade80',
  Medium: '#c9a84c',
  High: '#f87171',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureCardItem({ card }: { card: FeatureCard }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 border transition-all hover:scale-[1.01]"
      style={{
        background: 'rgba(22,15,53,0.8)',
        borderColor: 'rgba(162,133,57,0.2)',
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${card.iconColor}18`, border: `1px solid ${card.iconColor}40` }}
      >
        <i className={card.icon} style={{ color: card.iconColor, fontSize: 20 }} aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-white">{card.title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{card.description}</p>
    </div>
  )
}

function StepCard({ step }: { step: Step }) {
  return (
    <div
      className="rounded-2xl p-6 border flex flex-col gap-4"
      style={{
        background: 'rgba(22,15,53,0.8)',
        borderColor: 'rgba(162,133,57,0.2)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }}
        >
          {step.number}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(162,133,57,0.12)', border: '1px solid rgba(162,133,57,0.3)' }}
        >
          <i className={step.icon} style={{ color: '#c9a84c', fontSize: 16 }} aria-hidden="true" />
        </div>
      </div>
      <h3 className="text-base font-bold text-white">{step.title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
    </div>
  )
}

function TraderCardItem({ trader }: { trader: TraderCard }) {
  return (
    <div
      className="rounded-2xl p-5 border flex flex-col gap-4 transition-all hover:scale-[1.01]"
      style={{
        background: 'rgba(22,15,53,0.8)',
        borderColor: 'rgba(162,133,57,0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: `${trader.avatarColor}22`, border: `1.5px solid ${trader.avatarColor}55`, color: trader.avatarColor }}
        >
          {trader.initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{trader.name}</p>
          <p className="text-xs text-gray-400 truncate">{trader.strategy}</p>
        </div>
        <div className="ml-auto text-right flex-shrink-0">
          <p className="text-base font-extrabold" style={{ color: trader.roiPositive ? '#4ade80' : '#f87171' }}>
            {trader.roi}
          </p>
          <p className="text-xs text-gray-500">12-month ROI</p>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-3 gap-2 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="text-center">
          <p className="text-xs text-gray-500">Followers</p>
          <p className="text-sm font-bold text-white">{trader.followers.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Win Rate</p>
          <p className="text-sm font-bold" style={{ color: '#4ade80' }}>{trader.winRate}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Risk</p>
          <p className="text-sm font-bold" style={{ color: riskColor[trader.risk] }}>{trader.risk}</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/register"
        className="block w-full text-center py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
        style={{ background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }}
      >
        Copy Strategy
      </Link>
    </div>
  )
}

// ─── Expert Support Section ───────────────────────────────────────────────────

function ExpertSupportSection() {
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <section className="py-20" style={{ backgroundColor: '#160f35' }}>
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
                  <i className="fas fa-chart-line text-5xl" style={{ color: '#a28539', opacity: 0.3 }} aria-hidden="true" />
                </div>
              )}
              <img
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80"
                alt="Trading platform charts"
                className={`w-full h-72 object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                onLoad={() => setImgLoaded(true)}
              />
            </div>
          </div>

          {/* Right — text panels */}
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
          Ready to Start{' '}
          <span
            style={{
              background: 'linear-gradient(90deg,#a28539,#c9a84c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Copy Trading?
          </span>
        </h2>
        <p className="text-gray-300">
          Join thousands of traders using our platform to replicate successful strategies and
          maximise profits.
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

export default function CopyTrading() {
  return (
    <>
      {/* ── Hero ── */}
      <SectionBackground withOrbs>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
          <Badge withDot>Smart Strategy Replication</Badge>

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
              Copy Trading
            </span>
          </h1>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Replicate successful trading strategies from top-performing traders. Diversify your
            portfolio and maximise profits without any manual effort using our intelligent
            copy-trading platform.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="ghost-gold" to="/register">
              <Icon name="fas fa-rocket mr-2" /> Get Started
            </Button>
            <Button variant="login" to="/for-traders">
              <Icon name="fas fa-book-open mr-2" /> Learn More
            </Button>
          </div>

          {/* Quick stats */}
          <div
            className="flex flex-wrap justify-center gap-8 pt-4 mt-4 border-t"
            style={{ borderColor: 'rgba(162,133,57,0.2)' }}
          >
            {[
              { value: '400+', label: 'Strategies' },
              { value: '50K+', label: 'Active Copiers' },
              { value: '74%', label: 'Avg Win Rate' },
              { value: '24/5', label: 'Support' },
            ].map((stat, i, arr) => (
              <div key={stat.label} className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-2xl font-extrabold" style={{ color: '#c9a84c' }}>{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-px h-10 hidden sm:block" style={{ background: 'rgba(162,133,57,0.2)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionBackground>

      {/* ── Amplify Features ── */}
      <section className="py-20" style={{ backgroundColor: '#0d0824' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <SectionHeader
              badge="Key Features"
              title="Amplify Your Trading Potential"
              subtitle="Our copy trading platform delivers innovative features to help you optimise your investment strategy and maximise returns."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((card) => (
              <FeatureCardItem key={card.title} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20" style={{ backgroundColor: '#110b2d' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <SectionHeader
              badge="Trading Process"
              title="How Copy Trading Works"
              subtitle="Get started with copy trading in just a few simple steps."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <StepCard key={step.number} step={step} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Traders ── */}
      <section className="py-20" style={{ backgroundColor: '#0d0824' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <SectionHeader
              badge="Top Performers"
              title="Copy Our Best Traders"
              highlight="Best Traders"
              subtitle="Browse our top-performing strategy providers and start copying their trades today."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {topTraders.map((trader) => (
              <TraderCardItem key={trader.name} trader={trader} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="ghost-gold" to="/register">
              View All Strategies <Icon name="fas fa-arrow-right ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Expert Support ── */}
      <ExpertSupportSection />

      {/* ── CTA ── */}
      <CtaBanner />
    </>
  )
}
