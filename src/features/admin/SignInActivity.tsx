import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { Clock3, RefreshCw, Search, Activity } from 'lucide-react'

type SignInUser = {
  id: string
  full_name: string | null
  email: string | null
  role: string
  last_sign_in_at: string | null
}

type SignInEvent = {
  id: number
  user_id: string
  full_name: string | null
  email: string | null
  role: string | null
  signed_in_at: string
}

type ActivityResponse = { users?: SignInUser[]; events?: SignInEvent[] }

function formatDateTime(value: string | null) {
  if (!value) return 'Never signed in'
  return new Date(value).toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  })
}

export default function SignInActivity() {
  const [users, setUsers] = useState<SignInUser[]>([])
  const [events, setEvents] = useState<SignInEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const loadActivity = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: rpcError } = await supabase.rpc('get_founder_signin_activity')
    if (rpcError) {
      setError('Sign-in activity could not be loaded. Check that you are signed in with the founder admin account.')
    } else {
      const payload = (data ?? {}) as ActivityResponse
      setUsers(payload.users ?? [])
      setEvents(payload.events ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { void loadActivity() }, [loadActivity])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter(user =>
      (user.full_name ?? '').toLowerCase().includes(term) ||
      (user.email ?? '').toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    )
  }, [users, search])

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return events
    return events.filter(event =>
      (event.full_name ?? '').toLowerCase().includes(term) ||
      (event.email ?? '').toLowerCase().includes(term) ||
      (event.role ?? '').toLowerCase().includes(term)
    )
  }, [events, search])

  const recentUsers = users.filter(user =>
    user.last_sign_in_at && Date.now() - new Date(user.last_sign_in_at).getTime() < 7 * 24 * 60 * 60 * 1000
  ).length

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-campus-blue">Sign-in activity</h2>
          <p className="text-sm text-slate-muted">See each account's latest login and recorded sign-in events</p>
        </div>
        <button onClick={() => void loadActivity()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-soft-slate bg-surface px-3 py-2 text-sm font-semibold text-campus-blue disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-soft-slate bg-surface p-5">
          <p className="text-sm text-slate-muted">Registered accounts</p>
          <p className="mt-2 text-2xl font-bold text-campus-blue">{users.length}</p>
        </div>
        <div className="rounded-xl border border-soft-slate bg-surface p-5">
          <p className="text-sm text-slate-muted">Signed in within 7 days</p>
          <p className="mt-2 text-2xl font-bold text-campus-blue">{recentUsers}</p>
        </div>
        <div className="rounded-xl border border-soft-slate bg-surface p-5">
          <p className="text-sm text-slate-muted">Recorded login events</p>
          <p className="mt-2 text-2xl font-bold text-campus-blue">{events.length}</p>
        </div>
      </div>

      <div className="relative w-full sm:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-muted" />
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search by name, email or role"
          aria-label="Search sign-in activity"
          className="w-full rounded-lg border border-soft-slate bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-campus-blue"
        />
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-campus-blue" />
          <h3 className="font-semibold text-campus-blue">Latest sign-in by account</h3>
        </div>
        <div className="overflow-hidden rounded-xl border border-soft-slate bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-soft-slate text-left text-sm">
              <thead className="bg-off-white text-xs uppercase tracking-wide text-slate-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Last sign-in (WAT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-slate">
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{user.full_name?.trim() || 'Name not provided'}</p>
                      <p className="text-xs text-slate-muted">{user.email || '—'}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 capitalize text-ink">{user.role}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-muted">{formatDateTime(user.last_sign_in_at)}</td>
                  </tr>
                ))}
                {!loading && filteredUsers.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-muted">No matching accounts found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-campus-blue" />
          <div>
            <h3 className="font-semibold text-campus-blue">Login history</h3>
            <p className="text-xs text-slate-muted">New events are recorded from the time sign-in tracking was enabled.</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-soft-slate bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-soft-slate text-left text-sm">
              <thead className="bg-off-white text-xs uppercase tracking-wide text-slate-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Signed in at (WAT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-slate">
                {filteredEvents.map(event => (
                  <tr key={event.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{event.full_name?.trim() || 'Name not provided'}</p>
                      <p className="text-xs text-slate-muted">{event.email || '—'}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 capitalize text-ink">{event.role || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-muted">{formatDateTime(event.signed_in_at)}</td>
                  </tr>
                ))}
                {!loading && filteredEvents.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-muted">No login events have been captured yet. New successful sign-ins will appear here.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-muted">Sign-in timestamps are shown in West Africa Time (WAT). Historical event rows begin when tracking was enabled; the latest sign-in column also includes existing Supabase Auth timestamps.</p>
    </section>
  )
}
