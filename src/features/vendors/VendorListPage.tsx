import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useAuth } from '../auth/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Store, Clock, ShoppingBag, Search, MapPin, ArrowRight, UtensilsCrossed, ArrowLeft, Home } from 'lucide-react'

interface Vendor {
  id: string
  name: string
  slug: string
  description: string
  category: string
  avg_prep_time_minutes: number
}

export default function VendorListPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    async function fetchVendors() {
      if (!profile?.campus_id) { setLoading(false); return }
      const { data, error } = await supabase
        .from('vendors')
        .select('id, name, slug, description, category, avg_prep_time_minutes')
        .eq('campus_id', profile.campus_id)
        .eq('status', 'approved')
        .eq('is_approved', true)
        .order('name')
      if (!error && data) setVendors(data)
      setLoading(false)
    }
    fetchVendors()
  }, [profile?.campus_id])

  const categories = useMemo(() => ['All', ...Array.from(new Set(vendors.map(v => v.category).filter(Boolean)))], [vendors])
  const visibleVendors = useMemo(() => vendors.filter(v => (category === 'All' || v.category === category) && (v.name.toLowerCase().includes(search.toLowerCase()) || v.description?.toLowerCase().includes(search.toLowerCase()))), [vendors, category, search])

  return (
    <main className="min-h-screen bg-[#f7f8fa] pb-24">
      <div className="bg-white">
        <div className="mx-auto max-w-5xl px-5 pb-7 pt-5 sm:px-8">
          <header className="flex items-center justify-between"><button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="rounded-xl p-2 text-[#123b5d] hover:bg-slate-100"><ArrowLeft size={20}/></button>
            <Link to="/" aria-label="Home" className="flex items-center gap-2.5 font-extrabold tracking-tight text-[#123b5d]"><Home size={18}/><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white"><UtensilsCrossed size={21}/></span>Campus Pick-Up</Link>
            <Link to="/orders" className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600"><ShoppingBag size={17}/> My orders</Link>
          </header>
          <div className="mt-9 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div><p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-orange-600"><MapPin size={15}/> Your campus marketplace</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">What are you craving?</h1><p className="mt-2 text-slate-500">Order ahead from campus vendors and collect when it is ready.</p></div>
            <div className="relative w-full md:w-80"><Search className="absolute left-4 top-3.5 text-slate-400" size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"/></div>
          </div>
          <div className="mt-7 flex gap-2 overflow-x-auto pb-1">{categories.map(c => <button key={c} onClick={() => setCategory(c)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${category === c ? 'bg-[#123b5d] text-white' : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700'}`}>{c}</button>)}</div>
        </div>
      </div>
      <section className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <div className="mb-5 flex items-end justify-between"><div><h2 className="text-xl font-extrabold text-slate-900">Popular around campus</h2><p className="mt-1 text-sm text-slate-500">{loading ? 'Finding vendors...' : `${visibleVendors.length} vendor${visibleVendors.length === 1 ? '' : 's'} available`}</p></div><a href="https://form.typeform.com/to/HomcqhOf" target="_blank" rel="noreferrer" className="text-xs font-semibold text-orange-600 hover:underline">Give feedback</a></div>
        {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i => <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-200"/>)}</div> : visibleVendors.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Store className="mx-auto mb-3 text-slate-400" size={32}/><h3 className="font-bold text-slate-800">{vendors.length ? 'No matching vendors' : 'More vendors coming soon'}</h3><p className="mt-1 text-sm text-slate-500">{vendors.length ? 'Try another search or category.' : 'We are working on bringing your campus favourites online.'}</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleVendors.map(v => <button key={v.id} onClick={() => navigate(`/vendor/${v.slug}`)} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"><div className="mb-5 flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white"><Store size={23}/></span><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Available</span></div><p className="text-xs font-bold uppercase tracking-wider text-orange-600">{v.category}</p><h3 className="mt-1 text-lg font-extrabold text-slate-900">{v.name}</h3><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{v.description || 'Explore the menu and order ahead.'}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-500"><span className="flex items-center gap-1"><Clock size={14}/> About {v.avg_prep_time_minutes} min</span><span className="flex items-center gap-1 font-bold text-[#123b5d]">View menu <ArrowRight size={14}/></span></div></button>)}</div>}
      </section>
    </main>
  )
}
