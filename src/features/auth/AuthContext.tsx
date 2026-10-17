import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

export type UserRole = 'customer' | 'vendor' | 'admin'

export interface Profile {
  id: string
  email: string | null
  phone: string | null
  full_name: string | null
  role: UserRole
  campus_id: string | null
  is_onboarded: boolean
}

export interface VendorInfo {
  id: string
  name: string
  slug: string
  staff_role: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  vendor: VendorInfo | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [vendor, setVendor] = useState<VendorInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setVendor(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) throw profileError
      
      if (profileData) {
        setProfile(profileData as Profile)
        
        if (profileData.role === 'vendor') {
          const { data: staffData, error: staffError } = await supabase
            .from('vendor_staff')
            .select(`id, role, vendor:vendor_id (id, name, slug)`)
            .eq('profile_id', userId)
            .eq('is_active', true)
            .maybeSingle()

          if (!staffError && staffData) {
            const v = Array.isArray(staffData.vendor) ? staffData.vendor[0] : staffData.vendor
            if (v) {
              setVendor({
                id: v.id,
                name: v.name,
                slug: v.slug,
                staff_role: staffData.role
              })
            } else {
              setVendor(null)
            }
          } else {
            setVendor(null)
          }
        } else {
          setVendor(null)
        }
      } else {
        setProfile(null)
        setVendor(null)
      }
    } catch (err) {
      setProfile(null)
      setVendor(null)
    } finally {
      setLoading(false)
    }
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error as Error | null }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
    setVendor(null)
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return { error: new Error('Not authenticated') as Error }
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    }
    return { error: error as Error | null }
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, vendor, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}