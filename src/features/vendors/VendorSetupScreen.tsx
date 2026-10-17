import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function VendorSetupScreen() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface rounded-card shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-warm-orange rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🏪</span>
        </div>
        <h1 className="text-2xl font-bold text-campus-blue mb-2">Shop Not Set Up</h1>
        <p className="text-slate-muted mb-6">
          Your account has vendor privileges, but no shop has been assigned to you yet. 
          Please contact the platform administrator to get your store configured.
        </p>
        <button
          onClick={handleLogout}
          className="w-full bg-electric-orange text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}