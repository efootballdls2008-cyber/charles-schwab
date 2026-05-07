import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/ui/AuthCard'
import SectionBackground from '../components/ui/SectionBackground'
import PasswordInput from '../components/ui/PasswordInput'
import Toast, { type ToastType } from '../components/ui/Toast'
import { register } from '../services/authService'
import { useAuth } from '../hooks/useAuth'

interface ToastState {
  message: string
  type: ToastType
}

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [toast, setToast]         = useState<ToastState | null>(null)

  const showToast = (message: string, type: ToastType) => setToast({ message, type })
  const clearToast = () => setToast(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error')
      return
    }
    setLoading(true)
    clearToast()

    try {
      const user = await register(firstName, lastName, email, password)
      if (user) {
        showToast('Account created! Signing you in…', 'success')
        // Auto-login after registration
        await login(email, password)
        setTimeout(() => navigate('/user/dashboard'), 1400)
      } else {
        showToast('An account with this email already exists.', 'error')
      }
    } catch {
      showToast('Registration failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(162,133,57,0.2)',
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(162,133,57,0.5)'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(162,133,57,0.08)'
  }
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(162,133,57,0.2)'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}

      <SectionBackground minHeight="80vh" className="flex items-center justify-center px-4 py-16">
        <AuthCard title="Create your account" subtitle="Start trading in minutes">
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* First + Last name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-first" className="block text-sm font-medium text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  id="reg-first"
                  type="text"
                  placeholder="John"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-100 text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div>
                <label htmlFor="reg-last" className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  id="reg-last"
                  type="text"
                  placeholder="Doe"
                  autoComplete="family-name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-100 text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-gray-100 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Password with eye toggle */}
            <PasswordInput
              id="reg-password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              placeholder="Min. 6 characters"
              required
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold transition-all"
              style={{
                background: loading
                  ? 'rgba(162,133,57,0.4)'
                  : 'linear-gradient(135deg, #a28539 0%, #c9a84c 50%, #a28539 100%)',
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
                  Creating account…
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#a28539' }}>
              Log In
            </Link>
          </p>
        </AuthCard>
      </SectionBackground>
    </>
  )
}
