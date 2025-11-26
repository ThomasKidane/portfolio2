export function TriangleIllustration() {
  return (
    <div className="px-12 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="mb-12">
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
            THE CS TRIANGLE
          </h2>
          <div className="border-t-2 border-dotted border-gray-300 mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Illustration */}
          <div className="relative">
            <div className="border-4 border-blue-500 bg-white p-6">
              <svg viewBox="0 0 600 600" className="w-full h-auto">
                {/* Grid pattern background */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E8E8FF" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="600" height="600" fill="url(#grid)" />

                {/* Main triangle */}
                <path
                  d="M 300 80 L 520 450 L 80 450 Z"
                  fill="none"
                  stroke="#4169E1"
                  strokeWidth="3"
                />

                {/* Inner circles for intersections */}
                {/* Math-Eng intersection */}
                <circle cx="240" cy="200" r="60" fill="#C8D9FF" opacity="0.6" stroke="#4169E1" strokeWidth="2" />
                
                {/* Math-Stats intersection */}
                <circle cx="360" cy="200" r="60" fill="#C8D9FF" opacity="0.6" stroke="#4169E1" strokeWidth="2" />
                
                {/* Eng-Stats intersection */}
                <circle cx="300" cy="340" r="60" fill="#C8D9FF" opacity="0.6" stroke="#4169E1" strokeWidth="2" />
                
                {/* Center - triple intersection */}
                <circle cx="300" cy="250" r="40" fill="#4169E1" opacity="0.8" stroke="#4169E1" strokeWidth="2" />

                {/* Dashed lines pointing to labels */}
                <line x1="300" y1="80" x2="300" y2="40" stroke="#4169E1" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="520" y1="450" x2="560" y2="480" stroke="#4169E1" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="80" y1="450" x2="40" y2="480" stroke="#4169E1" strokeWidth="2" strokeDasharray="5,5" />

                {/* Corner labels */}
                <text x="300" y="30" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="12">
                  MATH
                </text>
                <text x="560" y="500" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="12">
                  ENG
                </text>
                <text x="40" y="500" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="12">
                  STATS
                </text>

                {/* Center label */}
                <text x="300" y="255" textAnchor="middle" fill="white" fontFamily="Press Start 2P" fontSize="10">
                  AI/ML
                </text>

                {/* Intersection labels with arrows */}
                {/* Math-Eng */}
                <line x1="240" y1="160" x2="240" y2="120" stroke="#4169E1" strokeWidth="1.5" />
                <text x="240" y="110" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">
                  ALGORITHMS
                </text>

                {/* Math-Stats */}
                <line x1="360" y1="160" x2="360" y2="120" stroke="#4169E1" strokeWidth="1.5" />
                <text x="360" y="110" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">
                  THEORY
                </text>

                {/* Eng-Stats */}
                <line x1="300" y1="380" x2="300" y2="420" stroke="#4169E1" strokeWidth="1.5" />
                <text x="300" y="435" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">
                  SYSTEMS
                </text>

                {/* File notation in corner */}
                <text x="20" y="30" fill="#999" fontFamily="Press Start 2P" fontSize="7">
                  PIC_001
                </text>
                <text x="560" y="30" textAnchor="end" fill="#999" fontFamily="Press Start 2P" fontSize="7">
                  [ CS_MAP ]
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
                PICTURE 1: CS TRIANGLE
              </span>
            </div>
          </div>

          {/* Text explanation */}
          <div className="space-y-8">
            <div>
              <div 
                className="mb-3"
                style={{ 
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.75rem',
                  color: '#4169E1',
                  letterSpacing: '0.1em'
                }}
              >
                MATHEMATICS
              </div>
              <p 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  color: '#333'
                }}
              >
                Theory, algorithms, complexity. Discrete structures, formal proofs, 
                cryptography. What is computable and how expensive is it?
              </p>
            </div>

            <div>
              <div 
                className="mb-3"
                style={{ 
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.75rem',
                  color: '#4169E1',
                  letterSpacing: '0.1em'
                }}
              >
                ENGINEERING
              </div>
              <p 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  color: '#333'
                }}
              >
                Systems, hardware, infrastructure. Operating systems, compilers, 
                distributed systems. Building computation under real constraints.
              </p>
            </div>

            <div>
              <div 
                className="mb-3"
                style={{ 
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.75rem',
                  color: '#4169E1',
                  letterSpacing: '0.1em'
                }}
              >
                STATISTICS
              </div>
              <p 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  color: '#333'
                }}
              >
                Learning from data, uncertainty, inference. Machine learning, 
                probabilistic models. Generalizing from limited, noisy observations.
              </p>
            </div>

            <div className="border-2 border-blue-500 bg-blue-50 p-4 mt-8">
              <p 
                style={{ 
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.65rem',
                  lineHeight: '1.8',
                  color: '#4169E1'
                }}
              >
                MOST CS SUBFIELDS LIVE AT THE INTERSECTION OF ALL THREE
              </p>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-16 border-t-2 border-dotted border-gray-300 pt-8">
          <p 
            style={{ 
              fontFamily: 'Georgia, serif',
              fontSize: '0.95rem',
              lineHeight: '1.7',
              color: '#666',
              fontStyle: 'italic'
            }}
          >
            Computer Science lives at the intersection of rigorous theory, practical engineering, 
            and statistical reasoning. Different problems emphasize different corners of this 
            triangle, but the most interesting work happens where all three meet.
          </p>
        </div>
      </div>
    </div>
  );
}
