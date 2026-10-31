import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react'
import { useAuth } from './AuthContext'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(true)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')
    if (isSignUp && password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const result = isSignUp
        ? await signUp(email.trim(), password, fullName.trim(), phone.trim())
        : await signIn(email.trim(), password)
      if (result.error) {
        setError(result.error.message)
      } else if (isSignUp && !result.session) {
        setNotice('Your account has been created. Check your email to confirm your address, then sign in.')
        setIsSignUp(false)
        setPassword('')
        setConfirmPassword('')
      } else {
        navigate('/onboarding')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
  const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700'

  return (
    <main className="min-h-screen bg-[#f7f8fa] lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#123b5d] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 -top-24 h-96 w-96 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-sky-300/10 blur-3xl" />
        <Link to="/login" className="relative flex items-center gap-3 text-xl font-extrabold tracking-tight">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500"><GraduationCap size={25} /></span>
          Campus Pick-Up
        </Link>
        <div className="relative max-w-lg pb-12">
          <p className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">Campus life, made easier</p>
          <h1 className="text-5xl font-extrabold leading-[1.12] tracking-tight">Good food.<br />Less waiting.</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-blue-100">Discover campus vendors, order ahead and collect your food when it is ready.</p>
          <div className="mt-10 flex items-center gap-3 text-sm text-blue-100"><span className="h-2 w-2 rounded-full bg-orange-400" /> Made for your campus routine</div>
        </div>
        <p className="relative text-xs text-blue-200/70">Your campus. Your vendors. Your time.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/login" className="inline-flex items-center gap-2 text-lg font-extrabold text-[#123b5d]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white"><GraduationCap size={23} /></span>Campus Pick-Up</Link>
          </div>
          <div className="mb-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-600">{isSignUp ? 'Get started' : 'Welcome back'}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{isSignUp ? 'Create your account' : 'Sign in to continue'}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{isSignUp ? 'A few details and you are ready to explore your campus.' : 'Access your campus vendors and orders.'}</p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button type="button" onClick={() => { setIsSignUp(false); setError(''); setNotice('') }} className={`rounded-lg py-2.5 text-sm font-bold transition ${!isSignUp ? 'bg-white text-[#123b5d] shadow-sm' : 'text-slate-500'}`}>Sign in</button>
            <button type="button" onClick={() => { setIsSignUp(true); setError(''); setNotice('') }} className={`rounded-lg py-2.5 text-sm font-bold transition ${isSignUp ? 'bg-white text-[#123b5d] shadow-sm' : 'text-slate-500'}`}>Create account</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && <>
              <div><label className={labelClass}>Full name</label><div className="relative"><UserRound className="absolute left-3.5 top-3.5 text-slate-400" size={18} /><input autoComplete="name" className={fieldClass} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" required minLength={2} /></div></div>
              <div><label className={labelClass}>Phone number</label><div className="relative"><Phone className="absolute left-3.5 top-3.5 text-slate-400" size={18} /><input autoComplete="tel" type="tel" inputMode="tel" className={fieldClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000" required minLength={7} /></div></div>
            </>}
            <div><label className={labelClass}>Email address</label><div className="relative"><Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} /><input autoComplete="email" type="email" className={fieldClass} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></div></div>
            <div><label className={labelClass}>Password</label><div className="relative"><LockKeyhole className="absolute left-3.5 top-3.5 text-slate-400" size={18} /><input autoComplete={isSignUp ? 'new-password' : 'current-password'} type={showPassword ? 'text' : 'password'} className={fieldClass + ' pr-12'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            {isSignUp && <div><label className={labelClass}>Confirm password</label><div className="relative"><LockKeyhole className="absolute left-3.5 top-3.5 text-slate-400" size={18} /><input autoComplete="new-password" type={showPassword ? 'text' : 'password'} className={fieldClass} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Enter your password again" required minLength={8} /></div></div>}
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {notice && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}
            <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'} {!loading && <ArrowRight size={18} />}</button>
          </form>
          {isSignUp && <p className="mt-4 text-xs leading-5 text-slate-400">By creating an account, you agree to use Campus Pick-Up responsibly. You can choose your campus in the next step.</p>}
          <div className="mt-8 border-t border-slate-200 pt-5 text-center"><a href="https://form.typeform.com/to/HomcqhOf" target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#123b5d] hover:text-orange-600">Share your feedback</a><p className="mt-1 text-xs text-slate-400">Help us make Campus Pick-Up better.</p></div>
        </div>
      </section>
    </main>
  )
}
