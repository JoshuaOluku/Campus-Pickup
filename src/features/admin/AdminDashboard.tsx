import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import VendorApprovals from './VendorApprovals'
import CampusManager from './CampusManager'
import FounderAnalytics from './FounderAnalytics'
import RegisteredUsers from './RegisteredUsers'
import { LayoutDashboard, Store, MapPin, LogOut, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'users' | 'vendors' | 'campuses'>('overview')

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const tabClass = (tab: typeof activeTab) => `shrink-0 py-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
    activeTab === tab ? 'border-electric-orange text-campus-blue' : 'border-transparent text-slate-muted hover:text-ink'
  }`

  return (
    <div className="min-h-screen bg-off-white">
      <header className="bg-surface border-b border-soft-slate sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-campus-blue">Admin Dashboard</h1>
            <p className="text-xs text-slate-muted">Welcome, {profile?.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-error-red hover:underline">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="bg-surface border-b border-soft-slate">
        <div className="max-w-5xl mx-auto px-4 flex gap-5 overflow-x-auto">
          <button onClick={() => setActiveTab('overview')} className={tabClass('overview')}>
            <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Overview</span>
          </button>
          <button onClick={() => setActiveTab('analytics')} className={tabClass('analytics')}>
            <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Founder Analytics</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={tabClass('users')}>
            <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Registered Users</span>
          </button>
          <button onClick={() => setActiveTab('vendors')} className={tabClass('vendors')}>
            <span className="flex items-center gap-2"><Store className="w-4 h-4" /> Vendor Approvals</span>
          </button>
          <button onClick={() => setActiveTab('campuses')} className={tabClass('campuses')}>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Campuses</span>
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'analytics' && <FounderAnalytics />}
        {activeTab === 'users' && <RegisteredUsers />}
        {activeTab === 'vendors' && <VendorApprovals />}
        {activeTab === 'campuses' && <CampusManager />}
      </main>
    </div>
  )
}

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
