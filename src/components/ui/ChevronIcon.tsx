interface ChevronIconProps {
  open: boolean
  className?: string
  style?: React.CSSProperties
}

/** Animated chevron that rotates 180° when open */
export default function ChevronIcon({ open, className = 'h-3.5 w-3.5', style }: ChevronIconProps) {
  return (
    <svg
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      style={style}
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  )
}
