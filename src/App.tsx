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
import GNRIBlogPost from './components/GNRIBlogPost'
import AudioSeparationBlogPost from './components/AudioSeparationBlogPost'
import { Quant } from './pages/Quant'

export default function App() {
  const location = useLocation()
  const isBlogPost = location.pathname.startsWith('/blog/runahead') || 
                     location.pathname.startsWith('/blog/the-intersections') ||
                     location.pathname.startsWith('/blog/guided-newton') ||
                     location.pathname.startsWith('/blog/audio-source-separation')
  const isQuantPage = location.pathname.startsWith('/quant')

  return (
    <div className={`min-h-screen bg-white ${isBlogPost ? 'blog-post-container' : ''}`}>
      {!isBlogPost && !isQuantPage && <Navigation />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/intersections" element={<Intersections />} />
          <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/runahead-execution" element={<RunaheadBlogPost />} />
        <Route path="/blog/the-intersections" element={<IntersectionsBlogPost />} />
        <Route path="/blog/guided-newton-raphson-inversion" element={<GNRIBlogPost />} />
        <Route path="/blog/audio-source-separation" element={<AudioSeparationBlogPost />} />
        <Route path="/projects" element={<Projects />} />
          <Route path="/quant" element={<Quant />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
