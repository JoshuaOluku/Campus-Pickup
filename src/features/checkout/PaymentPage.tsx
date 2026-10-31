import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, CreditCard, ShieldAlert, CheckCircle2, X } from 'lucide-react'

type Method = 'transfer' | 'card'

export default function PaymentPage() {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [method, setMethod] = useState<Method>('transfer')
  const [showNotice, setShowNotice] = useState(true)
  const [showComplete, setShowComplete] = useState(false)

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-lg">
        <button onClick={() => navigate('/cart')} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#123b5d]"><ArrowLeft size={18}/> Back to cart</button>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <header className="bg-[#123b5d] px-6 py-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-200">Campus Pick-Up</p>
            <h1 className="mt-1 text-2xl font-bold">Checkout</h1>
            <p className="mt-1 text-sm text-blue-100">Choose how you would normally pay.</p>
          </header>
          <div className="p-5 sm:p-6">
            <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 shrink-0 text-amber-700" size={22}/>
                <div><p className="font-bold text-amber-900">TEST MODE — DO NOT PAY</p><p className="mt-1 text-sm leading-5 text-amber-900">This is a payment-flow preview for testers only. No payment will be collected. Do not transfer money, enter real card details, or share banking information.</p></div>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <button onClick={() => setMethod('transfer')} className={`rounded-xl border-2 p-4 text-left transition ${method === 'transfer' ? 'border-[#123b5d] bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <Building2 className="mb-3 text-[#123b5d]" size={22}/><span className="block font-bold">Bank transfer</span><span className="text-xs text-slate-500">Demo account view</span>
              </button>
              <button onClick={() => setMethod('card')} className={`rounded-xl border-2 p-4 text-left transition ${method === 'card' ? 'border-[#123b5d] bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <CreditCard className="mb-3 text-[#123b5d]" size={22}/><span className="block font-bold">Card</span><span className="text-xs text-slate-500">Demo card view</span>
              </button>
            </div>

            {method === 'transfer' ? (
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Bank transfer details</h2><span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">SAMPLE ONLY</span></div>
                <div className="space-y-3 rounded-lg bg-slate-50 p-4 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-slate-500">Bank</span><strong>Demo Bank (not a real bank)</strong></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-500">Account name</span><strong>Campus Pick-Up Demo</strong></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-500">Account number</span><strong className="text-amber-800">XXXX XXXX XX</strong></div>
                  <p className="border-t border-slate-200 pt-3 text-xs font-semibold text-amber-800">No valid account details are provided. DO NOT TRANSFER.</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Card payment</h2><span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">PREVIEW</span></div>
                <div className="rounded-xl bg-gradient-to-br from-[#123b5d] to-[#23658a] p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between"><span className="text-xs tracking-widest text-blue-100">CAMPUS PICK-UP</span><CreditCard size={25}/></div>
                  <p className="mt-8 text-xl tracking-[.2em]">•••• •••• •••• ••••</p>
                  <div className="mt-5 flex justify-between text-xs text-blue-100"><span>TEST CARDHOLDER</span><span>MM/YY</span></div>
                </div>
                <p className="mt-3 text-sm leading-5 text-slate-500">This is a visual card preview only. No card form is connected and no card information should be entered.</p>
              </div>
            )}

            <button onClick={() => setShowComplete(true)} className="mt-6 w-full rounded-xl bg-[#123b5d] py-4 font-bold text-white transition hover:bg-[#174c73]">Continue demo</button>
            <p className="mt-3 text-center text-xs text-slate-400">Order reference: {orderId?.slice(0, 8) || 'Demo'} · No payment gateway connected</p>
          </div>
        </section>
      </div>

      {showNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="demo-warning-title" className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <button onClick={() => setShowNotice(false)} aria-label="Close notice" className="absolute right-3 top-3 rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button>
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-700"><ShieldAlert size={24}/></div>
            <h2 id="demo-warning-title" className="text-xl font-extrabold text-slate-900">Please do not make a payment</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">You are viewing a simulated checkout for product testing. No money will be collected. Do not transfer to any account or enter real card details.</p>
            <button onClick={() => setShowNotice(false)} className="mt-5 w-full rounded-xl bg-[#123b5d] py-3 font-bold text-white">I understand</button>
          </div>
        </div>
      )}

      {showComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-green-100 text-green-700"><CheckCircle2 size={30}/></div>
            <h2 className="text-xl font-extrabold text-slate-900">Demo completed</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">You have completed the payment-flow preview. No payment was made and your order has not been marked as paid.</p>
            <button onClick={() => navigate('/orders')} className="mt-5 w-full rounded-xl bg-[#123b5d] py-3 font-bold text-white">View my orders</button>
          </div>
        </div>
      )}
    </main>
  )
}
