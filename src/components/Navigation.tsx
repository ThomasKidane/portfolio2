import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

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
          >
            TK
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="pixel-title text-xs text-gray-600 hover:text-primary">
              MENU
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
