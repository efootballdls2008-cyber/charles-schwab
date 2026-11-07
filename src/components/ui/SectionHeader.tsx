import Badge from './Badge'

interface SectionHeaderProps {
  badge?: string
  title: string
  /** Part of the title rendered in gold gradient */
  highlight?: string
  subtitle?: string
  centered?: boolean
}

/**
 * Reusable section heading block:
 * optional badge → title (with optional gold highlight) → subtitle.
 */
export default function SectionHeader({
  badge,
  title,
  highlight,
  subtitle,
  centered = true,
}: SectionHeaderProps) {
  const align = centered ? 'text-center' : 'text-left'

  // Split title around the highlight word(s) if provided
  const titleParts = highlight ? title.split(highlight) : [title]

  return (
    <div className={`space-y-4 ${align}`}>
      {badge && <Badge withDot>{badge}</Badge>}

      <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
        {titleParts[0]}
        {highlight && (
          <span
            style={{
              background: 'linear-gradient(90deg, #a28539, #c9a84c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {highlight}
          </span>
        )}
        {titleParts[1]}
      </h2>

      {subtitle && (
        <p className={`text-gray-400 text-lg leading-relaxed ${centered ? 'max-w-2xl mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
