/**
 * SocketContext — manages a single Socket.io connection per authenticated session.
 *
 * - Connects when a JWT token is present in localStorage
 * - Disconnects and reconnects when the token changes (login / logout)
 * - Exposes the socket instance to all consumers via useSocket()
 *
 * Token changes within the same tab are detected via AuthContext (no polling).
 * Cross-tab changes are detected via the native `storage` event.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../hooks/useAuth'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface SocketContextValue {
  socket: Socket | null
  connected: boolean
}

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false })

export function SocketProvider({ children }: { children: ReactNode }) {
  // Derive token from AuthContext — no polling needed for same-tab changes.
  // When the user logs in or out, AuthContext updates `isAuthenticated` which
  // triggers a re-render here and the socket effect below reconnects/disconnects.
  const { isAuthenticated } = useAuth()
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cs_token'))
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  // Sync token state whenever auth status changes within this tab
  useEffect(() => {
    setToken(localStorage.getItem('cs_token'))
  }, [isAuthenticated])

  // Cross-tab changes (login/logout in another tab)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cs_token') setToken(e.newValue)
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Connect / disconnect socket when token changes
  useEffect(() => {
    if (!token) {
      setSocket((prev) => {
        prev?.disconnect()
        return null
      })
      setConnected(false)
      return
    }

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    s.on('connect_error', (err) => console.warn('[socket] Error:', err.message))

    setSocket(s)

    return () => {
      s.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [token])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket(): SocketContextValue {
  return useContext(SocketContext)
}
