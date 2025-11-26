import { Hero } from '../components/Hero'
import { TriangleIllustration } from '../components/TriangleIllustration'
import { NewspaperSection } from '../components/NewspaperSection'
import { IntersectionSection } from '../components/IntersectionSection'

export function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <TriangleIllustration />
      <NewspaperSection />
      <IntersectionSection />
    </div>
  )
}
