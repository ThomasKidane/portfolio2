export function IntersectionSection() {
  const intersections = [
    {
      id: 'math-eng',
      title: 'MATHEMATICS ∩ ENGINEERING',
      subtitle: 'Making Math Run on Real Machines',
      content: `This intersection is where theoretical elegance meets physical reality. It encompasses numerical analysis and scientific computing, 
      where mathematically sound algorithms must be implemented without falling victim to floating-point instability. Cache-aware algorithms 
      optimize for the memory hierarchy of real processors, while external-memory algorithms handle datasets too large for RAM. Cryptography 
      implementation demands constant-time operations to resist timing attacks. Formal verification tools like Coq and Isabelle prove that 
      compilers, operating system kernels, and critical protocols behave correctly. This is rigorous reasoning about performance and correctness, 
      implemented in silicon and code.`,
      examples: ['Numerical Analysis', 'Cache-Oblivious Algos', 'Formal Verification', 'Crypto Implementation'],
      illustration: 'math-eng'
    },
    {
      id: 'math-stats',
      title: 'MATHEMATICS ∩ STATISTICS',
      subtitle: 'Probabilistic Math & Learning Theory',
      content: `Here we find the theoretical foundations of learning and randomness. Learning theory provides rigorous bounds on generalization 
      through concepts like VC dimension and PAC learning—asking how many samples we need to learn reliably. Randomized algorithms use 
      probabilistic techniques for problems where deterministic approaches fall short: random walks on graphs, locality-sensitive hashing 
      for nearest-neighbor search, streaming algorithms that process massive data in limited memory. Information theory connects entropy, 
      compression, and learning, revealing deep relationships between code length and generalization. This intersection treats probability 
      distributions as mathematical objects, studying their properties with the same rigor as algebraic structures.`,
      examples: ['Learning Theory', 'Randomized Algorithms', 'Information Theory', 'PAC Learning'],
      illustration: 'math-stats'
    },
    {
      id: 'eng-stats',
      title: 'ENGINEERING ∩ STATISTICS',
      subtitle: 'Systems for Learning & Data',
      content: `This is where statistical learning meets the realities of scale and production. Distributed training frameworks like PyTorch DDP 
      and DeepSpeed enable models with billions of parameters, implementing data parallelism, model parallelism, and pipeline parallelism. 
      Inference systems must serve models with millisecond latency, using quantization, pruning, and distillation. Big data infrastructure—Spark, 
      Flink, Kafka—processes streams of events in real-time, maintaining feature stores and ensuring consistency between offline training and 
      online serving. Specialized hardware like GPUs and TPUs are architected specifically for the matrix operations underlying modern ML. 
      This intersection asks: we have fancy models and massive datasets, but how do we engineer infrastructure to make them usable in reality?`,
      examples: ['Distributed Training', 'Model Serving', 'Big Data Systems', 'ML Accelerators'],
      illustration: 'eng-stats'
    },
    {
      id: 'triple',
      title: 'THE TRIPLE INTERSECTION',
      subtitle: 'Engineering ∩ Mathematics ∩ Statistics',
      content: `The center of the triangle is where modern AI research and practice truly lives. Designing a Transformer architecture requires 
      understanding its mathematical expressivity and optimization landscape, statistical generalization properties, and engineering constraints 
      like parallelizability and memory footprint. Automatic differentiation frameworks combine compiler technology (graph optimization, operator fusion) 
      with mathematical correctness (computing exact gradients) and statistical needs (handling large batches efficiently). Training large models 
      involves distributed optimization algorithms (math), empirical robustness techniques (stats), and fault-tolerant infrastructure (engineering). 
      This is where you need all three lenses simultaneously—pure theory isn't enough, pure engineering isn't enough, pure statistics isn't enough. 
      The most impactful work integrates all three perspectives.`,
      examples: ['Deep Learning', 'Autodiff Frameworks', 'Architecture Design', 'Distributed Optimization'],
      illustration: 'triple'
    }
  ];

  return (
    <div className="px-12 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 
            style={{ 
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '1.5rem',
              color: '#4169E1',
              letterSpacing: '0.1em',
              lineHeight: '1.6',
              marginBottom: '1rem'
            }}
          >
            THE INTERSECTIONS
          </h2>
          <div className="border-t-2 border-dotted border-gray-300 mt-4" />
        </div>

        <div className="space-y-20">
          {intersections.map((intersection, idx) => (
            <div key={intersection.id} className={`grid grid-cols-1 ${idx % 2 === 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-12 items-start`}>
              {/* Text content */}
              <div className={idx % 2 === 0 ? 'order-1' : 'order-1 lg:order-2'}>
                <div 
                  className="mb-2"
                  style={{ 
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '0.875rem',
                    color: '#4169E1',
                    letterSpacing: '0.1em',
                    lineHeight: '1.6'
                  }}
                >
                  {intersection.title}
                </div>
                <div 
                  className="mb-4"
                  style={{ 
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '0.6rem',
                    color: '#999',
                    letterSpacing: '0.05em'
                  }}
                >
                  {intersection.subtitle}
                </div>
                
                <p 
                  style={{ 
                    fontFamily: 'Georgia, serif',
                    fontSize: '1rem',
                    lineHeight: '1.8',
                    color: '#333',
                    textAlign: 'justify',
                    marginBottom: '1.5rem'
                  }}
                >
                  {intersection.content}
                </p>

                {/* Examples box */}
                <div className="border-2 border-blue-500 bg-blue-50 p-4">
                  <div 
                    className="mb-3"
                    style={{ 
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: '0.6rem',
                      color: '#4169E1',
                      letterSpacing: '0.05em'
                    }}
                  >
                    KEY EXAMPLES:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {intersection.examples.map((example, i) => (
                      <div 
                        key={i}
                        style={{ 
                          fontFamily: '"Press Start 2P", monospace',
                          fontSize: '0.5rem',
                          color: '#666',
                          letterSpacing: '0.05em',
                          lineHeight: '1.6'
                        }}
                      >
                        → {example}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Illustration */}
              <div className={idx % 2 === 0 ? 'order-2' : 'order-2 lg:order-1'}>
                <IntersectionIllustration type={intersection.illustration} number={idx + 3} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface IllustrationProps {
  type: string;
  number: number;
}

function IntersectionIllustration({ type, number }: IllustrationProps) {
  return (
    <div>
      <div className="border-4 border-blue-500 bg-white p-6">
        <svg viewBox="0 0 400 400" className="w-full h-auto">
          <defs>
            <pattern id={`grid-${type}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#F0F0F0" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="400" height="400" fill={`url(#grid-${type})`} />

          {type === 'math-eng' && (
            <>
              {/* Segment tree structure */}
              {/* Bottom level - array elements */}
              <rect x="30" y="320" width="30" height="30" fill="#C8D9FF" stroke="#4169E1" strokeWidth="2" />
              <rect x="70" y="320" width="30" height="30" fill="#C8D9FF" stroke="#4169E1" strokeWidth="2" />
              <rect x="110" y="320" width="30" height="30" fill="#C8D9FF" stroke="#4169E1" strokeWidth="2" />
              <rect x="150" y="320" width="30" height="30" fill="#C8D9FF" stroke="#4169E1" strokeWidth="2" />
              <rect x="230" y="320" width="30" height="30" fill="#C8D9FF" stroke="#4169E1" strokeWidth="2" />
              <rect x="270" y="320" width="30" height="30" fill="#C8D9FF" stroke="#4169E1" strokeWidth="2" />
              <rect x="310" y="320" width="30" height="30" fill="#C8D9FF" stroke="#4169E1" strokeWidth="2" />
              <rect x="350" y="320" width="30" height="30" fill="#C8D9FF" stroke="#4169E1" strokeWidth="2" />
              
              {/* Array values */}
              <text x="45" y="340" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">2</text>
              <text x="85" y="340" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">5</text>
              <text x="125" y="340" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">1</text>
              <text x="165" y="340" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">4</text>
              <text x="245" y="340" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">3</text>
              <text x="285" y="340" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">7</text>
              <text x="325" y="340" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">2</text>
              <text x="365" y="340" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">6</text>

              {/* Level 3 - pairs */}
              <rect x="50" y="250" width="40" height="30" fill="#FFD9C8" stroke="#E14169" strokeWidth="2" />
              <rect x="130" y="250" width="40" height="30" fill="#FFD9C8" stroke="#E14169" strokeWidth="2" />
              <rect x="250" y="250" width="40" height="30" fill="#FFD9C8" stroke="#E14169" strokeWidth="2" />
              <rect x="330" y="250" width="40" height="30" fill="#FFD9C8" stroke="#E14169" strokeWidth="2" />
              
              <text x="70" y="270" textAnchor="middle" fill="#E14169" fontFamily="Press Start 2P" fontSize="8">7</text>
              <text x="150" y="270" textAnchor="middle" fill="#E14169" fontFamily="Press Start 2P" fontSize="8">5</text>
              <text x="270" y="270" textAnchor="middle" fill="#E14169" fontFamily="Press Start 2P" fontSize="8">10</text>
              <text x="350" y="270" textAnchor="middle" fill="#E14169" fontFamily="Press Start 2P" fontSize="8">8</text>

              {/* Level 2 - quads */}
              <rect x="90" y="180" width="60" height="30" fill="#D9FFC8" stroke="#69E141" strokeWidth="2" />
              <rect x="290" y="180" width="60" height="30" fill="#D9FFC8" stroke="#69E141" strokeWidth="2" />
              
              <text x="120" y="200" textAnchor="middle" fill="#69E141" fontFamily="Press Start 2P" fontSize="8">12</text>
              <text x="320" y="200" textAnchor="middle" fill="#69E141" fontFamily="Press Start 2P" fontSize="8">18</text>

              {/* Root - all elements */}
              <rect x="170" y="110" width="80" height="30" fill="#FFD9FF" stroke="#9141E1" strokeWidth="3" />
              <text x="210" y="130" textAnchor="middle" fill="#9141E1" fontFamily="Press Start 2P" fontSize="10">30</text>

              {/* Connection lines */}
              <line x1="60" y1="320" x2="70" y2="280" stroke="#666" strokeWidth="2" />
              <line x1="100" y1="320" x2="70" y2="280" stroke="#666" strokeWidth="2" />
              <line x1="140" y1="320" x2="150" y2="280" stroke="#666" strokeWidth="2" />
              <line x1="180" y1="320" x2="150" y2="280" stroke="#666" strokeWidth="2" />
              <line x1="260" y1="320" x2="270" y2="280" stroke="#666" strokeWidth="2" />
              <line x1="300" y1="320" x2="270" y2="280" stroke="#666" strokeWidth="2" />
              <line x1="340" y1="320" x2="350" y2="280" stroke="#666" strokeWidth="2" />
              <line x1="380" y1="320" x2="350" y2="280" stroke="#666" strokeWidth="2" />
              
              <line x1="70" y1="250" x2="120" y2="210" stroke="#666" strokeWidth="2" />
              <line x1="150" y1="250" x2="120" y2="210" stroke="#666" strokeWidth="2" />
              <line x1="270" y1="250" x2="320" y2="210" stroke="#666" strokeWidth="2" />
              <line x1="350" y1="250" x2="320" y2="210" stroke="#666" strokeWidth="2" />
              
              <line x1="120" y1="180" x2="210" y2="140" stroke="#666" strokeWidth="3" />
              <line x1="320" y1="180" x2="210" y2="140" stroke="#666" strokeWidth="3" />

              {/* Labels */}
              <text x="200" y="60" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="9">
                SEGMENT TREE
              </text>
              <text x="200" y="80" textAnchor="middle" fill="#666" fontFamily="Press Start 2P" fontSize="6">
                O(log n) RANGE QUERIES
              </text>
            </>
          )}

          {type === 'math-stats' && (
            <>
              {/* 3D Gaussian Distribution Visualization */}
              {/* Draw 3D perspective grid for surface */}
              {[...Array(7)].map((_, i) => {
                const y = 300 - i * 35;
                const scale = 1 - i * 0.1;
                return (
                  <g key={`grid-line-${i}`}>
                    {/* Horizontal grid lines */}
                    <line 
                      x1={200 - 120 * scale} 
                      y1={y} 
                      x2={200 + 120 * scale} 
                      y2={y} 
                      stroke="#E0E0E0" 
                      strokeWidth="1" 
                    />
                  </g>
                );
              })}
              
              {/* Vertical grid lines */}
              {[...Array(9)].map((_, i) => {
                const xOffset = -120 + i * 30;
                return (
                  <line 
                    key={`vgrid-${i}`}
                    x1={200 + xOffset} 
                    y1={300} 
                    x2={200 + xOffset * 0.3} 
                    y2={60} 
                    stroke="#E0E0E0" 
                    strokeWidth="1" 
                  />
                );
              })}

              {/* 3D Gaussian surface - draw from back to front */}
              {[...Array(15)].map((_, row) => {
                const points = [];
                const z = row / 14;
                const y = 300 - row * 16;
                
                for (let col = 0; col <= 20; col++) {
                  const x = col / 20;
                  const xPos = 80 + col * 12;
                  // Gaussian function
                  const height = Math.exp(-((x - 0.5) ** 2 + (z - 0.5) ** 2) * 18);
                  const yOffset = height * 120;
                  points.push(`${xPos},${y - yOffset}`);
                }
                
                return (
                  <polyline
                    key={`gaussian-row-${row}`}
                    points={points.join(' ')}
                    fill="none"
                    stroke="#4169E1"
                    strokeWidth="2"
                    opacity={0.6}
                  />
                );
              })}

              {/* Center peak highlight */}
              <circle cx="200" cy="170" r="8" fill="#E14169" opacity="0.8" />
              <circle cx="200" cy="170" r="20" fill="none" stroke="#E14169" strokeWidth="2" opacity="0.5" />
              <circle cx="200" cy="170" r="35" fill="none" stroke="#E14169" strokeWidth="1" opacity="0.3" />

              {/* Contour lines on base */}
              <ellipse cx="200" cy="300" rx="40" ry="20" fill="none" stroke="#69E141" strokeWidth="2" opacity="0.6" />
              <ellipse cx="200" cy="300" rx="70" ry="35" fill="none" stroke="#69E141" strokeWidth="1.5" opacity="0.4" />
              <ellipse cx="200" cy="300" rx="100" ry="50" fill="none" stroke="#69E141" strokeWidth="1" opacity="0.3" />

              {/* Axes labels */}
              <text x="200" y="330" textAnchor="middle" fill="#666" fontFamily="Press Start 2P" fontSize="7">
                μ
              </text>

              {/* Mathematical notation */}
              <text x="200" y="30" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">
                N(μ, Σ)
              </text>
              <text x="200" y="50" textAnchor="middle" fill="#666" fontFamily="Press Start 2P" fontSize="6">
                MULTIVARIATE GAUSSIAN
              </text>

              {/* Probability density annotation */}
              <line x1="200" y1="170" x2="280" y2="140" stroke="#E14169" strokeWidth="2" strokeDasharray="3,3" />
              <text x="285" y="145" fill="#E14169" fontFamily="Press Start 2P" fontSize="7">
                p(x)
              </text>

              {/* Covariance ellipse indicator */}
              <text x="120" y="310" fill="#69E141" fontFamily="Press Start 2P" fontSize="6">
                Σ
              </text>
            </>
          )}

          {type === 'eng-stats' && (
            <>
              {/* Data Parallelism - Model Replication Across GPUs */}
              
              {/* Title */}
              <text x="200" y="30" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">
                DATA PARALLELISM
              </text>
              <text x="200" y="50" textAnchor="middle" fill="#666" fontFamily="Press Start 2P" fontSize="6">
                DISTRIBUTED TRAINING
              </text>

              {/* Central model/parameter server */}
              <rect x="160" y="80" width="80" height="50" fill="#FFD9FF" stroke="#9141E1" strokeWidth="3" />
              <text x="200" y="100" textAnchor="middle" fill="#9141E1" fontFamily="Press Start 2P" fontSize="7">
                MODEL
              </text>
              <text x="200" y="118" textAnchor="middle" fill="#9141E1" fontFamily="Press Start 2P" fontSize="6">
                PARAMS
              </text>

              {/* GPU nodes in a grid */}
              {[...Array(4)].map((_, i) => {
                const x = i < 2 ? 50 : 290;
                const y = i % 2 === 0 ? 180 : 280;
                const gpuNum = i + 1;
                
                return (
                  <g key={`gpu-${i}`}>
                    {/* GPU box */}
                    <rect x={x} y={y} width="70" height="60" fill="#C8D9FF" stroke="#4169E1" strokeWidth="3" />
                    <text x={x + 35} y={y + 25} textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="7">
                      GPU {gpuNum}
                    </text>
                    
                    {/* Model replica indicator */}
                    <rect x={x + 10} y={y + 32} width="50" height="8" fill="#4169E1" opacity="0.3" />
                    <rect x={x + 10} y={y + 42} width="50" height="8" fill="#4169E1" opacity="0.3" />
                    
                    {/* Data batch indicator */}
                    <text x={x + 35} y={y + 58} textAnchor="middle" fill="#69E141" fontFamily="Press Start 2P" fontSize="5">
                      BATCH {gpuNum}
                    </text>
                    
                    {/* Arrows from central model */}
                    <line 
                      x1="200" 
                      y1="130" 
                      x2={x + 35} 
                      y2={y - 5} 
                      stroke="#9141E1" 
                      strokeWidth="2" 
                      markerEnd="url(#arrowhead)"
                      strokeDasharray="5,5"
                    />
                    
                    {/* Gradient arrows back to center */}
                    <line 
                      x1={x + 35} 
                      y1={y + 60} 
                      x2="200" 
                      y2="130" 
                      stroke="#E14169" 
                      strokeWidth="2" 
                      markerEnd="url(#arrowhead-red)"
                    />
                  </g>
                );
              })}

              {/* Arrow markers */}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="#9141E1" />
                </marker>
                <marker id="arrowhead-red" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="#E14169" />
                </marker>
              </defs>

              {/* Legend */}
              <rect x="20" y="360" width="160" height="30" fill="#F0F0F0" stroke="#666" strokeWidth="1" />
              <line x1="30" y1="370" x2="50" y2="370" stroke="#9141E1" strokeWidth="2" strokeDasharray="5,5" />
              <text x="55" y="373" fill="#666" fontFamily="Press Start 2P" fontSize="5">
                BROADCAST
              </text>
              <line x1="30" y1="380" x2="50" y2="380" stroke="#E14169" strokeWidth="2" />
              <text x="55" y="383" fill="#666" fontFamily="Press Start 2P" fontSize="5">
                GRADIENTS
              </text>

              {/* AllReduce annotation */}
              <text x="200" y="375" textAnchor="middle" fill="#E14169" fontFamily="Press Start 2P" fontSize="7">
                ALL-REDUCE
              </text>
            </>
          )}

          {type === 'triple' && (
            <>
              {/* Modern AI Applications */}
              <text x="200" y="25" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">
                AI APPLICATIONS
              </text>

              {/* ChatGPT / LLM Box */}
              <g>
                <rect x="40" y="60" width="140" height="80" fill="#C8D9FF" stroke="#4169E1" strokeWidth="3" />
                <text x="110" y="80" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="9">
                  CHATGPT
                </text>
                <text x="110" y="95" textAnchor="middle" fill="#666" fontFamily="Press Start 2P" fontSize="5">
                  TRANSFORMER
                </text>
                
                {/* Attention visualization */}
                <circle cx="70" cy="115" r="8" fill="#4169E1" opacity="0.5" />
                <circle cx="110" cy="115" r="8" fill="#4169E1" opacity="0.7" />
                <circle cx="150" cy="115" r="8" fill="#4169E1" opacity="0.5" />
                
                <line x1="70" y1="115" x2="110" y2="115" stroke="#4169E1" strokeWidth="2" />
                <line x1="110" y1="115" x2="150" y2="115" stroke="#4169E1" strokeWidth="2" />
                <line x1="70" y1="115" x2="150" y2="115" stroke="#4169E1" strokeWidth="1" opacity="0.3" />
                
                <text x="110" y="133" textAnchor="middle" fill="#666" fontFamily="Press Start 2P" fontSize="4">
                  ATTENTION HEADS
                </text>
              </g>

              {/* Stable Diffusion Box */}
              <g>
                <rect x="220" y="60" width="140" height="80" fill="#FFD9C8" stroke="#E14169" strokeWidth="3" />
                <text x="290" y="80" textAnchor="middle" fill="#E14169" fontFamily="Press Start 2P" fontSize="8">
                  STABLE
                </text>
                <text x="290" y="93" textAnchor="middle" fill="#E14169" fontFamily="Press Start 2P" fontSize="8">
                  DIFFUSION
                </text>
                
                {/* Diffusion process visualization */}
                <rect x="240" y="105" width="20" height="20" fill="#E14169" opacity="0.8" />
                <text x="250" y="120" textAnchor="middle" fill="white" fontFamily="Press Start 2P" fontSize="8">→</text>
                
                <rect x="265" y="105" width="20" height="20" fill="#E14169" opacity="0.5" />
                <text x="275" y="120" textAnchor="middle" fill="white" fontFamily="Press Start 2P" fontSize="8">→</text>
                
                <rect x="290" y="105" width="20" height="20" fill="#E14169" opacity="0.3" />
                <text x="300" y="120" textAnchor="middle" fill="white" fontFamily="Press Start 2P" fontSize="8">→</text>
                
                <rect x="315" y="105" width="20" height="20" fill="none" stroke="#E14169" strokeWidth="2" />
                
                <text x="290" y="133" textAnchor="middle" fill="#666" fontFamily="Press Start 2P" fontSize="4">
                  DENOISING STEPS
                </text>
              </g>

              {/* AlphaFold / Protein Folding */}
              <g>
                <rect x="40" y="170" width="140" height="70" fill="#D9FFC8" stroke="#69E141" strokeWidth="3" />
                <text x="110" y="190" textAnchor="middle" fill="#69E141" fontFamily="Press Start 2P" fontSize="8">
                  ALPHAFOLD
                </text>
                
                {/* Protein structure visualization */}
                <path 
                  d="M 60 205 Q 80 200, 90 210 Q 100 220, 110 215 Q 120 210, 130 215 Q 140 220, 160 215" 
                  fill="none" 
                  stroke="#69E141" 
                  strokeWidth="3"
                />
                <circle cx="60" cy="205" r="3" fill="#69E141" />
                <circle cx="90" cy="210" r="3" fill="#69E141" />
                <circle cx="110" cy="215" r="3" fill="#69E141" />
                <circle cx="130" cy="215" r="3" fill="#69E141" />
                <circle cx="160" cy="215" r="3" fill="#69E141" />
                
                <text x="110" y="233" textAnchor="middle" fill="#666" fontFamily="Press Start 2P" fontSize="4">
                  PROTEIN STRUCTURE
                </text>
              </g>

              {/* Autonomous Vehicles */}
              <g>
                <rect x="220" y="170" width="140" height="70" fill="#FFD9FF" stroke="#9141E1" strokeWidth="3" />
                <text x="290" y="190" textAnchor="middle" fill="#9141E1" fontFamily="Press Start 2P" fontSize="7">
                  AUTONOMOUS
                </text>
                <text x="290" y="202" textAnchor="middle" fill="#9141E1" fontFamily="Press Start 2P" fontSize="7">
                  VEHICLES
                </text>
                
                {/* Simple car shape */}
                <rect x="260" y="210" width="40" height="20" fill="none" stroke="#9141E1" strokeWidth="2" />
                <circle cx="270" cy="230" r="5" fill="none" stroke="#9141E1" strokeWidth="2" />
                <circle cx="290" cy="230" r="5" fill="none" stroke="#9141E1" strokeWidth="2" />
                
                {/* Sensor lines */}
                <line x1="300" y1="215" x2="320" y2="205" stroke="#9141E1" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="300" y1="220" x2="325" y2="220" stroke="#9141E1" strokeWidth="1" strokeDasharray="2,2" />
              </g>

              {/* Recommendation Systems */}
              <g>
                <rect x="130" y="270" width="140" height="70" fill="#C8FFD9" stroke="#41E169" strokeWidth="3" />
                <text x="200" y="290" textAnchor="middle" fill="#41E169" fontFamily="Press Start 2P" fontSize="7">
                  RECOMMENDER
                </text>
                <text x="200" y="302" textAnchor="middle" fill="#41E169" fontFamily="Press Start 2P" fontSize="7">
                  SYSTEMS
                </text>
                
                {/* User-item matrix representation */}
                {[...Array(3)].map((_, i) => (
                  <g key={`rec-row-${i}`}>
                    {[...Array(4)].map((_, j) => (
                      <rect 
                        key={`rec-cell-${i}-${j}`}
                        x={160 + j * 18} 
                        y={310 + i * 8} 
                        width="15" 
                        height="6" 
                        fill="#41E169" 
                        opacity={Math.random() > 0.5 ? 0.7 : 0.2}
                        stroke="#41E169"
                        strokeWidth="1"
                      />
                    ))}
                  </g>
                ))}
              </g>

              {/* Connecting lines showing integration */}
              <line x1="110" y1="140" x2="200" y2="270" stroke="#666" strokeWidth="1" opacity="0.3" strokeDasharray="5,5" />
              <line x1="290" y1="140" x2="200" y2="270" stroke="#666" strokeWidth="1" opacity="0.3" strokeDasharray="5,5" />
              <line x1="110" y1="240" x2="200" y2="270" stroke="#666" strokeWidth="1" opacity="0.3" strokeDasharray="5,5" />
              <line x1="290" y1="240" x2="200" y2="270" stroke="#666" strokeWidth="1" opacity="0.3" strokeDasharray="5,5" />

              {/* Bottom note */}
              <rect x="20" y="360" width="360" height="30" fill="#F5F5F5" stroke="#4169E1" strokeWidth="2" />
              <text x="200" y="378" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="6">
                ALL APPS YOU USE DAILY
              </text>
            </>
          )}

          {/* Border label */}
          <text x="20" y="30" fill="#999" fontFamily="Press Start 2P" fontSize="7">
            PIC_{number.toString().padStart(3, '0')}
          </text>
        </svg>
      </div>
      
      <div className="mt-4 text-center">
        <span 
          style={{ 
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '0.6rem',
            color: '#999',
            letterSpacing: '0.05em'
          }}
        >
          PICTURE {number}
        </span>
      </div>
    </div>
  );
}