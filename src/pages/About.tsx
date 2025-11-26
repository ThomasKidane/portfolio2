export function About() {
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
          ABOUT ME
        </h1>
        
        <div className="border-t-2 border-dotted border-gray-300 mt-4 mb-12" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            <p 
              style={{ 
                fontFamily: 'Georgia, serif',
                fontSize: '1.125rem',
                lineHeight: '1.8',
                color: '#333'
              }}
            >
              I'm a sophomore at Duke University pursuing double majors in Mathematics 
              and Computer Science. I'm fascinated by the intersections between theoretical 
              mathematics, practical engineering, and statistical learning.
            </p>
            
            <p 
              style={{ 
                fontFamily: 'Georgia, serif',
                fontSize: '1.125rem',
                lineHeight: '1.8',
                color: '#333'
              }}
            >
              My academic journey explores how mathematical rigor can inform computational 
              thinking, and how engineering constraints shape both mathematical and 
              statistical approaches to problem-solving.
            </p>

            <p 
              style={{ 
                fontFamily: 'Georgia, serif',
                fontSize: '1.125rem',
                lineHeight: '1.8',
                color: '#333'
              }}
            >
              When I'm not studying, I enjoy working on projects that bridge the gap 
              between abstract mathematical concepts and their concrete implementations 
              in software and systems.
            </p>

            <div className="border-2 border-blue-500 bg-blue-50 p-6">
              <div 
                style={{ 
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.75rem',
                  color: '#4169E1',
                  letterSpacing: '0.1em',
                  marginBottom: '0.5rem'
                }}
              >
                CURRENT FOCUS
              </div>
              <p 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  color: '#333'
                }}
              >
                Exploring how deep learning architectures emerge from the intersection 
                of mathematical optimization, statistical learning theory, and 
                engineering systems design.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div 
                style={{ 
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.75rem',
                  color: '#4169E1',
                  letterSpacing: '0.1em',
                  marginBottom: '1rem'
                }}
              >
                EDUCATION
              </div>
              <div className="border-l-2 border-blue-500 pl-4">
                <div 
                  style={{ 
                    fontFamily: 'Georgia, serif',
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#333',
                    marginBottom: '0.25rem'
                  }}
                >
                  Duke University
                </div>
                <div 
                  style={{ 
                    fontFamily: 'Georgia, serif',
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: '0.5rem'
                  }}
                >
                  Double Major: Mathematics & Computer Science
                </div>
                <div 
                  style={{ 
                    fontFamily: 'Georgia, serif',
                    fontSize: '0.9rem',
                    color: '#666'
                  }}
                >
                  Sophomore • Class of 2027
                </div>
              </div>
            </div>

            <div>
              <div 
                style={{ 
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.75rem',
                  color: '#4169E1',
                  letterSpacing: '0.1em',
                  marginBottom: '1rem'
                }}
              >
                CURRENT COURSEWORK
              </div>
              <div className="space-y-3">
                <div className="border-l-2 border-gray-200 pl-4">
                  <div 
                    style={{ 
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: '0.6rem',
                      color: '#4169E1',
                      letterSpacing: '0.05em',
                      marginBottom: '0.25rem'
                    }}
                  >
                    MATH ∩ STATS
                  </div>
                  <div 
                    style={{ 
                      fontFamily: 'Georgia, serif',
                      fontSize: '0.95rem',
                      color: '#333'
                    }}
                  >
                    Deep Learning • Machine Learning
                  </div>
                </div>
                
                <div className="border-l-2 border-gray-200 pl-4">
                  <div 
                    style={{ 
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: '0.6rem',
                      color: '#4169E1',
                      letterSpacing: '0.05em',
                      marginBottom: '0.25rem'
                    }}
                  >
                    ENG ∩ MATH
                  </div>
                  <div 
                    style={{ 
                      fontFamily: 'Georgia, serif',
                      fontSize: '0.95rem',
                      color: '#333'
                    }}
                  >
                    Advanced Computer Architecture
                  </div>
                </div>
                
                <div className="border-l-2 border-gray-200 pl-4">
                  <div 
                    style={{ 
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: '0.6rem',
                      color: '#4169E1',
                      letterSpacing: '0.05em',
                      marginBottom: '0.25rem'
                    }}
                  >
                    ENG ∩ STATS
                  </div>
                  <div 
                    style={{ 
                      fontFamily: 'Georgia, serif',
                      fontSize: '0.95rem',
                      color: '#333'
                    }}
                  >
                    Operating Systems
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div 
                style={{ 
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.75rem',
                  color: '#4169E1',
                  letterSpacing: '0.1em',
                  marginBottom: '1rem'
                }}
              >
                INTERESTS
              </div>
              <div 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: '#333'
                }}
              >
                <div>• Mathematical foundations of machine learning</div>
                <div>• Systems architecture for computational mathematics</div>
                <div>• Algorithm design and complexity analysis</div>
                <div>• Intersection of theory and practice in CS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
