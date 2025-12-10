import { Link } from 'react-router-dom'

export function WhatsNewSection() {
  const updates = [
    {
      date: 'Dec 2025',
      type: 'BLOG POST',
      title: 'Runahead Execution',
      description: 'Deep dive into implementing speculative prefetching in gem5 O3CPU',
      link: '/blog/runahead-execution',
      highlight: true
    },
    {
      date: 'Nov 2025',
      type: 'PROJECT',
      title: 'Matrix Perturbation Analysis',
      description: 'Interactive visualization tool for understanding numerical stability',
      link: '/projects',
      highlight: false
    },
    {
      date: 'Oct 2025',
      type: 'RESEARCH',
      title: 'Computer Architecture',
      description: 'Working on memory hierarchy optimizations and cache coherence protocols',
      link: '/projects',
      highlight: false
    },
    {
      date: 'Aug 2025',
      type: 'ESSAY',
      title: 'The Intersections',
      description: 'A framework for understanding where Engineering, Mathematics, and Statistics converge',
      link: '/blog/the-intersections',
      highlight: false
    }
  ]

  return (
    <div className="px-12 py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <h2 
            style={{ 
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '1.5rem',
              color: '#4169E1',
              letterSpacing: '0.1em',
              lineHeight: '1.6',
              marginBottom: '0.5rem'
            }}
          >
            WHAT'S NEW
          </h2>
          <p 
            style={{ 
              fontFamily: 'Georgia, serif',
              fontSize: '1.1rem',
              color: '#666',
              lineHeight: '1.6'
            }}
          >
            Recent projects, writings, and explorations
          </p>
          <div className="border-t-2 border-dotted border-gray-300 mt-4" />
        </div>

        {/* Updates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {updates.map((update, index) => (
            <Link 
              key={index}
              to={update.link}
              className="block group"
            >
              <div 
                className={`
                  border-2 p-6 transition-all duration-200
                  ${update.highlight 
                    ? 'border-blue-500 bg-white hover:bg-blue-50 hover:border-blue-600' 
                    : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
                  }
                `}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span 
                      style={{ 
                        fontFamily: '"Space Mono", monospace',
                        fontSize: '0.7rem',
                        color: update.highlight ? '#4169E1' : '#999',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {update.type}
                    </span>
                    {update.highlight && (
                      <span 
                        className="px-2 py-1 bg-blue-500 text-white"
                        style={{ 
                          fontFamily: '"Press Start 2P", monospace',
                          fontSize: '0.4rem',
                          letterSpacing: '0.05em'
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                  <span 
                    style={{ 
                      fontFamily: '"Space Mono", monospace',
                      fontSize: '0.7rem',
                      color: '#666',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {update.date}
                  </span>
                </div>

                {/* Title */}
                <h3 
                  style={{ 
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '0.9rem',
                    color: '#000',
                    letterSpacing: '0.05em',
                    lineHeight: '1.4',
                    marginBottom: '0.75rem'
                  }}
                  className="group-hover:text-blue-600 transition-colors"
                >
                  {update.title}
                </h3>

                {/* Description */}
                <p 
                  style={{ 
                    fontFamily: 'Georgia, serif',
                    fontSize: '0.95rem',
                    color: '#666',
                    lineHeight: '1.6'
                  }}
                >
                  {update.description}
                </p>

                {/* Arrow */}
                <div className="mt-4 flex items-center gap-2">
                  <span 
                    style={{ 
                      fontFamily: '"Space Mono", monospace',
                      fontSize: '0.75rem',
                      color: update.highlight ? '#4169E1' : '#999'
                    }}
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Links */}
        <div className="mt-12 flex justify-center gap-8">
          <Link 
            to="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            style={{ 
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.9rem',
              letterSpacing: '0.05em'
            }}
          >
            <span>All Posts</span>
            <span>→</span>
          </Link>
          <Link 
            to="/projects"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            style={{ 
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.9rem',
              letterSpacing: '0.05em'
            }}
          >
            <span>All Projects</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
