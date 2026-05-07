import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const ACTIONS = [
  {
    icon: 'fas fa-chart-line',
    title: 'Buy Stocks',
    subtitle: 'Invest in top companies',
    to: '/user/trade',
    gradient: 'linear-gradient(135deg, #0f2744 0%, #0d2035 100%)',
    border: 'rgba(59,130,246,0.25)',
    iconBg: 'rgba(59,130,246,0.18)',
    iconColor: '#60a5fa',
    arrowColor: '#60a5fa',
  },
  {
    icon: 'fab fa-bitcoin',
    title: 'Buy Cryptocurrency',
    subtitle: 'Buy and hold crypto',
    to: '/user/crypto',
    gradient: 'linear-gradient(135deg, #2d1500 0%, #1e0e00 100%)',
    border: 'rgba(245,158,11,0.25)',
    iconBg: 'rgba(245,158,11,0.18)',
    iconColor: '#f59e0b',
    arrowColor: '#f59e0b',
  },
]

export default function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-3">
      {ACTIONS.map((action, i) => (
        <motion.button
          key={action.title}
          onClick={() => navigate(action.to)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-left group w-full"
          style={{
            background: action.gradient,
            border: `1px solid ${action.border}`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Icon */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: action.iconBg }}
          >
            <i className={`${action.icon} text-base`} style={{ color: action.iconColor }} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">{action.title}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {action.subtitle}
            </p>
          </div>

          {/* Arrow */}
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 opacity-50 group-hover:opacity-100 transition-all group-hover:translate-x-0.5"
            style={{ background: `${action.iconBg}` }}
          >
            <i className="fas fa-arrow-right text-xs" style={{ color: action.arrowColor }} />
          </div>
        </motion.button>
      ))}
    </div>
  )
}
