import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { ToggleLeft, ToggleRight } from 'lucide-react'

interface Campus {
  id: string
  name: string
  short_code: string
  city: string
  state: string
  is_active: boolean
}

export default function CampusManager() {
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampuses()
  }, [])

  async function fetchCampuses() {
    const { data, error } = await supabase
      .from('campuses')
      .select('*')
      .order('name')

    if (!error && data) setCampuses(data)
    setLoading(false)
  }

  async function toggleActive(campus: Campus) {
    const { error } = await supabase
      .from('campuses')
      .update({ is_active: !campus.is_active })
      .eq('id', campus.id)

    if (!error) {
      setCampuses(prev => prev.map(c => c.id === campus.id ? { ...c, is_active: !c.is_active } : c))
    }
  }

  if (loading) return <p className="text-slate-muted">Loading campuses...</p>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-ink mb-4">Campus Management</h2>
      <div className="bg-surface rounded-card shadow-sm border border-soft-slate overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-off-white border-b border-soft-slate">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-muted">Name</th>
              <th className="p-4 text-sm font-semibold text-slate-muted">Code</th>
              <th className="p-4 text-sm font-semibold text-slate-muted">Location</th>
              <th className="p-4 text-sm font-semibold text-slate-muted text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {campuses.map(campus => (
              <tr key={campus.id} className="border-b border-soft-slate last:border-0">
                <td className="p-4 font-medium text-ink">{campus.name}</td>
                <td className="p-4 text-slate-muted">{campus.short_code}</td>
                <td className="p-4 text-slate-muted">{campus.city}, {campus.state}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => toggleActive(campus)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      campus.is_active ? 'bg-green-100 text-fresh-green' : 'bg-slate-100 text-slate-muted'
                    }`}
                  >
                    {campus.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {campus.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}