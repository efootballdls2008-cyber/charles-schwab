import Button from './Button'
import Icon from './Icon'

export interface PricingCardProps {
  icon: string           // FontAwesome class e.g. 'fas fa-seedling'
  name: string
  rate: string           // e.g. '16%'
  rateLabel?: string     // e.g. '/ Trade'
  features: string[]
  minDeposit: string
  maxDeposit: string
  featured?: boolean     // gold-highlighted "Premium" card
  badge?: string         // e.g. 'Premium'
}

const baseCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.10)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
}

const featuredCard: React.CSSProperties = {
  background: 'rgba(162,133,57,0.08)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(162,133,57,0.35)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(162,133,57,0.15)',
}

export default function PricingCard({
  icon,
  name,
  rate,
  rateLabel = '/ Trade',
  features,
  minDeposit,
  maxDeposit,
  featured = false,
  badge,
}: PricingCardProps) {
  const dividerColor = featured
    ? 'rgba(162,133,57,0.2)'
    : 'rgba(255,255,255,0.08)'

  return (
    <div
      className="rounded-2xl flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative"
      style={featured ? featuredCard : baseCard}
    >
      {/* Premium badge */}
      {badge && (
        <div className="absolute top-0 right-0">
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-xl"
            style={{ background: 'rgba(162,133,57,0.9)', color: '#0d0824' }}
          >
            {badge}
          </span>
        </div>
      )}

      {/* Card top */}
      <div className="p-6 border-b" style={{ borderColor: dividerColor }}>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: featured ? 'rgba(162,133,57,0.2)' : 'rgba(162,133,57,0.15)',
            border: `1px solid ${featured ? 'rgba(162,133,57,0.4)' : 'rgba(162,133,57,0.25)'}`,
          }}
        >
          <Icon name={`${icon} text-lg`} style={{ color: '#a28539' }} />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
        <div className="flex items-baseline gap-1 mt-3">
          <span className="text-4xl font-bold text-white">{rate}</span>
          <span className="text-sm text-gray-400">{rateLabel}</span>
        </div>
      </div>

      {/* Features + deposit range + CTA */}
      <div className="p-6 flex flex-col flex-1">
        <ul className="space-y-3 mb-6 flex-1">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-gray-300 text-sm">
              <Icon name="fas fa-check-circle flex-shrink-0" style={{ color: '#a28539' }} />
              {f}
            </li>
          ))}
        </ul>

        <div
          className="flex justify-between text-sm py-3 border-t border-b mb-5"
          style={{ borderColor: dividerColor }}
        >
          <span className="text-gray-400">Min deposit</span>
          <span className="text-white font-semibold">{minDeposit}</span>
        </div>
        <div className="flex justify-between text-sm pb-5">
          <span className="text-gray-400">Max deposit</span>
          <span className="text-white font-semibold">{maxDeposit}</span>
        </div>

        <Button variant="ghost-gold" to="/register" fullWidth>
          Select Plan
        </Button>
      </div>
    </div>
  )
}
