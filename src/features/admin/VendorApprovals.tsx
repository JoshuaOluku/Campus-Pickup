import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { CheckCircle, XCircle } from 'lucide-react'

interface Vendor {
  id: string
  name: string
  slug: string
  description: string
  category: string
  status: string
  owner: { email: string }
}

export default function VendorApprovals() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendors()
  }, [])

  async function fetchVendors() {
    const { data, error } = await supabase
      .from('vendors')
      .select('id, name, slug, description, category, status, owner:owner_id(email)')
      .order('created_at', { ascending: false })

    if (!error && data) setVendors(data as any)
    setLoading(false)
  }

  async function updateStatus(vendorId: string, newStatus: string) {
    const { error } = await supabase
      .from('vendors')
      .update({ status: newStatus, is_approved: newStatus === 'approved' })
      .eq('id', vendorId)

    if (!error) {
      setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: newStatus } : v))
    } else {
      alert('Failed to update vendor status. Check RLS policies.')
    }
  }

  if (loading) return <p className="text-slate-muted">Loading vendors...</p>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-ink mb-4">Vendor Management</h2>
      {vendors.length === 0 ? (
        <p className="text-slate-muted">No vendors found.</p>
      ) : (
        vendors.map(vendor => (
          <div key={vendor.id} className="bg-surface p-4 rounded-card shadow-sm border border-soft-slate flex justify-between items-center">
            <div>
              <h3 className="font-bold text-ink">{vendor.name}</h3>
              <p className="text-xs text-slate-muted">{vendor.category} • {vendor.owner?.email}</p>
              <p className="text-sm text-slate-muted mt-1">{vendor.description}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                vendor.status === 'approved' ? 'bg-green-100 text-fresh-green' :
                vendor.status === 'rejected' ? 'bg-red-100 text-error-red' :
                'bg-amber-50 text-amber-warn'
              }`}>
                {vendor.status}
              </span>

              {vendor.status === 'pending' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateStatus(vendor.id, 'approved')}
                    className="p-2 bg-fresh-green text-white rounded-lg hover:bg-green-700"
                    title="Approve"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => updateStatus(vendor.id, 'rejected')}
                    className="p-2 bg-error-red text-white rounded-lg hover:bg-red-700"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}