interface AuthCardProps {
  title: string
  subtitle: string
  children: React.ReactNode
}

/** Shared card shell used by Login and Register pages */
export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div
      className="w-full max-w-md rounded-2xl p-8 space-y-6"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(162,133,57,0.25)',
      }}
    >
      <div className="text-center space-y-2">
        <img src="/img/logo.png" alt="Charles Schwab" className="h-10 mx-auto" />
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}
