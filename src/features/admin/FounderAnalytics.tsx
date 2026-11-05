import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { Users, UserPlus, ClipboardCheck, ShoppingBag, Store, RefreshCw } from 'lucide-react'

type Analytics = {
  total_users: number
  new_users_7d: number
  onboarded_users: number
  total_orders: number
  orders_7d: number
  total_vendors: number
  daily_signups: { day: string; count: number }[]
}

const metrics = [
  { key: 'total_users', label: 'Registered users', icon: Users },
  { key: 'new_users_7d', label: 'New users · 7 days', icon: UserPlus },
  { key: 'onboarded_users', label: 'Completed onboarding', icon: ClipboardCheck },
  { key: 'total_orders', label: 'Orders created', icon: ShoppingBag },
  { key: 'orders_7d', label: 'Orders · 7 days', icon: RefreshCw },
  { key: 'total_vendors', label: 'Vendors', icon: Store },
] as const

export default function FounderAnalytics() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data: result, error: rpcError } = await supabase.rpc('get_founder_analytics')
    if (rpcError) setError('Analytics could not be loaded. Check your account access and database connection.')
    else setData(result as Analytics)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const maxCount = Math.max(1, ...(data?.daily_signups ?? []).map(item => item.count))

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-bold text-campus-blue">Founder analytics</h2><p className="text-sm text-slate-muted">Private overview · Joshua's account only</p></div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-soft-slate bg-surface px-3 py-2 text-sm font-semibold text-campus-blue disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}/> Refresh</button>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
      {loading && !data ? <div className="rounded-xl border border-soft-slate bg-surface p-8 text-center text-sm text-slate-muted">Loading your analytics…</div> : null}

      {data && <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map(({ key, label, icon: Icon }) => (
            <article key={key} className="rounded-xl border border-soft-slate bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between"><p className="text-sm text-slate-muted">{label}</p><Icon className="h-5 w-5 text-campus-blue"/></div>
              <p className="mt-3 text-3xl font-bold text-campus-blue">{data[key].toLocaleString()}</p>
            </article>
          ))}
        </div>

        <article className="rounded-xl border border-soft-slate bg-surface p-5 shadow-sm">
          <h3 className="font-bold text-campus-blue">Daily registrations</h3>
          <p className="mb-5 text-xs text-slate-muted">Last 14 days · based on profile creation date</p>
          {data.daily_signups.length === 0 ? <p className="text-sm text-slate-muted">No registrations recorded in this period.</p> : (
            <div className="flex h-44 items-end gap-2 overflow-x-auto">
              {data.daily_signups.map(item => (
                <div key={item.day} className="flex h-full min-w-8 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs font-semibold text-campus-blue">{item.count}</span>
                  <div title={`${item.day}: ${item.count} registrations`} className="w-full max-w-10 rounded-t-md bg-electric-orange" style={{ height: `${Math.max(5, item.count / maxCount * 100)}%` }}/>
                  <span className="text-[10px] text-slate-muted">{new Date(item.day + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                </div>
              ))}
            </div>
          )}
        </article>
        <p className="text-xs text-slate-muted">Counts are live database totals. “Orders created” includes pending/demo orders and does not mean payments were received.</p>
      </>}
    </section>
  )
}
