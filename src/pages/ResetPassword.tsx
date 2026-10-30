import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthCard from '../components/ui/AuthCard'
import SectionBackground from '../components/ui/SectionBackground'
import PasswordInput from '../components/ui/PasswordInput'
import Toast, { type ToastType } from '../components/ui/Toast'

interface ToastState {
  message: string
  type: ToastType
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (message: string, type: ToastType) => setToast({ message, type })
  const clearToast = () => setToast(null)

  useEffect(() => {
    if (!token) {
      showToast('Invalid or missing reset token', 'error')
    }
  }, [token])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!token) {
      showToast('Invalid reset token', 'error')
      return
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'error')
      return
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      showToast('Password must contain uppercase, lowercase, and number', 'error')
      return
    }

    setLoading(true)
    clearToast()

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        showToast('Password reset successful! Redirecting to login...', 'success')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        showToast(data.message || 'Failed to reset password', 'error')
      }
    } catch (err) {
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <>
        {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
        <SectionBackground minHeight="100vh" className="flex items-center justify-center px-4 py-16">
          <AuthCard title="Invalid Link" subtitle="This password reset link is invalid or expired">
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(248,113,113,0.15)', border: '2px solid rgba(248,113,113,0.3)' }}
                >
                  <i className="fas fa-exclamation-triangle text-2xl" style={{ color: '#f87171' }} />
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-300">
                The password reset link you used is invalid or has expired.
              </p>

              <Link
                to="/forgot-password"
                className="w-full py-3 rounded-lg text-sm font-bold transition-all block text-center"
                style={{
                  background: 'linear-gradient(135deg, #a28539 0%, #c9a84c 50%, #a28539 100%) 0 0 / 200% 100%',
                  color: '#0d0824',
                  boxShadow: '0 4px 20px rgba(162,133,57,0.3)',
                }}
              >
                Request New Link
              </Link>
            </div>
          </AuthCard>
        </SectionBackground>
      </>
    )
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      <SectionBackground minHeight="100vh" className="flex items-center justify-center px-4 py-16">
        <AuthCard title="Reset Password" subtitle="Enter your new password">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <PasswordInput
              id="new-password"
              label="New Password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              required
            />

            <PasswordInput
              id="confirm-password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              required
            />

            <div className="text-xs text-gray-400 space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li style={{ color: password.length >= 8 ? '#4ade80' : '#6b7280' }}>
                  At least 8 characters
                </li>
                <li style={{ color: /[A-Z]/.test(password) ? '#4ade80' : '#6b7280' }}>
                  One uppercase letter
                </li>
                <li style={{ color: /[a-z]/.test(password) ? '#4ade80' : '#6b7280' }}>
                  One lowercase letter
                </li>
                <li style={{ color: /\d/.test(password) ? '#4ade80' : '#6b7280' }}>
                  One number
                </li>
                <li style={{ color: password && password === confirmPassword ? '#4ade80' : '#6b7280' }}>
                  Passwords match
                </li>
              </ul>
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
                  Resetting…
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              <i className="fas fa-arrow-left text-xs" />
              Back to Login
            </Link>
          </div>
        </AuthCard>
      </SectionBackground>
    </>
  )
}
