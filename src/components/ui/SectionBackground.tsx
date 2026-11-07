interface SectionBackgroundProps {
  children: React.ReactNode
  className?: string
  minHeight?: string
  /** Extra decorative orbs for hero-style sections */
  withOrbs?: boolean
}

/**
 * Reusable dark gradient section wrapper.
 * Optionally renders decorative background orbs.
 */
export default function SectionBackground({
  children,
  className = '',
  minHeight,
  withOrbs = false,
}: SectionBackgroundProps) {
  return (
    <section
      className={`relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #110b2d 0%, #160f35 50%, #0d0824 100%)',
        ...(minHeight ? { minHeight } : {}),
      }}
    >
      {withOrbs && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #2b1978, transparent)' }}
          />
          <div
            className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #a28539, transparent)' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #2b1978, transparent)' }}
          />
        </div>
      )}
      {children}
    </section>
  )
}
