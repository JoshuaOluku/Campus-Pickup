import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useAuth } from '../auth/AuthContext'
import { CheckCircle, Clock, ChefHat } from 'lucide-react'

interface Order {
  id: string
  status: string
  total_price: number
  pickup_slot: string
  pickup_token: string
  created_at: string
  order_items: { quantity: number, product: { name: string } }[]
}

export default function VendorDashboard() {
  const { vendor } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!vendor?.id) return

    async function fetchInitialOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, status, total_price, pickup_slot, pickup_token, created_at,
          order_items (quantity, product:product_id(name))
        `)
        .eq('vendor_id', vendor.id)
        .in('status', ['paid', 'preparing'])
        .order('created_at', { ascending: false })

      if (!error && data) setOrders(data as any)
      setLoading(false)
    }

    fetchInitialOrders()

    // Subscribe to realtime changes for this vendor's orders
    const channel = supabase
      .channel(`vendor-orders-${vendor.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders', filter: `vendor_id=eq.${vendor.id}` }, 
        (payload) => {
          console.log('Realtime update:', payload)
          // Refetch to keep it simple and accurate
          fetchInitialOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [vendor?.id])

  async function updateOrderStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update order status.')
    }
  }

  const formatPrice = (priceInKobo: number) => `₦${(priceInKobo / 100).toLocaleString()}`

  if (loading) {
    return <div className="min-h-screen bg-off-white p-4"><div className="text-campus-blue font-semibold">Loading orders...</div></div>
  }

  return (
    <div className="min-h-screen bg-off-white p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-campus-blue">Vendor Dashboard</h1>
          <p className="text-slate-muted">Managing: <span className="font-semibold text-ink">{vendor?.name}</span></p>
        </header>

        {orders.length === 0 ? (
          <div className="bg-surface rounded-card p-8 text-center border border-soft-slate">
            <ChefHat className="w-12 h-12 text-soft-slate mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-ink">No active orders</h2>
            <p className="text-slate-muted text-sm">New orders will appear here in real-time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-surface rounded-card p-4 shadow-sm border border-soft-slate">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-slate-muted">Order ID</p>
                    <p className="font-mono text-sm text-ink">{order.id.slice(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-muted">Pickup Token</p>
                    <p className="font-mono text-xl font-bold text-campus-blue">{order.pickup_token}</p>
                  </div>
                </div>

                <div className="border-t border-soft-slate my-3" />

                <div className="space-y-2 mb-4">
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-ink"><span className="font-bold text-campus-blue">{item.quantity}x</span> {item.product?.name}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-muted">Pickup: <span className="font-semibold text-ink">{order.pickup_slot}</span></span>
                  <span className="font-bold text-campus-blue">{formatPrice(order.total_price)}</span>
                </div>

                <div className="flex gap-2">
                  {order.status === 'paid' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <ChefHat className="w-4 h-4" /> Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="flex-1 bg-fresh-green text-white font-semibold py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Ready for Pickup
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}