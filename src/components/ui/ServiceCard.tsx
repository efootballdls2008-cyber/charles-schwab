import Icon from './Icon'

export interface ServiceCardProps {
  icon: string        // FontAwesome class
  title: string
  items: string[]
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.10)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
}

/**
 * Service card — circular icon, title, and a gold-checked list.
 */
export default function ServiceCard({ icon, title, items }: ServiceCardProps) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
      style={cardStyle}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
        style={{
          background: 'rgba(162,133,57,0.18)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(162,133,57,0.25)',
        }}
      >
        <Icon name={`${icon} text-xl`} style={{ color: '#a28539' }} />
      </div>

      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>

      <ul className="space-y-3 text-gray-300">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <Icon name="fas fa-check-circle text-sm flex-shrink-0" style={{ color: '#a28539' }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
