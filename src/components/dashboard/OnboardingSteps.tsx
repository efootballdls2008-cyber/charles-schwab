import { useState } from 'react'
import { motion } from 'framer-motion'

interface Step {
  icon: string
  title: string
  description: string
  cta: string
  color: string
}

const STEPS: Step[] = [
  {
    icon: 'fas fa-user-circle',
    title: 'Complete Your Profile',
    description: 'Add your personal details and verify your identity to unlock full trading access.',
    cta: 'Complete Profile',
    color: '#c9a84c',
  },
  {
    icon: 'fas fa-wallet',
    title: 'Fund Your Account',
    description: 'Deposit funds via bank transfer, card, or crypto to start trading immediately.',
    cta: 'Deposit Funds',
    color: '#4ade80',
  },
  {
    icon: 'fas fa-chart-line',
    title: 'Make Your First Trade',
    description: 'Explore markets and place your first trade. Start with a demo account if you prefer.',
    cta: 'Start Trading',
    color: '#60a5fa',
  },
  {
    icon: 'fas fa-shield-alt',
    title: 'Enable 2FA Security',
    description: 'Protect your account with two-factor authentication for maximum security.',
    cta: 'Enable 2FA',
    color: '#a78bfa',
  },
]

interface OnboardingStepsProps {
  onDismiss: () => void
}

export default function OnboardingSteps({ onDismiss }: OnboardingStepsProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())

  const handleStepAction = (index: number) => {
    setCompleted((prev) => new Set([...prev, index]))
    if (index < STEPS.length - 1) {
      setActiveStep(index + 1)
    }
  }

  const allDone = completed.size === STEPS.length

  return (
    <motion.div
      className="rounded-2xl p-6 mb-6"
      style={{
        background: 'rgba(22,15,53,0.9)',
        border: '1px solid rgba(162,133,57,0.2)',
      }}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <i className="fas fa-rocket text-sm" style={{ color: '#c9a84c' }} aria-hidden="true" />
            Get Started — Setup Checklist
          </h2>
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
            Complete these steps to unlock your full trading experience
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress */}
          <span className="text-xs font-semibold" style={{ color: '#c9a84c' }}>
            {completed.size}/{STEPS.length} done
          </span>
          <button
            onClick={onDismiss}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
            aria-label="Dismiss onboarding"
          >
            <i className="fas fa-times text-xs text-gray-500" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1.5 rounded-full mb-5 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(completed.size / STEPS.length) * 100}%`,
            background: 'linear-gradient(90deg, #a28539, #c9a84c)',
          }}
        />
      </div>

      {allDone ? (
        /* All done state */
        <div className="text-center py-4 space-y-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}
          >
            <i className="fas fa-check-circle text-2xl" style={{ color: '#4ade80' }} aria-hidden="true" />
          </div>
          <p className="text-white font-semibold">You're all set!</p>
          <p className="text-xs text-gray-400">Your account is fully configured. Happy trading!</p>
          <button
            onClick={onDismiss}
            className="px-5 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }}
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        /* Steps grid */
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {STEPS.map((step, i) => {
            const isDone = completed.has(i)
            const isActive = activeStep === i && !isDone

            return (
              <motion.div
                key={step.title}
                className="rounded-xl p-4 flex flex-col gap-3 transition-all cursor-pointer"
                style={{
                  background: isActive
                    ? `${step.color}10`
                    : isDone
                    ? 'rgba(74,222,128,0.05)'
                    : 'rgba(255,255,255,0.03)',
                  border: isActive
                    ? `1px solid ${step.color}40`
                    : isDone
                    ? '1px solid rgba(74,222,128,0.2)'
                    : '1px solid rgba(255,255,255,0.06)',
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
                }}
                onClick={() => !isDone && setActiveStep(i)}
              >
                {/* Step number + icon */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isDone
                        ? 'rgba(74,222,128,0.15)'
                        : `${step.color}18`,
                      border: isDone
                        ? '1px solid rgba(74,222,128,0.3)'
                        : `1px solid ${step.color}40`,
                    }}
                  >
                    <i
                      className={isDone ? 'fas fa-check text-xs' : `${step.icon} text-xs`}
                      style={{ color: isDone ? '#4ade80' : step.color }}
                      aria-hidden="true"
                    />
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: isDone ? '#4ade80' : 'rgba(255,255,255,0.2)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white leading-snug">{step.title}</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6b7280' }}>
                    {step.description}
                  </p>
                </div>

                {/* CTA */}
                {!isDone && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStepAction(i) }}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                    style={
                      isActive
                        ? { background: step.color, color: '#0d0824' }
                        : { background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }
                    }
                  >
                    {step.cta}
                  </button>
                )}
                {isDone && (
                  <span className="text-xs font-semibold text-center" style={{ color: '#4ade80' }}>
                    ✓ Completed
                  </span>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
