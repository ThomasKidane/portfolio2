import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { invalidateSettingsCache } from '../components/ProtectedRoute'

interface Profile {
  id: string
  email: string
  role: 'admin' | 'user'
  display_name: string | null
  banned: boolean
  created_at: string
}

interface SiteSetting {
  id: number
  page_key: string
  visibility: 'public' | 'login_required'
  updated_at: string
}

type Tab = 'users' | 'visibility' | 'analytics'

export function Admin() {
  const { profile, signOut } = useAuth()
  const [tab, setTab] = useState<Tab>('visibility')
  const [users, setUsers] = useState<Profile[]>([])
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, admins: 0, banned: 0 })

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [usersRes, settingsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('*').order('page_key'),
    ])
    if (usersRes.data) {
      setUsers(usersRes.data as Profile[])
      setStats({
        total: usersRes.data.length,
        admins: usersRes.data.filter(u => u.role === 'admin').length,
        banned: usersRes.data.filter(u => u.banned).length,
      })
    }
    if (settingsRes.data) setSettings(settingsRes.data as SiteSetting[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function toggleVisibility(setting: SiteSetting) {
    const newVisibility = setting.visibility === 'public' ? 'login_required' : 'public'
    await supabase
      .from('site_settings')
      .update({ visibility: newVisibility, updated_at: new Date().toISOString() })
      .eq('id', setting.id)
    invalidateSettingsCache()
    setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, visibility: newVisibility } : s))
  }

  async function toggleBan(user: Profile) {
    await supabase
      .from('profiles')
      .update({ banned: !user.banned })
      .eq('id', user.id)
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, banned: !u.banned } : u))
    setStats(prev => ({ ...prev, banned: prev.banned + (user.banned ? -1 : 1) }))
  }

  async function toggleRole(user: Profile) {
    if (user.id === profile?.id) return
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id)
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole as 'admin' | 'user' } : u))
    setStats(prev => ({
      ...prev,
      admins: prev.admins + (newRole === 'admin' ? 1 : -1),
    }))
  }

  const tabClasses = (t: Tab) =>
    `px-4 py-2 text-xs transition-colors border-b-2 -mb-[2px] cursor-pointer ${
      tab === t ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600'
    }`

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-2 border-dotted border-blue-500 pb-6 pt-10 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <Link to="/" className="text-sm text-gray-400 hover:text-blue-600 transition-colors mb-3 inline-block" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.6rem' }}>
              &larr; BACK
            </Link>
            <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1.2rem', color: '#4169E1' }}>
              ADMIN PANEL
            </h1>
            <p className="text-gray-500 mt-1 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
              Signed in as {profile?.email}
            </p>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 border-2 border-dotted border-gray-300 rounded-lg text-gray-600 hover:border-red-400 hover:text-red-600 transition-colors"
            style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}
          >
            SIGN OUT
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-6">
        <div className="flex gap-1 border-b-2 border-dotted border-gray-200">
          <button onClick={() => setTab('visibility')} className={tabClasses('visibility')} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>
            VISIBILITY
          </button>
          <button onClick={() => setTab('users')} className={tabClasses('users')} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>
            USERS ({stats.total})
          </button>
          <button onClick={() => setTab('analytics')} className={tabClasses('analytics')} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>
            ANALYTICS
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-6">
        {loading ? (
          <p className="text-gray-400 text-center py-12" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.6rem' }}>
            LOADING...
          </p>
        ) : (
          <>
            {tab === 'visibility' && <VisibilityTab settings={settings} onToggle={toggleVisibility} />}
            {tab === 'users' && <UsersTab users={users} currentUserId={profile?.id || ''} onToggleBan={toggleBan} onToggleRole={toggleRole} />}
            {tab === 'analytics' && <AnalyticsTab stats={stats} users={users} />}
          </>
        )}
      </div>
    </div>
  )
}

function VisibilityTab({ settings, onToggle }: { settings: SiteSetting[]; onToggle: (s: SiteSetting) => void }) {
  const pageLabels: Record<string, string> = {
    quant: 'Quant Practice',
    figgie: 'Figgie Calculator',
    'figgie-game': 'Figgie Game',
    'figgie-market': 'Figgie Market',
    blog: 'Blog',
    projects: 'Projects',
    contact: 'Contact',
    about: 'About',
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
        Toggle pages between public access and login-required. Changes take effect immediately.
      </p>
      {settings.map(s => (
        <div
          key={s.id}
          className="flex items-center justify-between p-4 border-2 border-dotted border-gray-200 rounded-lg"
        >
          <div>
            <span className="text-sm text-gray-800 font-medium" style={{ fontFamily: 'Georgia, serif' }}>
              {pageLabels[s.page_key] || s.page_key}
            </span>
            <span className="ml-3 text-xs text-gray-400">/{s.page_key}</span>
          </div>
          <button
            onClick={() => onToggle(s)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              s.visibility === 'public'
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
            style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}
          >
            {s.visibility === 'public' ? 'PUBLIC' : 'LOGIN REQ'}
          </button>
        </div>
      ))}
    </div>
  )
}

function UsersTab({ users, currentUserId, onToggleBan, onToggleRole }: {
  users: Profile[]
  currentUserId: string
  onToggleBan: (u: Profile) => void
  onToggleRole: (u: Profile) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
        Manage registered users. You cannot change your own role.
      </p>
      {users.map(u => (
        <div
          key={u.id}
          className={`flex items-center justify-between p-4 border-2 border-dotted rounded-lg ${
            u.banned ? 'border-red-200 bg-red-50/50' : 'border-gray-200'
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-800 truncate" style={{ fontFamily: 'Georgia, serif' }}>
                {u.display_name || u.email}
              </span>
              {u.role === 'admin' && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>
                  ADMIN
                </span>
              )}
              {u.banned && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>
                  BANNED
                </span>
              )}
              {u.id === currentUserId && (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>
                  YOU
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'Georgia, serif' }}>
              {u.email} &bull; Joined {new Date(u.created_at).toLocaleDateString()}
            </p>
          </div>

          {u.id !== currentUserId && (
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onToggleRole(u)}
                className="px-2 py-1 text-xs border-2 border-dotted border-gray-200 rounded hover:border-blue-400 transition-colors"
                style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}
              >
                {u.role === 'admin' ? 'DEMOTE' : 'PROMOTE'}
              </button>
              <button
                onClick={() => onToggleBan(u)}
                className={`px-2 py-1 text-xs border-2 border-dotted rounded transition-colors ${
                  u.banned
                    ? 'border-green-200 text-green-700 hover:border-green-400'
                    : 'border-red-200 text-red-700 hover:border-red-400'
                }`}
                style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}
              >
                {u.banned ? 'UNBAN' : 'BAN'}
              </button>
            </div>
          )}
        </div>
      ))}
      {users.length === 0 && (
        <p className="text-center text-gray-400 py-8" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.55rem' }}>
          NO USERS YET
        </p>
      )}
    </div>
  )
}

function AnalyticsTab({ stats, users }: { stats: { total: number; admins: number; banned: number }; users: Profile[] }) {
  const recentUsers = users.slice(0, 5)
  const now = new Date()
  const thisWeek = users.filter(u => {
    const d = new Date(u.created_at)
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
  }).length

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="TOTAL USERS" value={stats.total} />
        <StatCard label="ADMINS" value={stats.admins} />
        <StatCard label="BANNED" value={stats.banned} />
        <StatCard label="THIS WEEK" value={thisWeek} />
      </div>

      {/* Recent Signups */}
      <div>
        <h3 className="text-xs text-gray-400 mb-3" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>
          RECENT SIGNUPS
        </h3>
        {recentUsers.length > 0 ? (
          <div className="space-y-2">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 border-2 border-dotted border-gray-200 rounded-lg">
                <span className="text-sm text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                  {u.display_name || u.email}
                </span>
                <span className="text-xs text-gray-400" style={{ fontFamily: 'Georgia, serif' }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm" style={{ fontFamily: 'Georgia, serif' }}>No signups yet.</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 border-2 border-dotted border-gray-200 rounded-lg text-center">
      <p className="text-2xl text-blue-600 font-bold" style={{ fontFamily: 'Georgia, serif' }}>{value}</p>
      <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>{label}</p>
    </div>
  )
}
