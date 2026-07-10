import { useEffect, useState, ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

interface ProtectedRouteProps {
  children: ReactNode
  pageKey: string
  requireAdmin?: boolean
}

interface SiteSettings {
  [key: string]: 'public' | 'login_required'
}

let cachedSettings: SiteSettings | null = null
let settingsFetchPromise: Promise<SiteSettings> | null = null

async function fetchSettings(): Promise<SiteSettings> {
  if (cachedSettings) return cachedSettings

  if (!settingsFetchPromise) {
    settingsFetchPromise = supabase
      .from('site_settings')
      .select('page_key, visibility')
      .then(({ data }) => {
        const settings: SiteSettings = {}
        if (data) {
          for (const row of data) {
            settings[row.page_key] = row.visibility
          }
        }
        cachedSettings = settings
        setTimeout(() => { cachedSettings = null; settingsFetchPromise = null }, 60000)
        return settings
      })
  }

  return settingsFetchPromise
}

export function invalidateSettingsCache() {
  cachedSettings = null
  settingsFetchPromise = null
}

export function ProtectedRoute({ children, pageKey, requireAdmin }: ProtectedRouteProps) {
  const { user, profile, loading, isAdmin } = useAuth()
  const location = useLocation()
  const [settings, setSettings] = useState<SiteSettings | null>(cachedSettings)
  const [settingsLoading, setSettingsLoading] = useState(!cachedSettings)

  useEffect(() => {
    if (!cachedSettings) {
      fetchSettings().then(s => {
        setSettings(s)
        setSettingsLoading(false)
      })
    }
  }, [])

  const stillLoading = loading || settingsLoading

  if (stillLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.6rem' }}>
          LOADING...
        </p>
      </div>
    )
  }

  if (requireAdmin) {
    if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
    if (!isAdmin) return <Navigate to="/" replace />
    return <>{children}</>
  }

  const visibility = settings?.[pageKey] || 'public'

  if (visibility === 'login_required') {
    if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
    if (profile?.banned) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-red-600 mb-4" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1rem' }}>
              ACCESS DENIED
            </h1>
            <p className="text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>
              Your account has been suspended. Contact the administrator.
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
