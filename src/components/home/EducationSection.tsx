import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
import InfoCard from '../ui/InfoCard'
import QuickStat from '../ui/QuickStat'
import GlowLine from '../ui/GlowLine'

// ─── Data ─────────────────────────────────────────────────────────────────────

const quickStats = [
  { value: '50+',  label: 'Video Lessons', variant: 'gold'   as const },
  { value: 'Live', label: 'Webinars',      variant: 'purple' as const },
  { value: 'Free', label: 'For All Users', variant: 'gold'   as const },
]

// ─── Video panel ──────────────────────────────────────────────────────────────

function VideoPanel() {
  return (
    <div className="relative group">
      {/* Decorative border glow */}
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(162,133,57,0.5), rgba(43,25,120,0.5))',
          filter: 'blur(8px)',
        }}
        aria-hidden="true"
      />

      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{ border: '1px solid rgba(162,133,57,0.25)' }}
      >
        {/* Top accent bar */}
        <GlowLine variant="divider" />

        {/* Video */}
        <div className="aspect-video" style={{ background: 'linear-gradient(135deg, #110b2d, #0d0824)' }}>
          <iframe
            src="https://www.youtube.com/embed/Gc2en3nHxA4"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full"
            title="Learn about Bitcoin — Education Center"
          />
        </div>

        {/* Bottom label bar */}
        <div
          className="px-5 py-3 flex items-center gap-3"
          style={{
            background: 'rgba(13,8,36,0.9)',
            borderTop: '1px solid rgba(162,133,57,0.15)',
          }}
        >
          <span
            className="flex items-center justify-center w-7 h-7 rounded-full"
            style={{
              background: 'rgba(162,133,57,0.15)',
              border: '1px solid rgba(162,133,57,0.3)',
            }}
          >
            <Icon name="fas fa-play text-xs" style={{ color: '#a28539' }} />
          </span>
          <span className="text-sm font-medium" style={{ color: '#c8c8d8' }}>
            What is Bitcoin? — Featured Lesson
          </span>
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: 'rgba(162,133,57,0.12)',
              color: '#a28539',
              border: '1px solid rgba(162,133,57,0.25)',
            }}
          >
            FREE
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── EducationSection ─────────────────────────────────────────────────────────

export default function EducationSection() {
  return (
    <section
      className="relative py-20 overflow-hidden"
      style={{ backgroundColor: '#0d0824' }}
    >
      {/* Background glow orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #a28539 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #2b1978 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — video */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <VideoPanel />
          </motion.div>

          {/* Right — text content */}
          <motion.div
            className="space-y-7"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >

            {/* Section label + heading */}
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-5 h-0.5 rounded-full" style={{ background: '#a28539' }} aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a28539' }}>
                  Education Center
                </span>
              </div>
              <h2 className="text-4xl font-bold leading-tight text-white">
                Learn From{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #a28539, #d4af6a)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Market Experts
                </span>
              </h2>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed">
              Discover everything you need to know about cryptocurrency trading, from fundamentals to
              advanced strategies.
            </p>

            {/* Info card */}
            <InfoCard
              icon={<Icon name="fab fa-bitcoin text-sm" style={{ color: '#a28539' }} />}
              title="About Bitcoin"
            >
              Bitcoin (₿) is a decentralized digital currency that operates without a central authority.
              Transactions are verified by network nodes through cryptography and recorded on a public
              distributed ledger called a blockchain. Created in 2008 by an unknown person or group using
              the name Satoshi Nakamoto, Bitcoin pioneered the concept of cryptocurrencies.
            </InfoCard>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              {quickStats.map((s) => (
                <QuickStat key={s.label} {...s} />
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              <Button variant="ghost-gold" to="/for-traders">
                <Icon name="fas fa-graduation-cap mr-2" />
                Explore learning resources
              </Button>
              <Button variant="login" to="/login">
                <Icon name="fas fa-video mr-2" />
                Join free webinars
              </Button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
