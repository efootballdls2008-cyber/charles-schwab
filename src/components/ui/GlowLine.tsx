type GlowLineVariant = 'top' | 'bottom' | 'divider'

interface GlowLineProps {
  variant?: GlowLineVariant
  className?: string
}

const gradients: Record<GlowLineVariant, string> = {
  top: 'linear-gradient(90deg, transparent 0%, #a28539 30%, #c9a84c 50%, #a28539 70%, transparent 100%)',
  bottom: 'linear-gradient(90deg, transparent 0%, rgba(162,133,57,0.4) 50%, transparent 100%)',
  divider: 'linear-gradient(90deg, transparent, #a28539, #2b1978, #a28539, transparent)',
}

/** A 1px horizontal gradient glow line */
export default function GlowLine({ variant = 'divider', className = '' }: GlowLineProps) {
  return (
    <div
      className={`h-px w-full ${className}`}
      style={{ background: gradients[variant], opacity: variant === 'top' ? 0.8 : 1 }}
      aria-hidden="true"
    />
  )
}
