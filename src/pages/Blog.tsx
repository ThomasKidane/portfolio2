export function Blog() {
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
          THOUGHTS & WRITINGS
        </h1>
        
        <div className="border-t-2 border-dotted border-gray-300 mt-4 mb-12" />
        
        <div className="text-center py-16">
          {/* Construction Figure */}
          <div className="border-4 border-blue-500 bg-white p-8 mb-8 inline-block">
            <svg viewBox="0 0 300 200" className="w-64 h-auto">
              <defs>
                <pattern id="construction-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#F0F0F0" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="300" height="200" fill="url(#construction-grid)" />
              
              {/* Construction barriers */}
              <rect x="50" y="140" width="200" height="15" fill="#FFB800" stroke="#E69500" strokeWidth="2" />
              <rect x="50" y="155" width="200" height="15" fill="#FFB800" stroke="#E69500" strokeWidth="2" />
              
              {/* Warning stripes */}
              {[...Array(8)].map((_, i) => (
                <rect key={i} x={50 + i * 25} y={140} width={12} height={30} fill="#E69500" />
              ))}
              
              {/* Construction cone */}
              <polygon points="150,60 130,140 170,140" fill="#FF6B00" stroke="#E85D00" strokeWidth="2" />
              <rect x="140" y="70" width="20" height="8" fill="white" />
              <rect x="135" y="85" width="30" height="8" fill="white" />
              <rect x="130" y="100" width="40" height="8" fill="white" />
              
              {/* Tools */}
              <circle cx="80" cy="100" r="15" fill="none" stroke="#4169E1" strokeWidth="3" />
              <line x1="80" y1="85" x2="80" y2="115" stroke="#4169E1" strokeWidth="3" />
              <line x1="65" y1="100" x2="95" y2="100" stroke="#4169E1" strokeWidth="3" />
              
              <rect x="210" y="90" width="30" height="40" fill="none" stroke="#4169E1" strokeWidth="3" />
              <line x1="215" y1="95" x2="235" y2="125" stroke="#4169E1" strokeWidth="2" />
              <line x1="235" y1="95" x2="215" y2="125" stroke="#4169E1" strokeWidth="2" />
              
              {/* Border label */}
              <text x="20" y="30" fill="#999" fontFamily="Press Start 2P" fontSize="7">
                PIC_BLOG
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
              margin: '0 auto'
            }}
          >
            This section is currently being developed. I'm working on curating 
            thoughtful pieces about the intersections of mathematics, computer science, 
            and engineering. Check back soon for insights on algorithmic thinking, 
            mathematical beauty in code, and the art of problem-solving.
          </p>
          
          <div className="border-2 border-blue-500 bg-blue-50 p-6 mt-8 inline-block">
            <div 
              style={{ 
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '0.6rem',
                color: '#4169E1',
                letterSpacing: '0.05em'
              }}
            >
              COMING SOON: TECHNICAL WRITING & RESEARCH INSIGHTS
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
