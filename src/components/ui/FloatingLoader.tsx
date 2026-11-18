import { Coffee, ShoppingBag, Utensils } from 'lucide-react'

export default function FloatingLoader({ label = 'Loading Campus Pick-Up' }: { label?: string }) {
  return <div role="status" aria-label={label} className="flex min-h-[60vh] flex-col items-center justify-center bg-[#f7f8fa] px-5 text-center">
    <div className="floating-loader-scene relative mb-5 h-20 w-32">
      <span className="floating-loader-icon floating-loader-one"><ShoppingBag size={25}/></span>
      <span className="floating-loader-icon floating-loader-two"><Utensils size={25}/></span>
      <span className="floating-loader-icon floating-loader-three"><Coffee size={25}/></span>
    </div>
    <p className="text-sm font-bold text-[#123b5d]">{label}</p><p className="mt-1 text-xs text-slate-400">Just a moment...</p>
  </div>
}
