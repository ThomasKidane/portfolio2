export function NewspaperSection() {
  return (
    <div className="border-t-2 border-dotted border-gray-300 px-12 py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Illustration on the left */}
          <div className="lg:col-span-1">
            <div className="border-4 border-blue-500 bg-white p-6">
              <svg viewBox="0 0 300 400" className="w-full h-auto">
                {/* Grid background */}
                <defs>
                  <pattern id="newspaper-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#F0F0F0" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="300" height="400" fill="url(#newspaper-grid)" />

                {/* Three overlapping circles - Venn diagram style */}
                <circle cx="150" cy="120" r="70" fill="none" stroke="#4169E1" strokeWidth="3" />
                <circle cx="110" cy="190" r="70" fill="none" stroke="#E14169" strokeWidth="3" />
                <circle cx="190" cy="190" r="70" fill="none" stroke="#69E141" strokeWidth="3" />
                
                {/* Center highlight */}
                <circle cx="150" cy="165" r="25" fill="#4169E1" opacity="0.3" />

                {/* Labels */}
                <text x="150" y="60" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="10">
                  M
                </text>
                <text x="60" y="220" textAnchor="middle" fill="#E14169" fontFamily="Press Start 2P" fontSize="10">
                  E
                </text>
                <text x="240" y="220" textAnchor="middle" fill="#69E141" fontFamily="Press Start 2P" fontSize="10">
                  S
                </text>

                {/* Intersection markers */}
                <circle cx="130" cy="150" r="3" fill="#4169E1" />
                <circle cx="170" cy="150" r="3" fill="#4169E1" />
                <circle cx="150" cy="205" r="3" fill="#4169E1" />

                {/* Border label */}
                <text x="150" y="30" textAnchor="middle" fill="#999" fontFamily="Press Start 2P" fontSize="7">
                  [ VENN_DIAGRAM ]
                </text>
                
                {/* Legend at bottom */}
                <text x="20" y="350" fill="#666" fontFamily="Press Start 2P" fontSize="6">
                  M = MATHEMATICS
                </text>
                <text x="20" y="370" fill="#666" fontFamily="Press Start 2P" fontSize="6">
                  E = ENGINEERING
                </text>
                <text x="20" y="390" fill="#666" fontFamily="Press Start 2P" fontSize="6">
                  S = STATISTICS
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
                PIC_002: FIELD OVERLAP
              </span>
            </div>
          </div>

          {/* Large newspaper-style text */}
          <div className="lg:col-span-2">
            <h3 
              style={{ 
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '1.25rem',
                color: '#4169E1',
                letterSpacing: '0.1em',
                lineHeight: '1.6',
                marginBottom: '2rem'
              }}
            >
              RETHINKING COMPUTER SCIENCE
            </h3>
            
            <div className="space-y-6">
              <p 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.125rem',
                  lineHeight: '1.9',
                  color: '#1a1a1a',
                  textAlign: 'justify'
                }}
              >
                <span style={{ fontSize: '3rem', float: 'left', lineHeight: '0.8', marginRight: '0.5rem', marginTop: '0.3rem', color: '#4169E1', fontFamily: 'Georgia, serif' }}>C</span>
                omputer Science is often misunderstood as a purely technical discipline, confined to the realm of coding and software development. 
                However, a more nuanced view reveals CS as living at the intersection of three fundamental pillars: engineering, mathematics, and statistics. 
                This mental model provides a powerful framework for understanding the diverse landscape of modern computing. 
                Engineering brings the practical constraints of building systems that work reliably at scale—from operating systems managing billions of processes 
                to distributed networks spanning continents. Mathematics provides the theoretical foundation, asking fundamental questions about computability, 
                complexity, and correctness. What problems can be solved? How efficiently? Can we prove our systems behave as intended? Statistics enters the picture 
                when dealing with uncertainty and learning from data, enabling machines to generalize patterns from noisy observations. Most importantly, the most 
                exciting work in CS doesn't live cleanly in any single corner. Modern deep learning, for instance, requires mathematical understanding of optimization 
                landscapes, statistical reasoning about generalization, and engineering prowess to train models on specialized hardware. This tripartite view helps 
                students and practitioners navigate their learning journey deliberately, identifying which corners of the triangle they're strengthening and which 
                they need to explore further. Rather than viewing CS as a monolithic field or a grab bag of unrelated topics, we can see it as a rich, interconnected 
                space where theory meets practice meets empirical learning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
