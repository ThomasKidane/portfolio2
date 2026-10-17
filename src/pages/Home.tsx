import { Hero } from '../components/Hero'
import { TriangleIllustration } from '../components/TriangleIllustration'
import { NewspaperSection } from '../components/NewspaperSection'
import { WhatsNewSection } from '../components/WhatsNewSection'
import { MySitesSection } from '../components/MySitesSection'

export function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <MySitesSection />
      <TriangleIllustration />
      <NewspaperSection />
      <WhatsNewSection />
    </div>
  )
}
