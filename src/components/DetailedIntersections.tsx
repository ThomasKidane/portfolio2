export function DetailedIntersections() {
  const intersections = [
    {
      id: 'math-eng',
      title: 'MATHEMATICS ∩ ENGINEERING', 
      subtitle: 'Making Math Run on Real Machines',
      content: `This intersection is where theoretical elegance meets physical reality. It encompasses numerical analysis and scientific computing, 
      where mathematically sound algorithms must be implemented without falling victim to floating-point instability. Cache-aware algorithms 
      optimize for the memory hierarchy of real processors, while external-memory algorithms handle datasets too large for RAM.`,
      examples: ['Numerical Analysis', 'Cache-Oblivious Algos', 'Formal Verification', 'Crypto Implementation'],
      illustration: 'math-eng'
    },
    {
      id: 'math-stats',
      title: 'MATHEMATICS ∩ STATISTICS',
      subtitle: 'Probabilistic Math & Learning Theory', 
      content: `Here we find the theoretical foundations of learning and randomness. Learning theory provides rigorous bounds on generalization 
      through concepts like VC dimension and PAC learning—asking how many samples we need to learn reliably. Randomized algorithms use 
      probabilistic techniques for problems where deterministic approaches fall short.`,
      examples: ['Learning Theory', 'Randomized Algorithms', 'Information Theory', 'PAC Learning'],
      illustration: 'math-stats'
    },
    {
      id: 'eng-stats',
      title: 'ENGINEERING ∩ STATISTICS',
      subtitle: 'Systems for Learning & Data',
      content: `This is where statistical learning meets the realities of scale and production. Distributed training frameworks enable 
      models with billions of parameters, implementing data parallelism, model parallelism, and pipeline parallelism. Inference systems 
      must serve models with millisecond latency, using quantization, pruning, and distillation.`,
      examples: ['Distributed Training', 'Model Serving', 'Big Data Systems', 'ML Accelerators'],
      illustration: 'eng-stats'
    },
    {
      id: 'triple',
      title: 'THE TRIPLE INTERSECTION',
      subtitle: 'Engineering ∩ Mathematics ∩ Statistics',
      content: `The center of the triangle is where modern AI research and practice truly lives. Designing a Transformer architecture requires 
      understanding its mathematical expressivity and optimization landscape, statistical generalization properties, and engineering constraints 
      like parallelizability and memory footprint.`,
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
            <div key={intersection.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-start`}>
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

              {/* Root - all elements */}
              <rect x="170" y="110" width="80" height="30" fill="#FFD9FF" stroke="#9141E1" strokeWidth="3" />
              <text x="210" y="130" textAnchor="middle" fill="#9141E1" fontFamily="Press Start 2P" fontSize="10">30</text>

              {/* Connection lines */}
              <line x1="60" y1="320" x2="70" y2="280" stroke="#666" strokeWidth="2" />
              <line x1="100" y1="320" x2="70" y2="280" stroke="#666" strokeWidth="2" />
              
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
              {/* 3D Gaussian Distribution */}
              {[...Array(15)].map((_, row) => {
                const points = [];
                const z = row / 14;
                const y = 300 - row * 16;
                
                for (let col = 0; col <= 20; col++) {
                  const x = col / 20;
                  const xPos = 80 + col * 12;
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

              <circle cx="200" cy="170" r="8" fill="#E14169" opacity="0.8" />
              <circle cx="200" cy="170" r="20" fill="none" stroke="#E14169" strokeWidth="2" opacity="0.5" />

              <text x="200" y="30" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">
                N(μ, Σ)
              </text>
              <text x="200" y="50" textAnchor="middle" fill="#666" fontFamily="Press Start 2P" fontSize="6">
                MULTIVARIATE GAUSSIAN
              </text>
            </>
          )}

          {type === 'eng-stats' && (
            <>
              <text x="200" y="30" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">
                DATA PARALLELISM
              </text>
              
              {/* GPU nodes */}
              {[...Array(4)].map((_, i) => {
                const x = i < 2 ? 50 : 290;
                const y = i % 2 === 0 ? 180 : 280;
                const gpuNum = i + 1;
                
                return (
                  <g key={`gpu-${i}`}>
                    <rect x={x} y={y} width="70" height="60" fill="#C8D9FF" stroke="#4169E1" strokeWidth="3" />
                    <text x={x + 35} y={y + 25} textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="7">
                      GPU {gpuNum}
                    </text>
                  </g>
                );
              })}

              <text x="200" y="375" textAnchor="middle" fill="#E14169" fontFamily="Press Start 2P" fontSize="7">
                ALL-REDUCE
              </text>
            </>
          )}

          {type === 'triple' && (
            <>
              <text x="200" y="25" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">
                AI APPLICATIONS
              </text>

              <rect x="40" y="60" width="140" height="80" fill="#C8D9FF" stroke="#4169E1" strokeWidth="3" />
              <text x="110" y="80" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="9">
                CHATGPT
              </text>

              <rect x="220" y="60" width="140" height="80" fill="#FFD9C8" stroke="#E14169" strokeWidth="3" />
              <text x="290" y="80" textAnchor="middle" fill="#E14169" fontFamily="Press Start 2P" fontSize="8">
                STABLE
              </text>
              <text x="290" y="93" textAnchor="middle" fill="#E14169" fontFamily="Press Start 2P" fontSize="8">
                DIFFUSION
              </text>

              <rect x="130" y="270" width="140" height="70" fill="#C8FFD9" stroke="#41E169" strokeWidth="3" />
              <text x="200" y="290" textAnchor="middle" fill="#41E169" fontFamily="Press Start 2P" fontSize="7">
                RECOMMENDER
              </text>
              <text x="200" y="302" textAnchor="middle" fill="#41E169" fontFamily="Press Start 2P" fontSize="7">
                SYSTEMS
              </text>

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
