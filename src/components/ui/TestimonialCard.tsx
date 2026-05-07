import { useState } from 'react'
import StarRating from './StarRating'

export interface TestimonialCardProps {
  quote: string
  name: string
  role: string
  /** Accent color for the role text and border */
  accentColor?: 'blue' | 'emerald'
  /** Avatar placeholder initials (used when no real image is available) */
  initials?: string
  stars?: number
}

const quoteIcon = (
  <svg className="w-8 h-8 opacity-20" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M10 8c-3.3 0-6 2.7-6 6v10h6V14h-4c0-2.2 1.8-4 4-4zm12 0c-3.3 0-6 2.7-6 6v10h6V14h-4c0-2.2 1.8-4 4-4z" />
  </svg>
)

const accentMap = {
  blue: {
    role: 'text-blue-400',
    border: 'border-blue-500',
    glow: 'from-blue-500/20 to-emerald-400/20',
    quoteColor: 'text-blue-400',
    avatar: 'bg-blue-600',
  },
  emerald: {
    role: 'text-emerald-400',
    border: 'border-emerald-500',
    glow: 'from-emerald-500/20 to-blue-400/20',
    quoteColor: 'text-emerald-400',
    avatar: 'bg-emerald-600',
  },
}

export default function TestimonialCard({
  quote,
  name,
  role,
  accentColor = 'blue',
  initials,
  stars = 5,
}: TestimonialCardProps) {
  const [hovered, setHovered] = useState(false)
  const colors = accentMap[accentColor]

  return (
    <div
      className="relative group h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.glow} rounded-2xl blur-xl transition-opacity duration-300 pointer-events-none`}
        style={{ opacity: hovered ? 0.75 : 0 }}
        aria-hidden="true"
      />

      <div
        className="relative h-full rounded-2xl p-6 border transition-all duration-300"
        style={{
          backgroundColor: 'rgba(22,15,53,0.85)',
          borderColor: 'rgba(43,25,120,0.4)',
        }}
      >
        {/* Stars + quote icon */}
        <div className="flex items-center mb-4">
          <StarRating count={stars} />
          <div className={`${colors.quoteColor} ml-auto`}>{quoteIcon}</div>
        </div>

        {/* Quote */}
        <p className="text-gray-300 leading-relaxed text-sm mb-6">{quote}</p>

        {/* Author */}
        <div className="flex items-center mt-auto">
          {/* Avatar — initials fallback */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 ${colors.border} ${colors.avatar} flex-shrink-0`}
          >
            {initials ?? name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <h4 className="text-white font-semibold text-sm">{name}</h4>
            <p className={`${colors.role} text-xs`}>{role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
