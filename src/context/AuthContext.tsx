import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { login as authLogin, fetchUser } from '../services/authService'
import type { User } from '../services/authService'

const STORAGE_KEY = 'cs_user'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateBalance: (newBalance: number) => void
  updateUser: (updated: Partial<User>) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as User) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  // Poll the server every 15 s to pick up balance changes made by admin
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)

    if (!user?.id) return

    pollRef.current = setInterval(async () => {
      try {
        const fresh = await fetchUser(user.id)
        if (fresh) {
          setUser((prev) => {
            if (!prev) return prev
            // Only update if something actually changed
            if (prev.balance === fresh.balance && prev.accountStatus === (fresh as User & { accountStatus?: string }).accountStatus) return prev
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

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await authLogin(email, password)
    if (result) {
      setUser(result)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('cs_token')
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
    <AuthContext.Provider value={{ user, login, logout, updateBalance, updateUser, isAuthenticated: user !== null }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
