import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { verifyPaystackPayment } from '../../lib/payments/paystackService'
import { useCart } from '../cart/CartContext'
import { CheckCircle, XCircle } from 'lucide-react'

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [message, setMessage] = useState('Verifying your payment with Paystack...')

  useEffect(() => {
    const reference = searchParams.get('reference')

    if (!reference) {
      setStatus('failed')
      setMessage('No payment reference found. Please try again.')
      return
    }

    const paymentReference: string = reference

    async function verify() {
      try {
        const result = await verifyPaystackPayment(paymentReference)
        if (result.success) {
          setStatus('success')
          setMessage('Payment successful! Your order has been placed.')
          clearCart()
          setTimeout(() => navigate('/orders'), 2500)
        } else {
          throw new Error('Verification returned false')
        }
      } catch (err) {
        setStatus('failed')
        setMessage('Payment verification failed. Please check your order history or contact support.')
      }
    }

    verify()
  }, [searchParams, navigate, clearCart])

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-surface rounded-card shadow-lg p-8 text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-campus-blue border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-xl font-bold text-campus-blue mb-2">Verifying Payment</h2>
            <p className="text-slate-muted text-sm">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-fresh-green mb-4" />
            <h2 className="text-xl font-bold text-fresh-green mb-2">Payment Successful!</h2>
            <p className="text-slate-muted text-sm mb-6">{message}</p>
            <button 
              onClick={() => navigate('/orders')}
              className="w-full bg-campus-blue text-white font-semibold py-3 rounded-lg"
            >
              Track My Order
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-error-red mb-4" />
            <h2 className="text-xl font-bold text-error-red mb-2">Payment Failed</h2>
            <p className="text-slate-muted text-sm mb-6">{message}</p>
            <button 
              onClick={() => navigate('/cart')}
              className="w-full bg-electric-orange text-white font-semibold py-3 rounded-lg"
            >
              Return to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  )
}