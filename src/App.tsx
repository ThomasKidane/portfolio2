import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Blog } from './pages/Blog'
import { Projects } from './pages/Projects'
import { Contact } from './pages/Contact'
import { Intersections } from './pages/Intersections'
import { RunaheadBlogPost } from './components/RunaheadBlogPost'
import { IntersectionsBlogPost } from './components/IntersectionsBlogPost'

export default function App() {
  const location = useLocation()
  const isBlogPost = location.pathname.startsWith('/blog/runahead') || location.pathname.startsWith('/blog/the-intersections')

  return (
    <div className={`min-h-screen bg-white ${isBlogPost ? 'blog-post-container' : ''}`}>
      {!isBlogPost && <Navigation />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/intersections" element={<Intersections />} />
          <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/runahead-execution" element={<RunaheadBlogPost />} />
        <Route path="/blog/the-intersections" element={<IntersectionsBlogPost />} />
        <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
