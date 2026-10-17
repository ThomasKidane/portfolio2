import { ArrowUpRight, BookOpen, Code2, GitBranch } from 'lucide-react'

export function MySitesSection() {
  return (
    <section className="px-6 py-14 md:px-12 border-b-2 border-dotted border-blue-500" aria-labelledby="my-sites-title">
      <div className="max-w-7xl mx-auto">
        <h2 id="my-sites-title" className="pixel-title text-xl text-primary mb-3">MY SITES</h2>
        <p className="font-serif text-lg text-gray-600 mb-8">Tools and places to learn by doing.</p>
        <a href="/dl-guide/" className="group block max-w-3xl border-2 border-blue-500 p-6 md:p-8 bg-blue-50/40 hover:bg-blue-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
          <div className="flex items-center justify-between gap-4 mb-5">
            <span className="font-mono text-xs text-blue-700 tracking-widest">DEEP LEARNING · CURRICULUM PREVIEW</span>
            <ArrowUpRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" aria-hidden="true" />
          </div>
          <h3 className="font-serif text-4xl text-gray-900 mb-3">DL Guide</h3>
          <p className="font-serif text-lg leading-relaxed text-gray-700 max-w-2xl">Work through the history of deep learning, one model at a time. Read the ideas, implement them in Colab, and track your progress from the perceptron to modern transformers.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 text-xs font-mono text-blue-800">
            <span className="inline-flex gap-2 items-center"><BookOpen size={15} aria-hidden="true" /> Four divisions</span>
            <span className="inline-flex gap-2 items-center"><Code2 size={15} aria-hidden="true" /> Colab notebooks</span>
            <span className="inline-flex gap-2 items-center"><GitBranch size={15} aria-hidden="true" /> Model timeline</span>
          </div>
          <p className="text-xs text-gray-500 font-mono mt-6">In development: draft problems and uncalibrated targets are labeled in the guide.</p>
        </a>
      </div>
    </section>
  )
}
