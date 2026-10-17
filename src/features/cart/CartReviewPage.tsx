import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from './CartContext'
import { useAuth } from '../auth/AuthContext'
import { executeDemoCheckout } from '../checkout/checkoutService'
import { ArrowLeft, Minus, Plus, Trash2, Clock } from 'lucide-react'

const PICKUP_SLOTS = [
  'ASAP (15-20 mins)',
  '12:00 PM - 12:30 PM',
  '12:30 PM - 01:00 PM',
  '01:00 PM - 01:30 PM',
  '01:30 PM - 02:00 PM'
]

export default function CartReviewPage() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart()
  const { profile } = useAuth()
  
  const [selectedSlot, setSelectedSlot] = useState(PICKUP_SLOTS[0])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const formatPrice = (priceInKobo: number) => `₦${(priceInKobo / 100).toLocaleString()}`

  async function handleCheckout() {
    if (items.length === 0 || !profile?.campus_id) return
    
    setIsProcessing(true)
    setError('')

    try {
      const vendorId = items[0].vendor_id 
      
      await executeDemoCheckout({
        vendorId,
        campusId: profile.campus_id,
        pickupSlot: selectedSlot,
        items
      })

      clearCart()
      navigate('/orders')
      
    } catch (err: any) {
      setError(err.message || 'Checkout failed. Please try again.')
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-campus-blue mb-2">Your cart is empty</h2>
        <p className="text-slate-muted mb-6">Add some delicious items to get started.</p>
        <button onClick={() => navigate('/')} className="bg-electric-orange text-white px-6 py-3 rounded-lg font-semibold">
          Browse Vendors
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white pb-32">
      <div className="bg-surface border-b border-soft-slate sticky top-0 z-10">
        <div className="max-w-sm mx-auto px-4 py-3 flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-campus-blue">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-ink text-lg ml-2">Review Cart</h1>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 py-6">
        <div className="space-y-4 mb-8">
          {items.map(item => (
            <div key={item.id} className="bg-surface rounded-card p-4 shadow-sm border border-soft-slate flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-semibold text-ink">{item.name}</h3>
                <p className="font-bold text-campus-blue text-sm">{formatPrice(item.price)}</p>
              </div>
              
              <div className="flex items-center gap-3 bg-off-white rounded-lg p-1">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 text-slate-muted hover:text-campus-blue">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold text-ink w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-slate-muted hover:text-campus-blue">
                  <Plus className="w-4 h-4" />
                </button>
                <button onClick={() => removeFromCart(item.id)} className="p-1 text-error-red ml-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-campus-blue" /> Pickup Time
          </h2>
          <div className="space-y-2">
            {PICKUP_SLOTS.map(slot => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedSlot === slot
                    ? 'border-campus-blue bg-warm-orange text-campus-blue font-semibold'
                    : 'border-soft-slate bg-surface text-ink hover:border-campus-blue'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-soft-slate p-4 shadow-lg">
        <div className="max-w-sm mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-muted font-medium">Total</span>
            <span className="text-2xl font-bold text-campus-blue">{formatPrice(total)}</span>
          </div>
          
          {error && <p className="text-error-red text-sm mb-3 text-center">{error}</p>}
          
          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full bg-electric-orange text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Order'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}