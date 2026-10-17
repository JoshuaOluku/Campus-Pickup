import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import VendorApprovals from './VendorApprovals'
import CampusManager from './CampusManager'
import { LayoutDashboard, Store, MapPin, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'campuses'>('overview')

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <header className="bg-surface border-b border-soft-slate sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-campus-blue">Admin Dashboard</h1>
            <p className="text-xs text-slate-muted">Welcome, {profile?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-error-red hover:underline"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-surface border-b border-soft-slate">
        <div className="max-w-4xl mx-auto px-4 flex gap-6">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-electric-orange text-campus-blue' : 'border-transparent text-slate-muted hover:text-ink'
            }`}
          >
            <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab('vendors')}
            className={`py-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'vendors' ? 'border-electric-orange text-campus-blue' : 'border-transparent text-slate-muted hover:text-ink'
            }`}
          >
            <span className="flex items-center gap-2"><Store className="w-4 h-4" /> Vendor Approvals</span>
          </button>
          <button 
            onClick={() => setActiveTab('campuses')}
            className={`py-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'campuses' ? 'border-electric-orange text-campus-blue' : 'border-transparent text-slate-muted hover:text-ink'
            }`}
          >
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Campuses</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'vendors' && <VendorApprovals />}
        {activeTab === 'campuses' && <CampusManager />}
      </main>
    </div>
  )
}

// Simple Overview Component
function AdminOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-surface p-6 rounded-card shadow-sm border border-soft-slate">
        <p className="text-sm text-slate-muted">Total Vendors</p>
        <p className="text-3xl font-bold text-campus-blue mt-2">3</p>
      </div>
      <div className="bg-surface p-6 rounded-card shadow-sm border border-soft-slate">
        <p className="text-sm text-slate-muted">Active Campuses</p>
        <p className="text-3xl font-bold text-fresh-green mt-2">8</p>
      </div>
      <div className="bg-surface p-6 rounded-card shadow-sm border border-soft-slate">
        <p className="text-sm text-slate-muted">Total Orders (Demo)</p>
        <p className="text-3xl font-bold text-electric-orange mt-2">12</p>
      </div>
    </div>
  )
}