import { Link } from 'react-router-dom'

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
        
        {/* Featured Post */}
        <div className="mb-12">
          <h2 
            style={{ 
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '0.875rem',
              color: '#4169E1',
              letterSpacing: '0.1em',
              marginBottom: '1.5rem'
            }}
          >
            FEATURED POST
          </h2>
          
          <Link to="/blog/runahead-execution" className="block group">
            <article className="border-2 border-blue-500 bg-white p-8 hover:bg-blue-50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h3 
                  style={{ 
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    lineHeight: '1.3'
                  }}
                >
                  Runahead Execution: Turning Memory Stalls into Computational Opportunities
                </h3>
                <span 
                  style={{ 
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.75rem',
                    color: '#666',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Dec 2025
                </span>
              </div>
              
              <p 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  color: '#333',
                  marginBottom: '1rem'
                }}
              >
                A deep dive into implementing runahead execution in gem5, exploring how modern processors can 
                turn idle memory stalls into opportunities for speculative prefetching. This technique sits 
                at the fascinating intersection of computer architecture, optimization theory, and predictive systems.
              </p>
              
              <div className="flex items-center gap-4">
                <span 
                  style={{ 
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.75rem',
                    color: '#4169E1'
                  }}
                >
                  Read more →
                </span>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-xs font-mono text-blue-700 rounded">
                    Architecture
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-xs font-mono text-blue-700 rounded">
                    Performance
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-xs font-mono text-blue-700 rounded">
                    gem5
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </div>
        
        {/* Coming Soon Section */}
        <div className="border-t-2 border-dotted border-gray-300 pt-12">
          <h2 
            style={{ 
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '0.875rem',
              color: '#999',
              letterSpacing: '0.1em',
              marginBottom: '1.5rem'
            }}
          >
            MORE COMING SOON
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-300 border-dashed p-6 opacity-50">
              <h3 className="font-mono text-sm text-gray-600 mb-2">
                The Mathematics of Machine Learning
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                Exploring the theoretical foundations...
              </p>
            </div>
            
            <div className="border border-gray-300 border-dashed p-6 opacity-50">
              <h3 className="font-mono text-sm text-gray-600 mb-2">
                Building Intuitive Interfaces
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                Design principles for technical tools...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
