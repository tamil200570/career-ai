import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { FullPageSpinner } from './LoadingSpinner'

/**
 * Wraps protected pages — redirects to /login if not authenticated.
 * Shows a full-page spinner while auth state is loading from localStorage.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <FullPageSpinner label="Authenticating..." />
  if (!user)   return <Navigate to="/login" replace />

  return children
}
