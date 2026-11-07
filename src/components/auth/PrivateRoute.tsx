import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface PrivateRouteProps {
  children: React.ReactNode
  /** Optional role requirement (e.g., 'Admin') */
  requiredRole?: string
  /** Redirect path if unauthorized (default: /login) */
  redirectTo?: string
}

/**
 * Centralized route guard for protected pages.
 * Redirects to login if not authenticated, or to home if role check fails.
 */
export default function PrivateRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: PrivateRouteProps) {
  const { isAuthenticated, user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      navigate(redirectTo, { replace: true })
      return
    }

    // Role check — if required role is specified and user doesn't have it, redirect to home
    if (requiredRole && user?.role !== requiredRole) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, user, loading, requiredRole, redirectTo, navigate])

  // Show nothing while loading or if not authenticated
  if (loading || !isAuthenticated) {
    return null
  }

  // Role check — don't render if role requirement not met
  if (requiredRole && user?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
