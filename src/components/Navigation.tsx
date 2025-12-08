import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link 
            to="/" 
            style={{ 
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '1.25rem',
              color: '#4169E1',
              letterSpacing: '0.1em'
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            TK
          </Link>

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <div className="flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'pixel-title text-xs transition-colors duration-200',
                    location.pathname === item.href
                      ? 'text-primary'
                      : 'text-gray-600 hover:text-primary'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
                    location.pathname === item.href
                      ? 'bg-blue-50 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  )}
                  style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.75rem' }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}