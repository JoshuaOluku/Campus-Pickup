import { useState, type FormEvent } from 'react'
import { useAuth } from './AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)

    if (result.error) {
      setError(result.error.message)
    } else {
      navigate('/onboarding')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white px-4">
      <div className="w-full max-w-sm bg-surface rounded-card shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-campus-blue">Campus Pickup</h1>
          <p className="text-slate-muted text-sm mt-1">Skip the queue. Pick up & go.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-soft-slate rounded-lg focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-transparent text-ink"
              placeholder="you@university.edu.ng"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 border border-soft-slate rounded-lg focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-transparent text-ink"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-error-red text-sm bg-red-50 p-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-electric-orange text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-muted mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            className="text-campus-blue font-semibold hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        <div className="mt-6 border-t border-soft-slate pt-4 text-center">
          <a
            href="https://form.typeform.com/to/HomcqhOf"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-electric-orange hover:underline"
          >
            Share your feedback
          </a>
          <p className="mt-1 text-xs text-slate-muted">Help us make Campus Pick-Up better.</p>
        </div>
      </div>
    </div>
  )
}