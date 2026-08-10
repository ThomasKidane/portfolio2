import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { AuthProvider } from './lib/auth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Blog } from './pages/Blog'
import { Projects } from './pages/Projects'
import { Contact } from './pages/Contact'
import { Intersections } from './pages/Intersections'
import { RunaheadBlogPost } from './components/RunaheadBlogPost'
import { IntersectionsBlogPost } from './components/IntersectionsBlogPost'
import GNRIBlogPost from './components/GNRIBlogPost'
import AudioSeparationBlogPost from './components/AudioSeparationBlogPost'
import { InvisibleEngineeringBlogPost } from './components/InvisibleEngineeringBlogPost'
import { Quant } from './pages/Quant'
import { Figgie } from './pages/Figgie'
import { FiggieGame } from './pages/FiggieGame'
import { FiggieMarket } from './pages/FiggieMarket'
import { Login } from './pages/Login'
import { Admin } from './pages/Admin'

export default function App() {
  const location = useLocation()
  const isBlogPost = location.pathname.startsWith('/blog/runahead') || 
                     location.pathname.startsWith('/blog/the-intersections') ||
                     location.pathname.startsWith('/blog/guided-newton') ||
                     location.pathname.startsWith('/blog/audio-source-separation') ||
                     location.pathname.startsWith('/blog/the-job-behind-the-job')
  const isToolPage = location.pathname.startsWith('/figgie')
  const isAuthPage = location.pathname === '/login' || location.pathname === '/admin'

  return (
    <AuthProvider>
      <div className={`min-h-screen bg-white ${isBlogPost ? 'blog-post-container' : ''}`}>
        {!isBlogPost && !isToolPage && !isAuthPage && <Navigation />}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute pageKey="admin" requireAdmin><Admin /></ProtectedRoute>} />
            <Route path="/intersections" element={<Intersections />} />
            <Route path="/about" element={<ProtectedRoute pageKey="about"><About /></ProtectedRoute>} />
            <Route path="/blog" element={<ProtectedRoute pageKey="blog"><Blog /></ProtectedRoute>} />
            <Route path="/blog/runahead-execution" element={<ProtectedRoute pageKey="blog"><RunaheadBlogPost /></ProtectedRoute>} />
            <Route path="/blog/the-intersections" element={<ProtectedRoute pageKey="blog"><IntersectionsBlogPost /></ProtectedRoute>} />
            <Route path="/blog/guided-newton-raphson-inversion" element={<ProtectedRoute pageKey="blog"><GNRIBlogPost /></ProtectedRoute>} />
            <Route path="/blog/audio-source-separation" element={<ProtectedRoute pageKey="blog"><AudioSeparationBlogPost /></ProtectedRoute>} />
            <Route path="/blog/the-job-behind-the-job" element={<ProtectedRoute pageKey="blog"><InvisibleEngineeringBlogPost /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute pageKey="projects"><Projects /></ProtectedRoute>} />
            <Route path="/quant" element={<ProtectedRoute pageKey="quant"><Quant /></ProtectedRoute>} />
            <Route path="/figgie" element={<ProtectedRoute pageKey="figgie"><Figgie /></ProtectedRoute>} />
            <Route path="/figgie-game" element={<ProtectedRoute pageKey="figgie-game"><FiggieGame /></ProtectedRoute>} />
            <Route path="/figgie-market" element={<ProtectedRoute pageKey="figgie-market"><FiggieMarket /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute pageKey="contact"><Contact /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
