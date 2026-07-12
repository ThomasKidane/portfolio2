import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

const navigation = [
  { name: 'HOME', href: '/' },
  { name: 'INTERSECTIONS', href: '/intersections' },
  { name: 'ABOUT', href: '/about' },
  { name: 'BLOG', href: '/blog' },
  { name: 'PROJECTS', href: '/projects' },
  { name: 'CONTACT', href: '/contact' },
]

export function Navigation() {
  const location = useLocation()
  const { user, profile, isAdmin, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [visitCount, setVisitCount] = useState<number | null>(null)
  const visitTracked = useRef(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Track visit and fetch visit count
  useEffect(() => {
    if (!user || visitTracked.current) return
    visitTracked.current = true

    supabase.from('user_visits').insert({ user_id: user.id }).then(() => {})

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    supabase.from('user_visits')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('visited_at', startOfMonth)
      .then(({ count }) => {
        setVisitCount(count ?? 0)
      })
  }, [user])

  // Close menu on click outside
  useEffect(() => {
    if (!userMenuOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.user-menu-container')) setUserMenuOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [userMenuOpen])

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1.25rem', color: '#4169E1', letterSpacing: '0.1em' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            TK
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'pixel-title text-xs transition-colors duration-200',
                    location.pathname === item.href ? 'text-primary' : 'text-gray-600 hover:text-primary'
                  )}
                >
                  {item.name}
                </Link>
              ))}

              {user && (
                <Link
                  to="/quant"
                  className={cn(
                    'pixel-title text-xs transition-colors duration-200',
                    location.pathname === '/quant' ? 'text-primary' : 'text-gray-600 hover:text-primary'
                  )}
                >
                  QUANT
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    'pixel-title text-xs transition-colors duration-200',
                    location.pathname === '/admin' ? 'text-primary' : 'text-blue-600 hover:text-primary'
                  )}
                >
                  ADMIN
                </Link>
              )}

              {user ? (
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs hover:bg-blue-700 transition-colors"
                    style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}
                  >
                    {user.email?.[0]?.toUpperCase() || '?'}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-dotted border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-dotted border-gray-200 bg-gray-50">
                        <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem' }}>SIGNED IN AS</p>
                        <p className="text-sm text-gray-800 font-medium truncate" style={{ fontFamily: 'Georgia, serif' }}>{user.email}</p>
                        {profile?.role && (
                          <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded ${profile.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.35rem' }}>
                            {profile.role.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="px-4 py-2 border-b border-dotted border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>Visits this month</span>
                          <span className="text-sm font-bold text-blue-600" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem' }}>{visitCount ?? '—'}</span>
                        </div>
                        {profile?.created_at && (
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>Member since</span>
                            <span className="text-xs text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>{new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false) }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="pixel-title text-xs text-gray-600 hover:text-primary transition-colors duration-200"
                >
                  LOGIN
                </Link>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && mobileMenuOpen && (
          <div className="border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2 text-base font-medium rounded-md transition-colors',
                    location.pathname === item.href ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  )}
                  style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.75rem' }}
                >
                  {item.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/quant" onClick={() => setMobileMenuOpen(false)}
                    className={cn('block px-3 py-2 text-base font-medium rounded-md transition-colors', location.pathname === '/quant' ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary')}
                    style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.75rem' }}>
                    QUANT
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                      style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.75rem' }}>
                      ADMIN
                    </Link>
                  )}
                  <div className="px-3 py-2 border-t border-gray-100 mt-2">
                    <p className="text-xs text-gray-500 truncate" style={{ fontFamily: 'Georgia, serif' }}>{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Georgia, serif' }}>Visits this month: {visitCount ?? '—'}</p>
                  </div>
                  <button
                    onClick={() => { signOut(); setMobileMenuOpen(false) }}
                    className="block w-full text-left px-3 py-2 text-base font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors"
                    style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.75rem' }}>
                    SIGN OUT
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                  style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.75rem' }}>
                  LOGIN
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
