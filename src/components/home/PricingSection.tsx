import { motion } from 'framer-motion'
import PricingCard, { type PricingCardProps } from '../ui/PricingCard'

const plans: PricingCardProps[] = [
  {
    icon: 'fas fa-seedling',
    name: 'Beginner Plan',
    rate: '16%',
    features: [
      'Principal return on maturity',
      'Instant Withdrawal',
      'Professional Charts',
      '24/7 Support',
    ],
    minDeposit: '$500',
    maxDeposit: '$25,000',
  },
  {
    icon: 'fas fa-chart-bar',
    name: 'Standard Plan',
    rate: '2.5%',
    features: [
      'Principal return on maturity',
      'Instant Withdrawal',
      'Professional Charts',
      '24/7 Support',
    ],
    minDeposit: '$25,000',
    maxDeposit: '$100,000',
  },
  {
    icon: 'fas fa-briefcase',
    name: 'Business Plan',
    rate: '3.1%',
    features: [
      'Principal return on maturity',
      'Instant Withdrawal',
      'Professional Charts',
      '24/7 Support',
    ],
    minDeposit: '$100,000',
    maxDeposit: '$1,000,000',
  },
  {
    icon: 'fas fa-crown',
    name: 'Basic Plan',
    rate: '25%',
    features: [
      'Principal return on maturity',
      'Instant Withdrawal',
      'Professional Charts',
      '24/7 Support',
    ],
    minDeposit: '$3,000',
    maxDeposit: '$29,999',
    featured: true,
    badge: 'Premium',
  },
]

export default function PricingSection() {
  return (
    <section className="py-16" style={{ backgroundColor: '#110b2d' }} id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <span
            className="inline-block px-4 py-1 text-sm font-semibold tracking-wider uppercase rounded-full shadow-lg"
            style={{
              color: '#a28539',
              background: 'rgba(162,133,57,0.12)',
              border: '1px solid rgba(162,133,57,0.25)',
            }}
          >
            Trading Plans
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
            Investment Opportunities
          </h2>
          <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan that suits your investment strategy and financial goals
          </p>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <PricingCard {...plan} />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
