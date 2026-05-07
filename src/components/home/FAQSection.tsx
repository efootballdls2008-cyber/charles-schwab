import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionHeader from '../ui/SectionHeader'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'What is automated trading and how does it work?',
    answer:
      'Automated trading uses algorithms and pre-set rules to execute trades on your behalf — 24/7, without manual intervention. You configure your strategy parameters (entry/exit conditions, risk limits, position sizing) and the system handles execution automatically across all supported markets.',
  },
  {
    question: 'Do I need programming experience to use automated trading?',
    answer:
      'No. Our platform offers a visual strategy builder that requires zero coding. For advanced users, we also support custom scripts and API integrations. Whether you are a beginner or a seasoned quant, there is a workflow that fits your level.',
  },
  {
    question: 'How is my capital protected?',
    answer:
      'Client funds are held in segregated accounts with tier-1 banking partners. We provide insurance coverage up to $1,000,000 per account. All strategies include configurable stop-loss and drawdown limits to cap downside risk automatically.',
  },
  {
    question: 'Can I run multiple strategies at the same time?',
    answer:
      'Yes. You can deploy and monitor multiple bots simultaneously across different asset classes — crypto, forex, indices, and more. Each strategy runs independently with its own risk parameters and capital allocation.',
  },
  {
    question: 'What markets and instruments are supported?',
    answer:
      'Our platform supports 1,000+ instruments across 7 asset classes: cryptocurrencies, forex pairs, shares, indices, ETFs, commodities, and bonds. All markets are accessible from a single unified account.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Create a free account, complete identity verification, and fund your account. You can then browse our strategy marketplace, configure your own bot, or start with a demo account to test strategies risk-free before going live.',
  },
]

// ─── Accordion item ───────────────────────────────────────────────────────────

function AccordionItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FAQItem
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: isOpen
          ? 'linear-gradient(135deg,rgba(162,133,57,0.08),rgba(22,15,53,0.95))'
          : 'rgba(22,15,53,0.7)',
        border: isOpen
          ? '1.5px solid rgba(162,133,57,0.45)'
          : '1.5px solid rgba(43,25,120,0.35)',
        boxShadow: isOpen ? '0 8px 32px rgba(162,133,57,0.1)' : 'none',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={isOpen}
      >
        {/* Number + question */}
        <div className="flex items-center gap-4 min-w-0">
          <span
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300"
            style={
              isOpen
                ? { background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }
                : { background: 'rgba(162,133,57,0.12)', color: '#a28539', border: '1px solid rgba(162,133,57,0.3)' }
            }
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span
            className="text-sm sm:text-base font-semibold leading-snug transition-colors duration-300"
            style={{ color: isOpen ? '#ffffff' : '#c8c8d8' }}
          >
            {item.question}
          </span>
        </div>

        {/* Chevron */}
        <span
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
          style={
            isOpen
              ? { background: 'rgba(162,133,57,0.2)', color: '#c9a84c', transform: 'rotate(180deg)' }
              : { background: 'rgba(255,255,255,0.05)', color: '#6b6b8a', transform: 'rotate(0deg)' }
          }
          aria-hidden="true"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Answer panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className="px-6 pb-5 text-sm leading-relaxed"
              style={{
                color: 'rgba(200,200,216,0.8)',
                borderTop: '1px solid rgba(162,133,57,0.15)',
                paddingTop: '16px',
              }}
            >
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── FAQSection ───────────────────────────────────────────────────────────────

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i))

  const half = Math.ceil(faqs.length / 2)
  const leftCol = faqs.slice(0, half)
  const rightCol = faqs.slice(half)

  return (
    <section className="py-20" style={{ backgroundColor: '#0d0824' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14">
          <SectionHeader
            badge="FAQ"
            title="Frequently Asked Questions"
            highlight="Asked Questions"
            subtitle="Everything you need to know about trading with Charles Schwab."
          />
        </div>

        {/* Two-column accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left column */}
          <motion.div
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {leftCol.map((item, i) => (
              <motion.div
                key={item.question}
                variants={{
                  hidden: { opacity: 0, x: -24 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <AccordionItem
                  item={item}
                  index={i}
                  isOpen={openIndex === i}
                  onToggle={() => toggle(i)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Right column */}
          <motion.div
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {rightCol.map((item, i) => {
              const globalIndex = i + half
              return (
                <motion.div
                  key={item.question}
                  variants={{
                    hidden: { opacity: 0, x: 24 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                  }}
                >
                  <AccordionItem
                    item={item}
                    index={globalIndex}
                    isOpen={openIndex === globalIndex}
                    onToggle={() => toggle(globalIndex)}
                  />
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm mb-4">Still have questions?</p>
          <a
            href="/contacts"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
            style={{
              border: '1.5px solid rgba(162,133,57,0.45)',
              color: '#c9a84c',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(162,133,57,0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <i className="fas fa-headset" aria-hidden="true" />
            Contact Support
          </a>
        </div>
      </div>
    </section>
  )
}
