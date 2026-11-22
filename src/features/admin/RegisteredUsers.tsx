import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { RefreshCw, Search, Users } from 'lucide-react'

type RegisteredUser = {
  id: string
  full_name: string | null
  email: string | null
  role: string
  created_at: string
  last_sign_in_at: string | null
}

type ActivityResponse = { users?: RegisteredUser[] }

function formatDateTime(value: string | null) {
  if (!value) return 'Never signed in'
  return new Date(value).toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  })
}

export default function RegisteredUsers() {
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: rpcError } = await supabase.rpc('get_founder_signin_activity')
    if (rpcError) {
      setError('Registered users could not be loaded. Check that you are signed in with the founder admin account.')
    } else {
      setUsers(((data as ActivityResponse | null)?.users ?? []) as RegisteredUser[])
    }
    setLoading(false)
  }, [])

  useEffect(() => { void loadUsers() }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter(user =>
      (user.full_name ?? '').toLowerCase().includes(term) ||
      (user.email ?? '').toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    )
  }, [users, search])

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-campus-blue">Registered users</h2>
          <p className="text-sm text-slate-muted">Account details and each user's most recent sign-in</p>
        </div>
        <button onClick={() => void loadUsers()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-soft-slate bg-surface px-3 py-2 text-sm font-semibold text-campus-blue disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-muted" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search name, email or role"
            aria-label="Search registered users"
            className="w-full rounded-lg border border-soft-slate bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-campus-blue"
          />
        </div>
        <p className="text-sm text-slate-muted">{filteredUsers.length} of {users.length} users</p>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
      {loading && users.length === 0 ? (
        <div className="rounded-xl border border-soft-slate bg-surface p-8 text-center text-sm text-slate-muted">Loading registered users…</div>
      ) : !error && filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-soft-slate bg-surface p-8 text-center">
          <Users className="mx-auto mb-2 h-6 w-6 text-slate-muted" />
          <p className="text-sm text-slate-muted">{users.length === 0 ? 'No registered users found.' : 'No users match your search.'}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-soft-slate bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-soft-slate text-left text-sm">
              <thead className="bg-off-white text-xs uppercase tracking-wide text-slate-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Registered</th>
                  <th className="px-4 py-3 font-semibold">Last sign-in (WAT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-slate">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-off-white/70">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">{user.full_name?.trim() || 'Name not provided'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-muted">{user.email || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 capitalize text-ink">{user.role}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-muted">{new Date(user.created_at).toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' })}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-muted">{formatDateTime(user.last_sign_in_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="text-xs text-slate-muted">Last sign-in comes from Supabase Auth. Times are displayed in West Africa Time (WAT). This list excludes sign-ups that have not created a profile.</p>
    </section>
  )
}
