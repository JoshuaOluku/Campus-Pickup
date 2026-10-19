import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useAuth } from '../auth/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Store, Clock, ShoppingBag } from 'lucide-react'

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

  useEffect(() => {
    async function fetchVendors() {
      if (!profile?.campus_id) return
      
      const { data, error } = await supabase
        .from('vendors')
        .select('id, name, slug, description, category, avg_prep_time_minutes')
        .eq('campus_id', profile.campus_id)
        .eq('status', 'approved')
        .order('name')

      if (!error && data) {
        setVendors(data)
      }
      setLoading(false)
    }

    fetchVendors()
  }, [profile?.campus_id])

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white p-4">
        <div className="max-w-sm mx-auto space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-soft-slate rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white p-4 pb-20">
      <div className="max-w-sm mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-campus-blue">Campus Pickup</h1>
          <p className="text-slate-muted text-sm">
            Welcome back! Select a vendor to order from.
          </p>
          
          {/* NEW: Navigation link to the Orders page */}
          <Link 
            to="/orders" 
            className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-electric-orange hover:underline"
          >
            <ShoppingBag className="w-4 h-4" /> View My Orders
          </Link>
          <a
            href="https://form.typeform.com/to/HomcqhOf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-campus-blue hover:underline"
          >
            Share your feedback
          </a>
        </header>

        {vendors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-muted">No vendors available on your campus yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vendors.map(vendor => (
              <div 
                key={vendor.id} 
                className="bg-surface rounded-card p-4 shadow-sm border border-soft-slate hover:border-campus-blue transition-colors cursor-pointer"
                onClick={() => navigate(`/vendor/${vendor.slug}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-warm-orange rounded-lg flex items-center justify-center flex-shrink-0">
                    <Store className="w-6 h-6 text-electric-orange" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-ink text-lg">{vendor.name}</h3>
                    <p className="text-xs text-slate-muted uppercase tracking-wide mb-1">
                      {vendor.category}
                    </p>
                    <p className="text-sm text-slate-muted line-clamp-2">
                      {vendor.description}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-fresh-green font-medium">
                      <Clock className="w-3 h-3" />
                      <span>~{vendor.avg_prep_time_minutes} min prep</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}