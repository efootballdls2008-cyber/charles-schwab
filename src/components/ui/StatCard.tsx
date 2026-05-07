interface StatCardProps {
  value: string
  label: string
  featured?: boolean
  icon: React.ReactNode
}

/** Single stat card used inside StatsStrip */
export default function StatCard({ value, label, featured = false, icon }: StatCardProps) {
  return (
    <li className={`stat-card${featured ? ' stat-card--featured' : ''}`}>
      <div className={`stat-icon${featured ? ' stat-icon--featured' : ''}`}>
        {icon}
      </div>
      <p className="font-bold text-lg leading-tight" style={{ color: '#c9a84c' }}>
        {value}
      </p>
      <p className="text-xs font-medium mt-0.5 leading-tight" style={{ color: 'rgba(200,200,216,0.6)' }}>
        {label}
      </p>
    </li>
  )
}
