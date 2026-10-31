import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { X, Sparkles, UserRound } from 'lucide-react'

export default function UserWelcome() {
  const { user, profile, loading } = useAuth()
  const [showWelcome, setShowWelcome] = useState(false)
  const [returning, setReturning] = useState(false)

  useEffect(() => {
    if (loading || !user) {
      setShowWelcome(false)
      setReturning(false)
      return
    }
    const key = `campus-pickup-welcomed-${user.id}`
    const hasVisited = window.localStorage.getItem(key) === 'true'
    if (hasVisited) {
      setReturning(true)
      setShowWelcome(false)
    } else {
      window.localStorage.setItem(key, 'true')
      setReturning(false)
      setShowWelcome(true)
    }
  }, [user, loading])

  if (!user) return null

  const metadataName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : ''
  const firstName = (profile?.full_name || metadataName || user.email?.split('@')[0] || 'there').trim().split(/\s+/)[0]

  return (
    <>
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
            <button type="button" onClick={() => setShowWelcome(false)} aria-label="Close welcome message" className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-100 text-orange-600"><Sparkles size={26}/></span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-orange-600">Campus Pick-Up</p>
            <h2 id="welcome-title" className="mt-2 text-2xl font-extrabold text-[#123b5d]">Welcome, {firstName}!</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Order ahead from campus vendors and spend less time waiting. Let’s get you started.</p>
            <button type="button" onClick={() => setShowWelcome(false)} className="mt-6 w-full rounded-xl bg-orange-500 py-3 font-bold text-white transition hover:bg-orange-600">Let’s go</button>
          </div>
        </div>
      )}
      {returning && !showWelcome && (
        <div className="fixed right-4 top-4 z-40 flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-sm font-semibold text-[#123b5d] shadow-lg backdrop-blur">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-orange-100 text-orange-600"><UserRound size={15}/></span>
          Hi, {firstName}
        </div>
      )}
    </>
  )
}
