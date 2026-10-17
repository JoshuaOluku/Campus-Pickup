import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useAuth } from '../auth/AuthContext'
import { QRCodeSVG } from 'qrcode.react'
import { Clock } from 'lucide-react'

interface Order {
  id: string
  status: string
  total_price: number
  pickup_slot: string
  pickup_token: string
  created_at: string
  vendor: { name: string }
}

export default function OrderTrackingPage() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return

    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total_price, pickup_slot, pickup_token, created_at, vendor:vendor_id(name)')
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false })

      if (!error && data) setOrders(data as any)
      setLoading(false)
    }

    fetchOrders()
  }, [profile?.id])

  const formatPrice = (priceInKobo: number) => `₦${(priceInKobo / 100).toLocaleString()}`
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-amber-warn bg-amber-50'
      case 'preparing': return 'text-blue-600 bg-blue-50'
      case 'ready': return 'text-fresh-green bg-green-50'
      case 'picked_up': return 'text-slate-muted bg-slate-100'
      default: return 'text-slate-muted bg-slate-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white p-4">
        <div className="max-w-sm mx-auto space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-soft-slate rounded-card animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white p-4 pb-20">
      <div className="max-w-sm mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-campus-blue">My Orders</h1>
          <p className="text-slate-muted text-sm">Track your active and past orders.</p>
        </header>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-muted">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-surface rounded-card shadow-sm border border-soft-slate overflow-hidden">
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center"
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                >
                  <div>
                    <h3 className="font-bold text-ink">{order.vendor?.name || 'Unknown Vendor'}</h3>
                    <p className="text-xs text-slate-muted mt-1">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <p className="font-bold text-campus-blue mt-1">{formatPrice(order.total_price)}</p>
                  </div>
                </div>

                {expandedOrderId === order.id && (
                  <div className="border-t border-soft-slate p-4 bg-off-white">
                    <div className="flex flex-col items-center text-center">
                      <p className="text-sm text-slate-muted mb-2">Show this code at pickup</p>
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-soft-slate mb-3">
                        <QRCodeSVG value={order.pickup_token} size={120} />
                      </div>
                      <p className="text-3xl font-mono font-bold text-campus-blue tracking-widest">
                        {order.pickup_token}
                      </p>
                      <div className="mt-4 w-full text-left bg-surface p-3 rounded-lg border border-soft-slate">
                        <p className="text-xs text-slate-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pickup Slot
                        </p>
                        <p className="font-semibold text-ink">{order.pickup_slot}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}