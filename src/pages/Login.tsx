import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/ui/AuthCard'
import SectionBackground from '../components/ui/SectionBackground'
import PasswordInput from '../components/ui/PasswordInput'
import Toast, { type ToastType } from '../components/ui/Toast'
import DashboardPreloader from '../components/ui/DashboardPreloader'
import { useAuth } from '../hooks/useAuth'

interface ToastState {
  message: string
  type: ToastType
}

// Flag key — set in sessionStorage so preloader only shows once per login
const PRELOADER_KEY = 'cs_just_logged_in'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [preloading, setPreloading] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (message: string, type: ToastType) => setToast({ message, type })
  const clearToast = () => setToast(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    clearToast()

    try {
      const success = await login(email, password)
      if (success) {
        showToast('Welcome back! Loading your dashboard…', 'success')
        // Show preloader for 2s then navigate
        setPreloading(true)
        sessionStorage.setItem(PRELOADER_KEY, 'true')
        setTimeout(() => {
          sessionStorage.removeItem(PRELOADER_KEY)
          navigate('/user/dashboard')
        }, 2000)
      } else {
        showToast('Invalid email or password. Please try again.', 'error')
        setLoading(false)
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Preloader — shown after successful login, before navigation */}
      {preloading && <DashboardPreloader />}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}

      <SectionBackground minHeight="80vh" className="flex items-center justify-center px-4 py-16">
        <AuthCard title="Welcome back" subtitle="Sign in to your trading account">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="login-email"
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

            {/* Password with eye toggle */}
            <PasswordInput
              id="login-password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold transition-all relative overflow-hidden"
              style={{
                background: loading
                  ? 'rgba(162,133,57,0.4)'
                  : 'linear-gradient(135deg, #a28539 0%, #c9a84c 50%, #a28539 100%)',
                color: '#0d0824',
                backgroundSize: '200% 100%',
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
                  Signing in…
                </span>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#a28539' }}>
              Sign Up
            </Link>
          </p>
        </AuthCard>
      </SectionBackground>
    </>
  )
}
