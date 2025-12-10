import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'

export function RunaheadBlogPost() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [activeSection, setActiveSection] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const sections = [
    { id: 'intro', label: 'Introduction', position: 0 },
    { id: 'prefetchers', label: 'Prefetchers', position: 15 },
    { id: 'commit-block', label: 'Commit Block', position: 25 },
    { id: 'problem', label: 'Memory Wall', position: 35 },
    { id: 'runahead-intro', label: 'Runahead', position: 45 },
    { id: 'solution', label: 'Mechanics', position: 55 },
    { id: 'implementation', label: 'gem5 Code', position: 65 },
    { id: 'results', label: 'Performance', position: 80 },
    { id: 'conclusion', label: 'Why It Matters', position: 95 },
  ]

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
    
    const handleScroll = () => {
      const scrolled = window.scrollY
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrolled / maxHeight) * 100
      setScrollProgress(progress)

      // Update active section based on scroll position
      const currentSection = sections.findIndex((section, index) => {
        const nextSection = sections[index + 1]
        return progress >= section.position && (!nextSection || progress < nextSection.position)
      })
      setActiveSection(currentSection)
    }

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('scroll', handleScroll)
    
    // Only add mouse tracking on desktop devices
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove)
    }
    
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', checkMobile)
    }
  }, [isMobile])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

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

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-blue-600 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Navigation Ticks */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`group/tick absolute flex items-center justify-end transition-all duration-300`}
            style={{ 
              top: `${index * 50 - (sections.length * 25)}px`,
              right: '0',
              width: 'auto'
            }}
          >
            <span className={`text-xs font-mono mr-3 transition-opacity duration-300 whitespace-nowrap ${
              activeSection === index ? 'opacity-100' : 'opacity-0 group-hover/tick:opacity-60'
            }`}>
              {section.label}
            </span>
            <div className={`h-px transition-all duration-300 ${
              activeSection === index 
                ? 'w-12 bg-blue-600' 
                : 'w-8 bg-gray-400 group-hover/tick:w-12 group-hover/tick:bg-gray-600'
            }`} />
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="font-mono text-sm text-gray-600 hover:text-blue-600 transition-colors">
              ← Back to Portfolio
            </Link>
            <span className="font-mono text-xs text-gray-500">
              December 2025
            </span>
          </div>
        </header>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-6 py-16 font-mono">
          {/* Title Section */}
          <section id="intro" className="mb-20">
            <h1 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              Runahead Execution
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Speculative Prefetching via Poison-Based Execution in gem5 O3CPU
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>By Thomas Kidane</span>
              <span>•</span>
              <span>CompSci 550, Duke University</span>
            </div>
          </section>

          {/* Introduction */}
          <section className="mb-20 leading-relaxed text-gray-800">
            <p className="text-lg mb-6 first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1">
              The memory wall has plagued computer architecture for three decades. Processor performance doubles every 18 months, but DRAM latency improves by only 7% per year. This exponentially growing gap forces modern CPUs to waste most of their execution capability waiting for memory. The industry has thrown everything at this problem—out-of-order execution, hardware prefetchers, massive cache hierarchies—yet memory stalls still dominate execution time in data-intensive workloads.
            </p>
            
            <p className="mb-6">
              Runahead execution exploits stall cycles to discover future cache misses through continued speculative execution. This implementation modifies gem5's O3CPU model: rename stage for poison bit tracking, commit stage for checkpoint/restore logic, LSQ for suppressing poisoned stores, and the physical register file to maintain poison state across 256+ registers.
            </p>
          </section>

          {/* Hardware Prefetchers Section */}
          <section id="prefetchers" className="mb-20">
            <h2 className="text-3xl font-bold mb-8">The Arms Race Against Memory Latency</h2>
            
            <p className="mb-6">
              The industry has deployed increasingly sophisticated mechanisms to combat the memory wall. Each technique attacks the problem from a different angle, with varying degrees of success and complexity.
            </p>

            <figure className="my-12">
              <img 
                src="/assets/HardwarePrefetchers.png" 
                alt="Hardware Prefetchers Evolution"
                className="w-full rounded-lg shadow-lg"
              />
              <figcaption className="text-center text-sm text-gray-600 mt-4">
                Figure 1: Evolution of hardware prefetching techniques and their effectiveness
              </figcaption>
            </figure>

            <div className="space-y-8 mb-8">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="font-mono font-bold mb-3">Stream Prefetchers (1990s)</h3>
                <p className="text-sm mb-3">
                  The simplest approach: detect sequential access patterns and fetch the next N cache lines. Works great for array traversals, struggles with pointer-chasing. Stream prefetchers typically fetch one or more cache lines ahead based on observed sequential patterns. The challenge: balancing aggressiveness with cache pollution when patterns change.
                </p>
                <p className="font-mono text-xs text-gray-600">
                  Effectiveness: High for sequential | Low for irregular | Complexity: Low
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="font-mono font-bold mb-3">Stride Prefetchers (2000s)</h3>
                <p className="text-sm mb-3">
                  Detect regular but non-unit strides (accessing every Nth element). The prefetcher maintains a table tracking recent access patterns per instruction address, learning the stride between consecutive accesses. Modern processors can track multiple independent stride streams simultaneously.
                </p>
                <p className="font-mono text-xs text-gray-600">
                  Effectiveness: High for regular strides | Medium complexity | Good accuracy
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="font-mono font-bold mb-3">Correlation Prefetchers (2010s)</h3>
                <p className="text-sm mb-3">
                  These prefetchers learn relationships between addresses—if address A is accessed, addresses B, C, and D are likely to follow. Implementations include Markov prefetchers and Global History Buffer (GHB) designs. The main challenge is storage overhead for tracking correlation patterns.
                </p>
                <p className="font-mono text-xs text-gray-600">
                  Effectiveness: Good for correlated patterns | High storage overhead | Complex
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-6">
                <h3 className="font-mono font-bold mb-3">ML-Based Prefetchers (2020s)</h3>
                <p className="text-sm mb-3">
                  Recent research explores using neural networks to learn complex access patterns. Perceptron-based prefetchers and LSTM models show promise in academic studies. The main challenge is the power and area overhead of the prediction logic itself.
                </p>
                <p className="font-mono text-xs text-gray-600">
                  Effectiveness: Promising in research | Very high complexity | Power hungry
                </p>
              </div>
            </div>

            <div className="bg-gray-900 text-green-400 p-6 my-8 font-mono text-xs rounded">
              <p className="mb-2"># The fundamental limitation of all prefetchers:</p>
              <p className="mb-2">if (pattern_not_recognized || confidence_low) {"{"}</p>
              <p className="mb-2">    // Do nothing, eat the full memory latency</p>
              <p className="mb-2">    stall_for_300_cycles();</p>
              <p>{"}"}</p>
            </div>
          </section>

          {/* Commit Blocking Section */}
          <section id="commit-block" className="mb-20">
            <h2 className="text-3xl font-bold mb-8">The Commit Block Problem</h2>
            
            <figure className="my-12">
              <img 
                src="/assets/commitblocked.png" 
                alt="Commit Block in Modern Processors"
                className="w-full rounded-lg shadow-lg"
              />
              <figcaption className="text-center text-sm text-gray-600 mt-4">
                Figure 2: How a single cache miss blocks the entire processor pipeline
              </figcaption>
            </figure>

            <p className="mb-6">
              Out-of-order execution was supposed to solve this problem. The processor can execute instructions speculatively, out of program order, as long as it commits them in order. But there's a fundamental limitation: the reorder buffer (ROB) has finite size. Once it fills up with a long-latency load at the head, the entire pipeline stalls.
            </p>

            <p className="mb-6">
              Modern processors have massive ROBs—Intel's Golden Cove has 512 entries, AMD's Zen 4 has 320. But even these monsters can fill up in dozens to hundreds of cycles when the head instruction is waiting for DRAM. The processor has all this execution capability—6-wide issue, 10+ execution units—sitting completely idle because one instruction is blocking commit.
            </p>

            <div className="bg-gray-50 border-l-4 border-orange-500 p-6 my-8 font-mono text-sm">
              <p className="mb-3 font-bold">The ROB filling timeline:</p>
              <p className="mb-2">Cycle 0: Load misses L1, L2, L3 - heads to DRAM</p>
              <p className="mb-2">Cycle 1-50: OoO engine continues, ROB fills to 25%</p>
              <p className="mb-2">Cycle 51-100: ROB at 50%, younger loads start missing too</p>
              <p className="mb-2">Cycle 101-150: ROB at 75%, dispatch starts stalling</p>
              <p className="mb-2">Cycle 151-200: ROB full, complete pipeline stall</p>
              <p>Cycle 201-300: Waiting... processor burning power doing nothing</p>
            </div>
          </section>

          {/* The Problem Section */}
          <section id="problem" className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Memory Latency Kills ILP</h2>
            
            <p className="mb-6">
              A modern O3 processor with a 192-entry ROB operating at 4GHz waits 200-300 cycles for DRAM access. The processor continues burning dynamic power keeping all those in-flight instructions alive, even though they're not making progress. The ROB fills up, dispatch stalls, and the entire pipeline grinds to a halt on a single cache miss.
            </p>

            <p className="mb-6">
              Prior work reports that memory-intensive SPEC benchmarks spend a large fraction of their execution time stalled on memory. The processor has a 6-wide issue width, 4 ALUs, 2 load/store units, but these resources remain idle when the ROB head blocks on DRAM access. The execution units cannot make forward progress despite having available functional units and instruction-level parallelism in the instruction window.
            </p>

            <div className="bg-gray-50 border-l-4 border-blue-600 p-6 my-8 font-mono text-sm">
              <p className="mb-2">
                <strong>L1 cache hit:</strong> 4 cycles (1ns @ 4GHz)
              </p>
              <p className="mb-2">
                <strong>L2 cache hit:</strong> 12 cycles (3ns)
              </p>
              <p className="mb-2">
                <strong>L3 cache hit:</strong> 42 cycles (10.5ns)
              </p>
              <p>
                <strong>DRAM access:</strong> 200-300 cycles (50-75ns)
              </p>
            </div>
          </section>

          {/* Main Illustration */}
          <section id="runahead-intro" className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Enter Runahead Execution</h2>
            
            <p className="mb-6">
              Runahead execution takes a fundamentally different approach. Instead of trying to predict future memory accesses, it uses the existing execution engine to discover them. The processor becomes its own prefetcher, using real program execution rather than pattern matching.
            </p>

            <figure className="my-12">
              <img 
                src="/assets/runaheadexecution.png" 
                alt="Runahead Execution Pipeline Diagram"
                className="w-full rounded-lg shadow-lg"
              />
              <figcaption className="text-center text-sm text-gray-600 mt-4">
                Figure 3: Runahead execution pipeline - converting stall time into prefetch generation
              </figcaption>
            </figure>

            <p className="mb-6">
              The diagram shows the key innovation: when the processor hits a cache miss that would normally stall everything, it checkpoints state and continues executing in a speculative mode. Instructions flow through the pipeline with poison bits marking data dependencies on the missing load. Non-poisoned memory accesses generate real prefetches, warming up the cache for when normal execution resumes.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8">
              <h3 className="font-mono font-bold mb-3">Why Runahead Succeeds Where Prefetchers Fail</h3>
              <ul className="space-y-2 text-sm font-mono">
                <li>• Prefetchers guess patterns - Runahead executes actual code</li>
                <li>• Prefetchers need training - Runahead works immediately</li>
                <li>• Prefetchers fail on irregular access - Runahead handles any pattern</li>
                <li>• Prefetchers require dedicated hardware - Runahead reuses existing ALUs</li>
              </ul>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="solution" className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Runahead Mechanics</h2>
            
            <p className="mb-6">
              When the ROB head blocks on an L2 miss, the processor checkpoints the register alias table (RAT), the return address stack (RAS), and the branch history register. The blocking load gets marked with a poison bit and returns a bogus value. Execution continues, propagating poison bits through dependent instructions—any instruction consuming a poisoned value becomes poisoned itself.
            </p>

            <p className="mb-6">
              The critical implementation detail: during runahead, we suppress stores to avoid corrupting memory and keep speculative state separate. Our implementation does not use a dedicated runahead cache; speculative loads compete for normal cache space. Non-poisoned loads that miss in L1/L2 can trigger memory requests, effectively converting the execution engine into a prefetcher.
            </p>

            <div className="bg-gray-900 text-green-400 p-6 my-8 font-mono text-sm rounded">
              <p className="mb-3"># Runahead triggers when:</p>
              <p className="mb-2">ROB_head.is_load && ROB_head.missed_in_L2 && ROB_full</p>
              <p className="mb-3"># Poison propagation:</p>
              <p className="mb-2">if (src1.poisoned || src2.poisoned) dest.poisoned = 1</p>
              <p className="mb-3"># Prefetch generation:</p>
              <p>if (!load.poisoned && cache_miss) issue_prefetch(load.addr)</p>
            </div>

            <p className="mb-6">
              The processor runs in this pseudo-execution mode until the original blocking load returns from DRAM. Then it flushes the pipeline, restores the checkpointed state, and resumes normal execution. But now the prefetches triggered during runahead have already started filling the cache hierarchy. Future loads that would have missed now hit in L2 or L3.
            </p>
          </section>

          {/* Implementation Section */}
          <section id="implementation" className="mb-20">
            <h2 className="text-3xl font-bold mb-8">gem5 Implementation Details</h2>
            
            <p className="mb-6">
              The gem5 O3CPU model required surgical modifications across multiple pipeline stages. The trickiest part was integrating poison bit tracking into the physical register file without breaking the existing register renaming logic. Each physical register now carries a 1-bit poison flag that flows through the dependency tracking mechanisms.
            </p>

            <div className="bg-gray-900 text-green-400 p-6 my-8 font-mono text-xs rounded overflow-x-auto">
              <pre>{`// Added to src/cpu/o3/regfile.hh
struct PhysReg {
    RegVal data;
    bool poisoned;  // New: poison bit per register
};

class PhysRegFile {
    // Checkpoint storage for runahead
    vector<PhysReg> checkpoint_regs;  
    vector<PhysRegIdPtr> checkpoint_rat;
    // ... rest of implementation
};

// Modified in src/cpu/o3/iew_impl.hh
if (inst->isLoad() && inst->missed_L2 && rob->isFull()) {
    cpu->enterRunaheadMode();
    inst->setPoisoned(true);
    inst->setCompleted();  // Fake completion
}`}</pre>
            </div>

            <p className="mb-6">
              The LSQ modifications required careful handling of poisoned values. Poisoned stores are suppressed to prevent memory corruption, while loads must track and propagate poison bits through the dependency chain. The implementation uses conservative exit conditions—waiting for the ROB to empty—which simplifies correctness but adds overhead.
            </p>

            <p className="mb-6">
              A production implementation could tag runahead-originated loads as low-priority prefetches that don't update LRU state, preventing cache pollution from mispredicted paths. Our gem5 implementation does not model these optimizations; runahead loads compete for cache space like normal loads.
            </p>

            <div className="border-l-4 border-yellow-500 pl-4 my-8">
              <p className="text-sm font-mono">
                <strong>Implementation overhead:</strong> We did not explicitly model checkpoint latency. Our main overhead appears as increased squash volume—our experiments show 9-137% more squashed instructions than baseline, reflecting the cost of full pipeline squashes on runahead exit.
              </p>
            </div>
          </section>

          {/* Results Section */}
          <section id="results" className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Performance Analysis</h2>
            
            <p className="mb-6">
              Our gem5 simulations on four microbenchmarks show that runahead modestly improves performance on memory-bound workloads. Independent load streams see the largest gains, with IPC improvements of about 5.3% and L1 miss-rate reductions of 7-8%. Pointer-chasing and linked-list patterns see smaller but still measurable gains (1.8-4.3% IPC), while a compute-bound benchmark shows essentially no change (-0.2%), confirming that runahead mainly helps when long-latency loads dominate execution.
            </p>

            <div className="bg-gray-900 text-green-400 p-6 my-8 font-mono text-xs rounded">
              <pre>{`# Our Microbenchmark Results (gem5 O3CPU):

Independent Loads:  +5.30% IPC, -7.82% L1 miss rate
Pointer Chasing:    +4.26% IPC, -5.29% L1 miss rate  
Linked List:        +1.78% IPC, -3.07% L1 miss rate
Matrix Multiply:    -0.22% IPC, +0.37% L1 miss rate (compute-bound)

Overhead: 9-137% increase in squashed instructions due to 
          full pipeline squash on runahead exit`}</pre>
            </div>

            <p className="mb-6">
              The original Mutlu et al. runahead design reports around 15-22% performance gains on SPEC workloads. Our simplified implementation achieves about one-quarter to one-third of those gains on microbenchmarks, which is consistent with the extra overheads we introduce: full-pipeline squashes on every runahead exit, conservative ROB-empty exits, and no dedicated runahead cache.
            </p>

            <p className="mb-6">
              We did not model power or area in gem5, so we cannot quantify energy cost directly. Qualitatively, runahead keeps the core active during periods when it would otherwise be stalled, which likely increases dynamic power but can still improve performance-per-watt on memory-bound workloads by turning idle cycles into useful prefetching work.
            </p>
          </section>

          {/* Conclusion Section */}
          <section id="conclusion" className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Architectural Implications</h2>
            
            <p className="mb-6">
              The performance gap between processor and memory continues to widen. A 6-wide superscalar core at 4GHz can issue 24 billion instructions per second, while DRAM latency has remained relatively flat. DDR5 maintains similar ~15ns latency to DDR3 despite bandwidth improvements, making latency-hiding techniques increasingly critical for performance.
            </p>

            <p className="mb-6">
              Runahead discards all computational results yet achieves performance gains through memory-level parallelism improvements. The original Mutlu et al. work demonstrated 15-22% speedups on SPEC workloads. Our simplified implementation achieves 1.8-5.3% IPC improvements on microbenchmarks. The processor repurposes existing ALUs and branch predictors as a prefetch generation engine during stall cycles.
            </p>

            <p className="mb-6">
              Intel experimented with similar techniques in Pentium 4's replay mechanism, though it was removed in later designs due to power concerns. Modern high-performance cores from IBM POWER and ARM Neoverse lines include aggressive speculative and prefetch mechanisms that may incorporate aspects of runahead execution, though implementation details are often proprietary. The technique remains attractive for workloads with large memory footprints.
            </p>

            <div className="bg-gray-900 text-green-400 p-6 my-8 font-mono text-sm rounded">
              <p className="mb-2"># Improvements over our implementation:</p>
              <p className="mb-2">- Selective restore instead of full pipeline squash</p>
              <p className="mb-2">- Dedicated runahead cache to prevent pollution</p>
              <p className="mb-2">- Smarter exit conditions (not just ROB-empty)</p>
              <p>- Priority tagging for runahead-generated prefetches</p>
            </div>

            <p className="mb-6">
              The gem5 implementation required modifications across 15+ files in the O3CPU model just for poison bit propagation. Key challenges included maintaining architectural correctness during speculative execution, handling memory ordering constraints with poisoned loads, and managing the checkpoint/restore overhead without dedicated hardware structures. Future work could explore selective restoration mechanisms to avoid full pipeline flushes and integration with existing hardware prefetchers for coordinated memory access prediction.
            </p>
          </section>

          {/* Footer */}
          <footer className="border-t border-gray-200 pt-8 mt-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Interested in the implementation details? Check out the code:
                </p>
                <a 
                  href="https://github.com/habersaat/runahead-gem5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-mono text-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  github.com/habersaat/runahead-gem5
                </a>
              </div>
              
              <Link 
                to="/projects"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-mono"
              >
                View more projects →
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </>
  )
}
