import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { post } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'

type SubjectOption = 
  | 'Account Issue'
  | 'Deposit / Withdrawal'
  | 'Trading Problem'
  | 'KYC Verification'
  | 'Technical Issue'
  | 'Billing'
  | 'Other'

type PriorityLevel = 'low' | 'medium' | 'high'

const SUBJECT_OPTIONS: { label: SubjectOption; icon: string }[] = [
  { label: 'Account Issue', icon: 'fa-user-circle' },
  { label: 'Deposit / Withdrawal', icon: 'fa-money-bill-wave' },
  { label: 'Trading Problem', icon: 'fa-chart-line' },
  { label: 'KYC Verification', icon: 'fa-id-card' },
  { label: 'Technical Issue', icon: 'fa-wrench' },
  { label: 'Billing', icon: 'fa-credit-card' },
  { label: 'Other', icon: 'fa-question-circle' },
]

const MAX_MESSAGE_LENGTH = 2000

export default function Support() {
  const { user } = useAuth()
  const [subject, setSubject] = useState<SubjectOption | null>(null)
  const [priority, setPriority] = useState<PriorityLevel>('medium')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [ticketRef, setTicketRef] = useState('')
  const [error, setError] = useState('')

  const remainingChars = MAX_MESSAGE_LENGTH - message.length

  const handleSubmit = async () => {
    if (!subject) {
      setError('Please select a subject')
      return
    }
    if (message.trim().length < 10) {
      setError('Message must be at least 10 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await post<{ success: boolean; message: string; ticketRef: string }>(
        ENDPOINTS.support,
        {
          subject,
          message: message.trim(),
          priority,
        }
      )

      if (response.success) {
        setTicketRef(response.ticketRef)
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit support request')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSuccess(false)
    setSubject(null)
    setPriority('medium')
    setMessage('')
    setTicketRef('')
    setError('')
  }

  return (
    <DashboardLayout>
      <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#0a0619' }}>
        <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="max-w-3xl mx-auto">
            
            {/* Success State */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="rounded-2xl p-8 text-center"
                  style={{
                    background: 'rgba(13,8,36,0.95)',
                    border: '1px solid rgba(74,222,128,0.3)',
                    boxShadow: '0 0 30px rgba(74,222,128,0.1)',
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(74,222,128,0.15)' }}
                  >
                    <i className="fas fa-check-circle text-3xl" style={{ color: '#4ade80' }} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
                  <p className="text-gray-400 mb-4">
                    Your support request has been received. We typically respond within 24 hours.
                  </p>
                  <div
                    className="inline-block px-6 py-3 rounded-xl mb-6"
                    style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}
                  >
                    <p className="text-xs text-gray-400 mb-1">Ticket Reference</p>
                    <p
                      className="text-lg font-mono font-bold"
                      style={{ color: '#c9a84c' }}
                    >
                      {ticketRef}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Keep this reference number for follow-up inquiries.
                  </p>
                  <motion.button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-xl font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #a28539, #c9a84c)',
                      color: '#fff',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Submit Another Request
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form State */}
            {!success && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(201,168,76,0.15)' }}
                  >
                    <i className="fas fa-headset text-2xl" style={{ color: '#c9a84c' }} />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">Support Center</h1>
                  <p className="text-gray-400">
                    We typically respond within 24 hours
                  </p>
                </div>

                {/* Subject Selection */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: 'rgba(13,8,36,0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <label className="block text-sm font-semibold text-white mb-4">
                    What can we help you with?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SUBJECT_OPTIONS.map((option) => (
                      <motion.button
                        key={option.label}
                        onClick={() => setSubject(option.label)}
                        className="p-4 rounded-xl text-sm font-semibold transition-all"
                        style={
                          subject === option.label
                            ? {
                                background: 'rgba(201,168,76,0.2)',
                                border: '2px solid rgba(201,168,76,0.5)',
                                color: '#c9a84c',
                              }
                            : {
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: '#9ca3af',
                              }
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <i className={`fas ${option.icon} mb-2 block text-lg`} />
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Priority Level */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: 'rgba(13,8,36,0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <label className="block text-sm font-semibold text-white mb-4">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['low', 'medium', 'high'] as PriorityLevel[]).map((level) => (
                      <motion.button
                        key={level}
                        onClick={() => setPriority(level)}
                        className="py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                        style={
                          priority === level
                            ? {
                                background:
                                  level === 'low'
                                    ? 'rgba(74,222,128,0.2)'
                                    : level === 'medium'
                                    ? 'rgba(245,158,11,0.2)'
                                    : 'rgba(248,113,113,0.2)',
                                border: `2px solid ${
                                  level === 'low'
                                    ? 'rgba(74,222,128,0.5)'
                                    : level === 'medium'
                                    ? 'rgba(245,158,11,0.5)'
                                    : 'rgba(248,113,113,0.5)'
                                }`,
                                color:
                                  level === 'low'
                                    ? '#4ade80'
                                    : level === 'medium'
                                    ? '#f59e0b'
                                    : '#f87171',
                              }
                            : {
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: '#6b7280',
                              }
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              level === 'low'
                                ? '#4ade80'
                                : level === 'medium'
                                ? '#f59e0b'
                                : '#f87171',
                          }}
                        />
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: 'rgba(13,8,36,0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <label className="block text-sm font-semibold text-white mb-4">
                    💬 Describe your issue
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                    placeholder="Please provide as much detail as possible..."
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl text-white resize-none outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    onFocus={(e) => {
                      e.target.style.border = '1px solid rgba(162,133,57,0.5)'
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '1px solid rgba(255,255,255,0.08)'
                    }}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`text-sm ${
                        remainingChars < 100 ? 'text-red-400' : 'text-gray-500'
                      }`}
                    >
                      {remainingChars} characters remaining
                    </span>
                    <span className="text-xs text-gray-600">
                      Min 10 characters
                    </span>
                  </div>
                </div>

                {/* User Info */}
                <div
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{
                    background: 'rgba(13,8,36,0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #a28539, #c9a84c)' }}
                  >
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(248,113,113,0.1)',
                      border: '1px solid rgba(248,113,113,0.3)',
                    }}
                  >
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                  style={{
                    background: loading
                      ? 'rgba(107,114,128,0.3)'
                      : 'linear-gradient(135deg, #a28539, #c9a84c)',
                    color: '#fff',
                  }}
                  whileHover={!loading ? { scale: 1.01 } : undefined}
                  whileTap={!loading ? { scale: 0.99 } : undefined}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane" />
                      Send Support Request
                    </>
                  )}
                </motion.button>

                {/* Info Badges */}
                <div className="flex items-center justify-center gap-6 pt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <i className="far fa-clock" />
                    24hrs response
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <i className="fas fa-lock" />
                    Secure
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <i className="fas fa-headset" />
                    24/7 Available
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
