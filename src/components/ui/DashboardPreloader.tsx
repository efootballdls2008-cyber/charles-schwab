/** Full-screen animated preloader shown before the dashboard mounts */
export default function DashboardPreloader() {
  return (
    <div
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-6"
      style={{ background: 'linear-gradient(135deg, #0d0824 0%, #110b2d 50%, #0d0824 100%)' }}
      aria-label="Loading dashboard"
      role="status"
    >
      {/* Logo */}
      <img src="/img/logo.png" alt="Charles Schwab" className="h-12 w-auto opacity-90" />

      {/* Spinner ring */}
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full border-4"
          style={{ borderColor: 'rgba(162,133,57,0.15)' }}
        />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
          style={{
            borderTopColor: '#c9a84c',
            borderRightColor: 'rgba(162,133,57,0.4)',
            animationDuration: '0.9s',
          }}
        />
        {/* Inner pulse dot */}
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: '#c9a84c' }}
          />
        </div>
      </div>

      {/* Text */}
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-white">Loading your dashboard</p>
        <p className="text-xs" style={{ color: '#6b7280' }}>Fetching your portfolio data…</p>
      </div>

      {/* Animated dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{
              backgroundColor: '#c9a84c',
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.8s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
