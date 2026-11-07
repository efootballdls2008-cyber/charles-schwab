import { motion } from 'framer-motion'
import ServiceCard, { type ServiceCardProps } from '../ui/ServiceCard'
import Button from '../ui/Button'
import Icon from '../ui/Icon'

const services: ServiceCardProps[] = [
  {
    icon: 'fas fa-chart-line',
    title: 'Market Analysis',
    items: [
      'Daily Market Analysis',
      'Weekly Live Webinars',
      'Live Q & A Sessions',
      'Trading Strategy Support',
    ],
  },
  {
    icon: 'fas fa-trophy',
    title: 'Award-Winning Broker',
    items: [
      '42+ Industry Awards',
      'Top 100 Companies',
      'Best Client Funds Security Global',
      'Best Forex News & Analysis Provider',
    ],
  },
  {
    icon: 'fas fa-hand-holding-usd',
    title: 'Investment Options',
    items: [
      'BA Copy - How it Works',
      'Become a Follower',
      'PAMM Ranking',
      'Become an Investor',
    ],
  },
]

export default function TradingServicesSection() {
  return (
    <section className="py-16" style={{ backgroundColor: '#160f35' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-block px-4 py-1 text-sm font-semibold tracking-wider text-blue-400 uppercase bg-blue-900 bg-opacity-70 rounded-full shadow-lg">
            Comprehensive Services
          </span>
          <h2
            className="mt-3 text-3xl font-bold"
            style={{
              background: 'linear-gradient(90deg, #a28539, #d4af6a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Start Trading with Charles Schwab
          </h2>
          <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
            Everything you need for successful trading in one platform
          </p>
        </div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {services.map((s) => (
            <motion.div
              key={s.title}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <ServiceCard {...s} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button variant="ghost-gold" to="/register">
            Start Trading Now
            <Icon name="fas fa-arrow-right ml-2" />
          </Button>
        </div>

      </div>
    </section>
  )
}
