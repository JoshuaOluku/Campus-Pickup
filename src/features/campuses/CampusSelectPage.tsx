import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'

interface Campus {
  id: string
  name: string
  short_code: string
  city: string
  state: string
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
    supabase
      .from('campuses')
      .select('id, name, short_code, city, state')
      .eq('is_active', true)
      .order('name')
      .then(({ data, error }) => {
        if (error) {
          setError('Failed to load campuses.')
        } else if (data) {
          setCampuses(data)
        }
        setLoading(false)
      })
  }, [])

  async function handleContinue() {
    if (!selected) return
    setSaving(true)
    setError('')
    
    const { error } = await updateProfile({ campus_id: selected, is_onboarded: true })
    
    if (error) {
      setError('Failed to save campus selection. Please try again.')
    } else {
      navigate('/')
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-off-white px-4 py-8">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-campus-blue text-center">Choose Your Campus</h1>
        <p className="text-slate-muted text-center text-sm mt-2 mb-6">
          Select your university to see nearby vendors
        </p>

        {error && (
          <p className="text-error-red text-sm bg-red-50 p-3 rounded-lg mb-4 text-center">{error}</p>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-soft-slate rounded-card animate-pulse" />
            ))}
          </div>
        ) : campuses.length === 0 ? (
          <p className="text-center text-slate-muted">No campuses available.</p>
        ) : (
          <div className="space-y-3">
            {campuses.map(campus => (
              <button
                key={campus.id}
                onClick={() => setSelected(campus.id)}
                className={`w-full text-left p-4 rounded-card border-2 transition-all ${
                  selected === campus.id
                    ? 'border-campus-blue bg-warm-orange'
                    : 'border-soft-slate bg-surface hover:border-campus-blue'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className={`w-5 h-5 ${selected === campus.id ? 'text-electric-orange' : 'text-slate-muted'}`} />
                  <div>
                    <p className="font-semibold text-ink">{campus.name}</p>
                    <p className="text-xs text-slate-muted">{campus.city}, {campus.state}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!selected || saving}
          className="w-full mt-8 bg-electric-orange text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}