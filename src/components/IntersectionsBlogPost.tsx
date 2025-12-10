import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function IntersectionsBlogPost() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile on mount and window resize
    const checkMobile = () => {
      const mobile = window.matchMedia('(max-width: 767px)').matches || 
                     window.matchMedia('(hover: none)').matches ||
                     window.matchMedia('(pointer: coarse)').matches
      setIsMobile(mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    // Only add mouse tracking on desktop devices
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', checkMobile)
    }
  }, [isMobile])

  return (
    <>
      {/* Custom Cursor - Only on Desktop */}
      {!isMobile && (
        <div 
          className="custom-cursor"
          style={{
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
          }}
        />
      )}
      
      <div className="min-h-screen bg-white font-departure blog-post-container">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <header className="mb-12">
          <div className="mb-8">
            <Link 
              to="/blog" 
              className="text-sm text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-2"
            >
              ← Back to Portfolio
            </Link>
          </div>
        </header>

        {/* Article */}
        <article className="prose prose-lg max-w-none">
          {/* Title */}
          <section className="mb-12">
            <h1 className="text-4xl font-bold mb-4 text-black">
              The Intersections
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Where Engineering, Mathematics, and Statistics Converge
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>By Thomas Kidane</span>
              <span>•</span>
              <span>August 2025</span>
            </div>
          </section>

          {/* Introduction */}
          <section className="mb-12">
            <p className="text-gray-800 leading-relaxed mb-6">
              Computer science exists at the intersection of three fundamental disciplines: engineering, mathematics, and statistics. 
              Each brings its own lens, its own tools, its own way of thinking about computation. The most powerful advances happen 
              not within any single discipline, but at their boundaries—where theoretical elegance meets practical constraints, 
              where proofs meet performance, where algorithms meet architectures.
            </p>
            <p className="text-gray-800 leading-relaxed mb-6">
              This framework shapes how I approach problems. Every challenge can be viewed through these three lenses, and the 
              most elegant solutions often emerge from understanding all three perspectives simultaneously.
            </p>
          </section>

          {/* Mathematics ∩ Engineering */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-primary">
              MATHEMATICS ∩ ENGINEERING
            </h2>
            <h3 className="text-lg text-gray-600 mb-4">
              Making Math Run on Real Machines
            </h3>
            
            <p className="text-gray-800 leading-relaxed mb-6">
              This intersection is where theoretical elegance meets physical reality. It encompasses numerical analysis and scientific computing, 
              where mathematically sound algorithms must be implemented without falling victim to floating-point instability. Cache-aware algorithms 
              optimize for the memory hierarchy of real processors, while external-memory algorithms handle datasets too large for RAM.
            </p>
            
            <p className="text-gray-800 leading-relaxed mb-6">
              Cryptography implementation demands constant-time operations to resist timing attacks. Formal verification tools like Coq and Isabelle 
              prove that compilers, operating system kernels, and critical protocols behave correctly. This is rigorous reasoning about performance 
              and correctness, implemented in silicon and code.
            </p>

            <div className="bg-blue-50 border-2 border-blue-500 p-6 mb-6">
              <h4 className="text-sm font-bold text-primary mb-3">KEY EXAMPLES:</h4>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                <li className="text-gray-700">→ Numerical Analysis</li>
                <li className="text-gray-700">→ Cache-Oblivious Algorithms</li>
                <li className="text-gray-700">→ Formal Verification</li>
                <li className="text-gray-700">→ Crypto Implementation</li>
              </ul>
            </div>

            <p className="text-gray-800 leading-relaxed mb-6">
              Consider the implementation of a segment tree for range queries. Mathematically, it's an elegant logarithmic solution. 
              But the engineering reality demands cache-conscious node layout, careful memory alignment, and consideration of branch 
              prediction. The mathematical proof of correctness must coexist with performance engineering—neither perspective alone 
              is sufficient.
            </p>
          </section>

          {/* Mathematics ∩ Statistics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-primary">
              MATHEMATICS ∩ STATISTICS
            </h2>
            <h3 className="text-lg text-gray-600 mb-4">
              Probabilistic Math & Learning Theory
            </h3>
            
            <p className="text-gray-800 leading-relaxed mb-6">
              Here we find the theoretical foundations of learning and randomness. Learning theory provides rigorous bounds on generalization 
              through concepts like VC dimension and PAC learning—asking how many samples we need to learn reliably. Randomized algorithms use 
              probabilistic techniques for problems where deterministic approaches fall short: random walks on graphs, locality-sensitive hashing 
              for nearest-neighbor search, streaming algorithms that process massive data in limited memory.
            </p>
            
            <p className="text-gray-800 leading-relaxed mb-6">
              Information theory connects entropy, compression, and learning, revealing deep relationships between code length and generalization. 
              This intersection treats probability distributions as mathematical objects, studying their properties with the same rigor as 
              algebraic structures.
            </p>

            <div className="bg-blue-50 border-2 border-blue-500 p-6 mb-6">
              <h4 className="text-sm font-bold text-primary mb-3">KEY EXAMPLES:</h4>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                <li className="text-gray-700">→ Learning Theory</li>
                <li className="text-gray-700">→ Randomized Algorithms</li>
                <li className="text-gray-700">→ Information Theory</li>
                <li className="text-gray-700">→ PAC Learning</li>
              </ul>
            </div>

            <p className="text-gray-800 leading-relaxed mb-6">
              The multivariate Gaussian distribution exemplifies this intersection. It's simultaneously a mathematical object (with precise 
              algebraic properties), a statistical tool (for modeling uncertainty), and a computational primitive (underlying everything 
              from Kalman filters to Gaussian processes). Understanding its spectral decomposition, its maximum entropy property, and its 
              role in the central limit theorem requires both mathematical and statistical thinking.
            </p>
          </section>

          {/* Engineering ∩ Statistics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-primary">
              ENGINEERING ∩ STATISTICS
            </h2>
            <h3 className="text-lg text-gray-600 mb-4">
              Systems for Learning & Data
            </h3>
            
            <p className="text-gray-800 leading-relaxed mb-6">
              This is where statistical learning meets the realities of scale and production. Distributed training frameworks like PyTorch DDP 
              and DeepSpeed enable models with billions of parameters, implementing data parallelism, model parallelism, and pipeline parallelism. 
              Inference systems must serve models with millisecond latency, using quantization, pruning, and distillation.
            </p>
            
            <p className="text-gray-800 leading-relaxed mb-6">
              Big data infrastructure—Spark, Flink, Kafka—processes streams of events in real-time, maintaining feature stores and ensuring 
              consistency between offline training and online serving. Specialized hardware like GPUs and TPUs are architected specifically 
              for the matrix operations underlying modern ML. This intersection asks: we have fancy models and massive datasets, but how do 
              we engineer infrastructure to make them usable in reality?
            </p>

            <div className="bg-blue-50 border-2 border-blue-500 p-6 mb-6">
              <h4 className="text-sm font-bold text-primary mb-3">KEY EXAMPLES:</h4>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                <li className="text-gray-700">→ Distributed Training</li>
                <li className="text-gray-700">→ Model Serving</li>
                <li className="text-gray-700">→ Big Data Systems</li>
                <li className="text-gray-700">→ ML Accelerators</li>
              </ul>
            </div>

            <p className="text-gray-800 leading-relaxed mb-6">
              Data parallelism in distributed training illustrates this perfectly. The statistical algorithm (SGD) must be decomposed across 
              multiple GPUs, with careful attention to communication patterns, gradient synchronization, and memory hierarchy. The all-reduce 
              operation that aggregates gradients is simultaneously a statistical operation (averaging), an algorithmic challenge (minimizing 
              communication), and an engineering problem (handling network failures, stragglers, and heterogeneous hardware).
            </p>
          </section>

          {/* The Triple Intersection */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-primary">
              THE TRIPLE INTERSECTION
            </h2>
            <h3 className="text-lg text-gray-600 mb-4">
              Engineering ∩ Mathematics ∩ Statistics
            </h3>
            
            <p className="text-gray-800 leading-relaxed mb-6">
              The center of the triangle is where modern AI research and practice truly lives. Designing a Transformer architecture requires 
              understanding its mathematical expressivity and optimization landscape, statistical generalization properties, and engineering 
              constraints like parallelizability and memory footprint.
            </p>
            
            <p className="text-gray-800 leading-relaxed mb-6">
              Automatic differentiation frameworks combine compiler technology (graph optimization, operator fusion) with mathematical 
              correctness (computing exact gradients) and statistical needs (handling large batches efficiently). Training large models 
              involves distributed optimization algorithms (math), empirical robustness techniques (stats), and fault-tolerant infrastructure 
              (engineering).
            </p>

            <div className="bg-blue-50 border-2 border-blue-500 p-6 mb-6">
              <h4 className="text-sm font-bold text-primary mb-3">KEY EXAMPLES:</h4>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                <li className="text-gray-700">→ Deep Learning</li>
                <li className="text-gray-700">→ Autodiff Frameworks</li>
                <li className="text-gray-700">→ Architecture Design</li>
                <li className="text-gray-700">→ Distributed Optimization</li>
              </ul>
            </div>

            <p className="text-gray-800 leading-relaxed mb-6">
              This is where you need all three lenses simultaneously—pure theory isn't enough, pure engineering isn't enough, pure statistics 
              isn't enough. The most impactful work integrates all three perspectives. ChatGPT, Stable Diffusion, AlphaFold, autonomous vehicles, 
              recommendation systems—all the AI applications we use daily exist at this triple intersection.
            </p>

            <p className="text-gray-800 leading-relaxed mb-6">
              Consider implementing attention mechanisms in a Transformer. The mathematical formulation (scaled dot-product attention) must be 
              implemented efficiently (Flash Attention's tiling for memory hierarchy), while maintaining numerical stability (careful scaling 
              to prevent overflow) and statistical properties (preserving gradient flow for learning). Each decision—from the choice of 
              normalization to the layout of tensors in memory—requires understanding all three perspectives.
            </p>
          </section>

          {/* Conclusion */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-primary">
              Why This Framework Matters
            </h2>
            
            <p className="text-gray-800 leading-relaxed mb-6">
              This tripartite view isn't just academic taxonomy—it's a practical framework for approaching problems. When faced with a 
              challenge, I ask: What does the mathematical lens reveal about structure and correctness? What does the statistical lens 
              tell us about uncertainty and learning? What does the engineering lens demand in terms of performance and scale?
            </p>
            
            <p className="text-gray-800 leading-relaxed mb-6">
              The most interesting problems resist single-lens solutions. They demand the mathematical rigor to prove correctness, the 
              statistical sophistication to handle uncertainty, and the engineering discipline to build systems that actually work. This 
              is why I'm drawn to the intersections—they're where the hardest problems live, and where the most impactful solutions emerge.
            </p>

            <p className="text-gray-800 leading-relaxed mb-6">
              As we push the boundaries of what's computationally possible—whether in AI, quantum computing, or systems we haven't yet 
              imagined—success will come from those who can navigate all three domains fluently. The future belongs to the intersections.
            </p>
          </section>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <Link 
                to="/blog" 
                className="text-primary hover:underline"
              >
                ← Back to Blog
              </Link>
              <Link 
                to="/projects" 
                className="text-primary hover:underline"
              >
                View Projects →
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </div>
    </>
  )
}
