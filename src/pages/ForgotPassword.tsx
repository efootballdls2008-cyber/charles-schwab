import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthCard from '../components/ui/AuthCard'
import SectionBackground from '../components/ui/SectionBackground'
import Toast, { type ToastType } from '../components/ui/Toast'

interface ToastState {
  message: string
  type: ToastType
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (message: string, type: ToastType) => setToast({ message, type })
  const clearToast = () => setToast(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    clearToast()

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitted(true)
        showToast('Password reset link sent! Check your email.', 'success')
      } else {
        showToast(data.message || 'Failed to send reset link', 'error')
      }
    } catch (err) {
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}

      <SectionBackground minHeight="100vh" className="flex items-center justify-center px-4 py-16">
        <AuthCard 
          title={submitted ? 'Check Your Email' : 'Forgot Password'} 
          subtitle={submitted ? 'We sent you a reset link' : 'Enter your email to reset password'}
        >
          {submitted ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #a28539, #c9a84c)' }}
                >
                  <i className="fas fa-envelope text-2xl" style={{ color: '#0d0824' }} />
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-300">
                If an account exists for <span className="font-semibold" style={{ color: '#a28539' }}>{email}</span>, you will receive a password reset link shortly.
              </p>
              
              <p className="text-center text-xs text-gray-400">
                The link will expire in 1 hour. Check your spam folder if you don't see it.
              </p>

              <div className="pt-4">
                <Link
                  to="/login"
                  className="w-full py-3 rounded-lg text-sm font-bold transition-all block text-center"
                  style={{
                    background: 'linear-gradient(135deg, #a28539 0%, #c9a84c 50%, #a28539 100%) 0 0 / 200% 100%',
                    color: '#0d0824',
                    boxShadow: '0 4px 20px rgba(162,133,57,0.3)',
                  }}
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-100 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(162,133,57,0.2)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(162,133,57,0.5)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(162,133,57,0.08)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(162,133,57,0.2)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-sm font-bold transition-all relative overflow-hidden"
                style={{
                  background: loading
                    ? 'rgba(162,133,57,0.4)'
                    : 'linear-gradient(135deg, #a28539 0%, #c9a84c 50%, #a28539 100%) 0 0 / 200% 100%',
                  color: '#0d0824',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(162,133,57,0.3)',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending…
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {!submitted && (
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                <i className="fas fa-arrow-left text-xs" />
                Back to Login
              </Link>
            </div>
          )}
        </AuthCard>
      </SectionBackground>
    </>
  )
}
