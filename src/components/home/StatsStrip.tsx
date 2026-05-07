import { motion } from 'framer-motion'
import GlowLine from '../ui/GlowLine'
import StatCard from '../ui/StatCard'

// ─── SVG icons ────────────────────────────────────────────────────────────────

const stroke = '#c9a84c'
const sw = 1.8

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={sw}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)
const PipsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.341A8 8 0 116.66 4.572" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12h-2" />
  </svg>
)
const LeverageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={sw}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h6M3 11h6M3 15h6M15 7h6M15 11h6M15 15h6" />
  </svg>
)
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={sw}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const BankIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={sw}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M12 3l9 6H3l9-6zM9 10v8M15 10v8" />
  </svg>
)
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={sw}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a1 1 0 100 2 1 1 0 000-2z" />
  </svg>
)
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={sw}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 4v6c0 5.25-3.75 9.74-7 10-3.25-.26-7-4.75-7-10V6l7-4z" />
  </svg>
)

// ─── Data ─────────────────────────────────────────────────────────────────────

const stats = [
  { value: 'Since 2017',     label: 'Licensed & Regulated',    icon: <CalendarIcon /> },
  { value: 'From 0.1 pips',  label: 'Low Spreads',             icon: <PipsIcon />,    featured: true },
  { value: '1:1000',         label: 'Flexible Leverage',       icon: <LeverageIcon /> },
  { value: '211 ms',         label: 'Fast Execution Time',     icon: <ClockIcon /> },
  { value: 'Tier 1',         label: 'Liquidity Providers',     icon: <BankIcon /> },
  { value: '0% Commission',  label: 'Deposits & Withdrawals',  icon: <WalletIcon /> },
  { value: 'Secure & Safe',  label: 'Wide Range Funding',      icon: <ShieldIcon /> },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function StatsStrip() {
  return (
    <section
      className="relative z-10 mb-20 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0d0824 0%, #160f35 50%, #0d0824 100%)',
        borderTop: '1px solid rgba(162,133,57,0.3)',
        borderBottom: '1px solid rgba(162,133,57,0.15)',
      }}
    >
      <GlowLine variant="top" />

      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(162,133,57,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(43,25,120,0.25) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.ul
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.value}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </motion.ul>
      </div>

      <GlowLine variant="bottom" />
    </section>
  )
}
