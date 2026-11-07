interface InfoCardProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

/**
 * Dark glassmorphism card with a left vertical accent bar.
 * Used in the Education section for the "About Bitcoin" block.
 */
export default function InfoCard({ icon, title, children }: InfoCardProps) {
  return (
    <div
      className="relative rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(135deg, rgba(22,15,53,0.9), rgba(13,8,36,0.95))',
        border: '1px solid rgba(162,133,57,0.2)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
        style={{ background: 'linear-gradient(180deg, #a28539, #2b1978)' }}
        aria-hidden="true"
      />

      <div className="pl-4">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{
              background: 'rgba(162,133,57,0.12)',
              border: '1px solid rgba(162,133,57,0.25)',
            }}
          >
            {icon}
          </span>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="text-gray-400 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
