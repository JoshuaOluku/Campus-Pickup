import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import VendorSetupScreen from '../vendors/VendorSetupScreen'

interface Props {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, profile, vendor, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-campus-blue font-semibold">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Onboarding check
  if (profile && !profile.is_onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  // Vendor Dashboard specific logic (separates /vendor from /vendor/:slug)
  const pathParts = location.pathname.split('/').filter(Boolean)
  const isVendorDashboard = pathParts[0] === 'vendor' && pathParts.length === 1

  if (isVendorDashboard) {
    if (profile?.role !== 'vendor') {
      return <Navigate to="/" replace />
    }
    if (!vendor) {
      return <VendorSetupScreen />
    }
    return <>{children}</>
  }

  // Admin specific logic
  if (location.pathname.startsWith('/admin')) {
    if (profile?.role !== 'admin') {
      return <Navigate to="/" replace />
    }
    return <>{children}</>
  }

  // Generic role-based access check
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}