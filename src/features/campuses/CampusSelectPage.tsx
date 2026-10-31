import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, ArrowRight } from 'lucide-react'

interface Campus {
  id: string
  name: string
  short_code: string
  city: string
  state: string
  is_active: boolean
}

export default function CampusSelectPage() {
  const { updateProfile } = useAuth()
  const navigate = useNavigate()
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('campuses')
      .select('id, name, short_code, city, state, is_active')
      .order('name')
      .then(({ data, error }) => {
        if (error) setError('Failed to load campuses.')
        else if (data) setCampuses(data)
        setLoading(false)
      })
  }, [])

  async function handleContinue() {
    if (!selected) return
    setSaving(true)
    setError('')
    const { error } = await updateProfile({ campus_id: selected, is_onboarded: true })
    if (error) setError('Failed to save campus selection. Please try again.')
    else navigate('/')
    setSaving(false)
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-10">
      <section className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-orange-100 text-orange-600"><MapPin size={27}/></span>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-orange-600">Where are you ordering?</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#123b5d]">Choose your campus</h1>
          <p className="mt-2 text-sm text-slate-500">We’ll show you vendors and pickup options available at your campus.</p>
        </div>
        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200"/>)}</div> :
          <div className="grid gap-3 sm:grid-cols-2">
            {campuses.map(campus => (
              <button key={campus.id} type="button" disabled={!campus.is_active}
                onClick={() => setSelected(campus.id)}
                className={`relative rounded-2xl border p-4 text-left transition ${!campus.is_active ? 'cursor-not-allowed border-slate-200 bg-slate-100/80 opacity-80' : selected===campus.id ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-100' : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-sm'}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${campus.is_active ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'}`}><MapPin size={19}/></span>
                  {!campus.is_active && <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">Coming soon</span>}
                  {campus.is_active && selected===campus.id && <span className="text-xs font-bold text-orange-600">Selected</span>}
                </div>
                <h2 className="mt-4 font-bold text-slate-900">{campus.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{campus.city}, {campus.state}</p>
                {!campus.is_active && <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><Clock size={13}/> We’re working on bringing Campus Pick-Up here.</p>}
              </button>
            ))}
          </div>}
        <button onClick={handleContinue} disabled={!selected || saving}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? 'Saving...' : 'Continue'} {!saving && <ArrowRight size={18}/>}
        </button>
      </section>
    </main>
  )
}
