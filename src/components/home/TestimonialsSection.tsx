import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TestimonialCard, { type TestimonialCardProps } from '../ui/TestimonialCard'
import Button from '../ui/Button'
import Icon from '../ui/Icon'

// ─── Data ─────────────────────────────────────────────────────────────────────

const primaryTestimonials: TestimonialCardProps[] = [
  {
    name: 'Malcom47',
    role: 'Verified Trader',
    accentColor: 'blue',
    quote:
      "Charles Schwab gives me lightning-fast execution on spot trades. The spreads are tight, and I've never had issues with liquidity.",
  },
  {
    name: 'Christy',
    role: 'Elite Investor',
    accentColor: 'emerald',
    quote:
      'I trade futures daily, and what sets Charles Schwab apart is their stability during high volatility. No platform freezes.',
  },
  {
    name: 'Linday8',
    role: 'Professional Trader',
    accentColor: 'blue',
    quote:
      'I started with CFDs because of the low capital requirements, and Charles Schwab made it simple. The leverage options are flexible.',
  },
  {
    name: 'Crian',
    role: 'Active Trader',
    accentColor: 'emerald',
    quote:
      "As a professional trader, I've used many platforms, but Charles Schwab combines everything I need: real-time charts, advanced order types, and fast withdrawals.",
  },
]

const extraTestimonials: TestimonialCardProps[] = [
  {
    name: 'Claudia',
    role: 'Satisfied Investor',
    accentColor: 'blue',
    quote:
      'Security is my number one concern, and Charles Schwab really delivers. I feel confident keeping funds on the platform because of their multi-layered protection.',
  },
  {
    name: 'Jenny',
    role: 'Premium Member',
    accentColor: 'emerald',
    quote:
      "The best part is the user-friendly dashboard. Even as someone new to futures, I was able to start trading quickly while still having access to advanced features when I needed them.",
  },
  {
    name: 'Mike',
    role: 'Regular Investor',
    accentColor: 'blue',
    quote:
      "The futures contracts are some of the most transparent I've seen. No hidden fees, fair funding rates, and clear order books — exactly what serious traders need.",
  },
  {
    name: 'Kathy',
    role: 'Long-term Client',
    accentColor: 'emerald',
    quote:
      'What impressed me most is the customer support. When I had a question about margin requirements, the team responded instantly with clear explanations — that builds trust.',
  },
]

// ─── Grid ─────────────────────────────────────────────────────────────────────

function TestimonialGrid({ items }: { items: TestimonialCardProps[] }) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {items.map((t) => (
        <motion.div
          key={t.name}
          variants={{
            hidden: { opacity: 0, y: 32 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          <TestimonialCard {...t} />
        </motion.div>
      ))}
    </motion.div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function TestimonialsSection() {
  const [showMore, setShowMore] = useState(false)

  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{ backgroundColor: '#110b2d' }}
    >
      {/* Background effects */}
      <div className="absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(43,25,120,0.08), rgba(162,133,57,0.05))',
          }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="t-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40V0h40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="20" cy="20" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#t-grid)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <h2
            className="mt-3 text-3xl font-bold"
            style={{
              background: 'linear-gradient(90deg, #a28539, #c9a84c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Client Testimonials
          </h2>
          <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
            Hear from our satisfied clients who have achieved impressive results with our platform
          </p>
        </div>

        {/* Primary 4 */}
        <TestimonialGrid items={primaryTestimonials} />

        {/* Expandable extra 4 */}
        <AnimatePresence>
          {showMore && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <TestimonialGrid items={extraTestimonials} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show more / less toggle */}
        <div className="mt-8 text-center">
          <Button
            variant="login"
            onClick={() => setShowMore((v) => !v)}
          >
            <Icon name={`fas fa-chevron-${showMore ? 'up' : 'down'} mr-2`} />
            {showMore ? 'Show Less' : 'Show More Reviews'}
          </Button>
        </div>

      </div>
    </section>
  )
}
