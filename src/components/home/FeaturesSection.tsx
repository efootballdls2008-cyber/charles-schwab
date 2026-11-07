import { motion } from 'framer-motion'
import FeatureCard, { type FeatureCardProps } from '../ui/FeatureCard'
import StatBar, { type StatBarItem } from '../ui/StatBar'
import SectionHeader from '../ui/SectionHeader'

// ─── SVG icons ────────────────────────────────────────────────────────────────

const sw = 1.8

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#a28539" strokeWidth={sw}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
  </svg>
)

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={sw}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const MonitorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#818cf8" strokeWidth={sw}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const CardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth={sw}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

// Badge sub-icons
const LightningBadgeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const GlobeBadgeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
  </svg>
)

const ShieldBadgeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

// ─── Card data ────────────────────────────────────────────────────────────────

const cards: FeatureCardProps[] = [
  {
    icon: <ChartIcon />,
    iconAccent: 'gold',
    topBar: 'gold-purple',
    badge: { label: '50+ Tools', color: 'green', withDot: true },
    title: 'Trading Tools',
    description:
      'Plan your trades with our professional suite — real-time charts, technical indicators, economic calendar, and risk calculators.',
    link: { label: 'Explore tools', to: '/trade' },
  },
  {
    icon: <GlobeIcon />,
    iconAccent: 'gold-bright',
    topBar: 'purple-gold',
    badge: { label: '1000+ Markets', color: 'gold', icon: <GlobeBadgeIcon /> },
    title: 'Trading Products',
    description:
      'Diverse opportunities across Forex, Crypto, Stocks, Indices, Commodities and ETFs — all from a single account.',
    link: { label: 'View markets', to: '/cryptocurrencies' },
  },
  {
    icon: <MonitorIcon />,
    iconAccent: 'indigo',
    topBar: 'gold-purple',
    badge: { label: '211ms Execution', color: 'indigo', icon: <LightningBadgeIcon /> },
    title: 'Trading Platforms',
    description:
      'Powerful platforms built for every trader — Web Terminal, Desktop, iOS and Android apps with full feature parity.',
    link: { label: 'Download app', to: '/trade' },
  },
  {
    icon: <CardIcon />,
    iconAccent: 'green',
    topBar: 'purple-gold',
    badge: { label: 'Secure & Instant', color: 'green', icon: <ShieldBadgeIcon /> },
    title: 'Funding Methods',
    description:
      'Deposit and withdraw instantly via credit cards, bank wire, crypto wallets and e-wallets — zero commission.',
    link: { label: 'Fund account', to: '/register' },
  },
]

// ─── Stat bar data ────────────────────────────────────────────────────────────

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#a28539" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const statBarItems: StatBarItem[] = [
  { value: '$2.4B+', label: 'Daily Trading Volume', icon: <BarChartIcon />, gold: true },
  { value: '500K+',  label: 'Active Traders' },
  { value: '0.0',    label: 'Pips Spread From', gold: true },
  { value: '24/7',   label: 'Customer Support', liveDot: true },
]

// ─── FeaturesSection ──────────────────────────────────────────────────────────

export default function FeaturesSection() {
  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #080518 0%, #0d0824 40%, #110b2d 70%, #0d0824 100%)',
      }}
    >
      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(162,133,57,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(162,133,57,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orbs */}
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle, rgba(43,25,120,0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle, rgba(162,133,57,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse, rgba(43,25,120,0.1) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeader
            badge="Platform Advantages"
            title="Why Trade With "
            highlight="Charles Schwab"
            subtitle="Everything you need for successful trading — professional tools, deep markets, and institutional-grade execution."
          />
        </motion.div>

        {/* 4-card grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {cards.map((card) => (
            <motion.div
              key={card.title}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <FeatureCard {...card} />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom stats bar */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <StatBar items={statBarItems} />
        </motion.div>

      </div>
    </section>
  )
}
