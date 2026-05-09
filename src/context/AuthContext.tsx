import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { login as authLogin, fetchUser, refreshToken } from '../services/authService'
import type { User } from '../services/authService'
import { registerUnauthorizedHandler, clearUnauthorizedHandler } from '../api/client'
import { useToast } from './ToastContext'
import { botEngine } from '../engine/botEngine'

const STORAGE_KEY = 'cs_user'
const TOKEN_KEY = 'cs_token'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateBalance: (newBalance: number) => void
  updateUser: (updated: Partial<User>) => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  /** Clear session state and storage, optionally showing a reason toast. */
  const clearSession = (reason?: string) => {
    botEngine.reset()
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(TOKEN_KEY)
    clearUnauthorizedHandler()
    if (reason) {
      showToast(reason, 'error', 6000)
    }
  }

  // Verify token on mount
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem(TOKEN_KEY)
      const storedUser = localStorage.getItem(STORAGE_KEY)

      if (!token || !storedUser) {
        setLoading(false)
        return
      }

      try {
        // Verify token is still valid by fetching current user
        const fresh = await fetchUser()
        if (fresh) {
          setUser(fresh)
          // Register 401 handler — fires when any authenticated request gets a 401
          registerUnauthorizedHandler(() => {
            clearSession('Your session has expired. Please log in again.')
          })
        } else {
          // Token invalid or expired — clear everything silently (cold start)
          clearSession()
        }
      } catch {
        // Network error or 401 — clear session silently (cold start)
        clearSession()
      } finally {
        setLoading(false)
      }
    }

    verifySession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  // Poll the server every 15 s to pick up any changes made by admin
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)

    if (!user?.id) return

    pollRef.current = setInterval(async () => {
      try {
        const fresh = await fetchUser()
        if (fresh) {
          setUser((prev) => {
            if (!prev) return prev
            const changed =
              prev.balance       !== fresh.balance       ||
              prev.accountStatus !== fresh.accountStatus ||
              prev.role          !== fresh.role          ||
              prev.firstName     !== fresh.firstName     ||
              prev.lastName      !== fresh.lastName      ||
              prev.avatar        !== fresh.avatar        ||
              prev.email         !== fresh.email
            if (!changed) return prev
            const updated = { ...prev, ...fresh }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
            return updated
          })
        }
      } catch {
        // silently ignore network errors during polling
      }
    }, 15000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [user?.id])

  // Proactively refresh the JWT 1 day before it expires (token is 7d, refresh at 6d)
  const refreshRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (refreshRef.current) clearTimeout(refreshRef.current)
    if (!user?.id) return

    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    try {
      // Decode the JWT payload to read the `exp` claim for refresh scheduling.
      // NOTE: This is intentionally NOT a security check — we are not verifying
      // the signature here. That is fine because:
      //   1. The token was already verified by the server when it was issued.
      //   2. Every authenticated API request re-validates the token server-side.
      //   3. We only use `exp` to schedule a proactive refresh; a tampered `exp`
      //      would at worst delay or skip the refresh, not grant extra access.
      // Never use client-side decoded claims for authorization decisions.
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiresAt = payload.exp * 1000
      const refreshAt = expiresAt - 24 * 60 * 60 * 1000 // 1 day before expiry
      const delay = refreshAt - Date.now()

      if (delay > 0) {
        refreshRef.current = setTimeout(async () => {
          try {
            const newToken = await refreshToken()
            if (newToken) {
              localStorage.setItem(TOKEN_KEY, newToken)
            }
          } catch {
            // If refresh fails the next /auth/me poll will catch the 401 and log out
          }
        }, delay)
      }
    } catch {
      // Malformed token — ignore, the 401 handler will clean up
    }

    return () => {
      if (refreshRef.current) clearTimeout(refreshRef.current)
    }
  }, [user?.id])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Let errors propagate — callers are responsible for catching and displaying them
    const result = await authLogin(email, password)
    if (result) {
      setUser(result)
      // Register the 401 handler now that the user is authenticated
      registerUnauthorizedHandler(() => {
        clearSession('Your session has expired. Please log in again.')
      })
      return true
    }
    return false
  }

  const logout = () => {
    clearSession()
  }

  const updateBalance = (newBalance: number) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, balance: newBalance }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const updateUser = (fields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...fields }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateBalance, updateUser, isAuthenticated: user !== null, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
