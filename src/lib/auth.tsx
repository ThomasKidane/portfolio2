import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface Profile {
  id: string
  email: string
  role: 'admin' | 'user'
  display_name: string | null
  banned: boolean
  created_at: string
}

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  isAdmin: boolean
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(() => {
    try { const c = sessionStorage.getItem('auth-profile'); return c ? JSON.parse(c) : null } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setProfile(data as Profile)
      sessionStorage.setItem('auth-profile', JSON.stringify(data))
    } else if (error?.code === 'PGRST116') {
      // Profile doesn't exist yet — create one
      const user = (await supabase.auth.getUser()).data.user
      if (user) {
        // Check if any admins exist; if not, make this user admin
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'admin')
        
        const role = count === 0 ? 'admin' : 'user'
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({ id: userId, email: user.email || '', role, display_name: null, banned: false })
          .select()
          .single()
        
        if (newProfile) {
          setProfile(newProfile as Profile)
          sessionStorage.setItem('auth-profile', JSON.stringify(newProfile))
        } else {
          setProfile(null)
          sessionStorage.removeItem('auth-profile')
        }
      } else {
        setProfile(null)
      }
    } else {
      setProfile(null)
    }
    setLoading(false)
  }

  async function signInWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  async function signUpWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error as Error | null }
  }

  async function signInWithOAuth(provider: 'google' | 'github') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    })
    return { error: error as Error | null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    sessionStorage.removeItem('auth-profile')
  }

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      profile,
      isAdmin: profile?.role === 'admin',
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithOAuth,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
