import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const isOnline = useNetworkStatus()

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-error-red text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-2 shadow-md">
      <WifiOff className="w-4 h-4" />
      <span>You are offline. Some features may not work.</span>
    </div>
  )
}