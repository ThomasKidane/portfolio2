export function Projects() {
  return (
    <div className="min-h-screen bg-white p-12">
      <div className="max-w-4xl mx-auto">
        <h1 
          style={{ 
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '1.5rem',
            color: '#4169E1',
            letterSpacing: '0.1em',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}
        >
          PROJECTS & WORK
        </h1>
        
        <div className="border-t-2 border-dotted border-gray-300 mt-4 mb-12" />
        
        <div className="text-center py-16">
          {/* Construction Figure */}
          <div className="border-4 border-blue-500 bg-white p-8 mb-8 inline-block">
            <svg viewBox="0 0 350 250" className="w-80 h-auto">
              <defs>
                <pattern id="projects-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#F0F0F0" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="350" height="250" fill="url(#projects-grid)" />
              
              {/* Blueprint/wireframe style project boxes */}
              <rect x="50" y="80" width="80" height="60" fill="none" stroke="#4169E1" strokeWidth="2" strokeDasharray="5,5" />
              <rect x="150" y="60" width="80" height="80" fill="none" stroke="#4169E1" strokeWidth="2" strokeDasharray="5,5" />
              <rect x="250" y="90" width="80" height="50" fill="none" stroke="#4169E1" strokeWidth="2" strokeDasharray="5,5" />
              
              {/* Connection lines */}
              <line x1="90" y1="140" x2="190" y2="140" stroke="#666" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="190" y1="140" x2="290" y2="140" stroke="#666" strokeWidth="1" strokeDasharray="3,3" />
              
              {/* Project placeholders */}
              <text x="90" y="95" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="6">
                PROJECT
              </text>
              <text x="90" y="108" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="6">
                ALPHA
              </text>
              <circle cx="90" cy="125" r="8" fill="none" stroke="#4169E1" strokeWidth="2" />
              <text x="90" y="129" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">
                ?
              </text>
              
              <text x="190" y="85" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="6">
                PROJECT
              </text>
              <text x="190" y="98" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="6">
                BETA
              </text>
              <circle cx="190" cy="120" r="8" fill="none" stroke="#4169E1" strokeWidth="2" />
              <text x="190" y="124" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">
                ?
              </text>
              
              <text x="290" y="105" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="6">
                PROJECT
              </text>
              <text x="290" y="118" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="6">
                GAMMA
              </text>
              <circle cx="290" cy="130" r="8" fill="none" stroke="#4169E1" strokeWidth="2" />
              <text x="290" y="134" textAnchor="middle" fill="#4169E1" fontFamily="Press Start 2P" fontSize="8">
                ?
              </text>
              
              {/* Construction elements */}
              <polygon points="175,180 155,220 195,220" fill="#FF6B00" stroke="#E85D00" strokeWidth="2" />
              <rect x="165" y="190" width="20" height="6" fill="white" />
              <rect x="160" y="200" width="30" height="6" fill="white" />
              
              {/* Tools scattered around */}
              <rect x="80" y="170" width="25" height="15" fill="none" stroke="#666" strokeWidth="2" />
              <line x1="85" y1="175" x2="100" y2="180" stroke="#666" strokeWidth="2" />
              
              <circle cx="280" cy="180" r="12" fill="none" stroke="#666" strokeWidth="2" />
              <line x1="280" y1="168" x2="280" y2="192" stroke="#666" strokeWidth="2" />
              <line x1="268" y1="180" x2="292" y2="180" stroke="#666" strokeWidth="2" />
              
              {/* Border label */}
              <text x="20" y="30" fill="#999" fontFamily="Press Start 2P" fontSize="7">
                PIC_PROJ
              </text>
              <text x="320" y="30" textAnchor="end" fill="#999" fontFamily="Press Start 2P" fontSize="7">
                [ WIP ]
              </text>
            </svg>
          </div>
          
          <div 
            style={{ 
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '1rem',
              color: '#4169E1',
              letterSpacing: '0.1em',
              marginBottom: '1rem'
            }}
          >
            UNDER CONSTRUCTION
          </div>
          
          <p 
            style={{ 
              fontFamily: 'Georgia, serif',
              fontSize: '1.125rem',
              lineHeight: '1.8',
              color: '#333',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}
          >
            I'm currently organizing and documenting my projects that span the 
            intersections of mathematics, engineering, and statistics. This will 
            include interactive demonstrations, technical deep-dives, and the 
            stories behind each implementation.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="border-2 border-blue-500 bg-blue-50 p-4">
              <div 
                style={{ 
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.6rem',
                  color: '#4169E1',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem'
                }}
              >
                MATH ∩ ENG
              </div>
              <p 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  color: '#333'
                }}
              >
                Numerical algorithms, optimization tools, computational geometry
              </p>
            </div>
            
            <div className="border-2 border-blue-500 bg-blue-50 p-4">
              <div 
                style={{ 
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.6rem',
                  color: '#4169E1',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem'
                }}
              >
                MATH ∩ STATS
              </div>
              <p 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  color: '#333'
                }}
              >
                Learning theory implementations, probabilistic models, information theory tools
              </p>
            </div>
            
            <div className="border-2 border-blue-500 bg-blue-50 p-4">
              <div 
                style={{ 
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.6rem',
                  color: '#4169E1',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem'
                }}
              >
                ENG ∩ STATS
              </div>
              <p 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  color: '#333'
                }}
              >
                ML infrastructure, distributed systems, data processing pipelines
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
