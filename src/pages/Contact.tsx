export function Contact() {
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
          GET IN TOUCH
        </h1>
        
        <div className="border-t-2 border-dotted border-gray-300 mt-4 mb-12" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div>
              <p 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.125rem',
                  lineHeight: '1.8',
                  color: '#333',
                  marginBottom: '1.5rem'
                }}
              >
                I'm always interested in discussing research opportunities, collaborative 
                projects, or ideas at the intersection of mathematics, computer science, 
                and engineering.
              </p>
              
              <p 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.125rem',
                  lineHeight: '1.8',
                  color: '#333'
                }}
              >
                Whether you're exploring deep learning architectures, accelerated 
                hardware systems, or just want to discuss the mathematical foundations 
                behind modern computing, I'd love to connect.
              </p>
            </div>

            <div className="border-2 border-blue-500 bg-blue-50 p-6">
              <div 
                style={{ 
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.75rem',
                  color: '#4169E1',
                  letterSpacing: '0.1em',
                  marginBottom: '0.75rem'
                }}
              >
                RESPONSE TIME
              </div>
              <p 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  color: '#333'
                }}
              >
                I typically respond to messages within 24-48 hours. For urgent matters, 
                please mention it in your subject line.
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
                CONTACT METHODS
              </div>
              <div className="space-y-4">
                <div className="border-l-2 border-gray-200 hover:border-blue-500 pl-4 transition-colors">
                  <div 
                    style={{ 
                      fontFamily: 'Georgia, serif',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '0.25rem'
                    }}
                  >
                    Email
                  </div>
                  <a 
                    href="mailto:thomastkf02@gmail.com" 
                    style={{ 
                      fontFamily: 'Georgia, serif',
                      fontSize: '0.95rem',
                      color: '#4169E1',
                      textDecoration: 'none'
                    }}
                    onMouseOver={(e) => e.target.style.color = '#3A5FCD'}
                    onMouseOut={(e) => e.target.style.color = '#4169E1'}
                  >
                    thomastkf02@gmail.com
                  </a>
                </div>
                <div className="border-l-2 border-gray-200 hover:border-blue-500 pl-4 transition-colors">
                  <div 
                    style={{ 
                      fontFamily: 'Georgia, serif',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '0.25rem'
                    }}
                  >
                    GitHub
                  </div>
                  <a 
                    href="https://github.com/ThomasKidane" 
                    style={{ 
                      fontFamily: 'Georgia, serif',
                      fontSize: '0.95rem',
                      color: '#4169E1',
                      textDecoration: 'none'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseOver={(e) => e.target.style.color = '#3A5FCD'}
                    onMouseOut={(e) => e.target.style.color = '#4169E1'}
                  >
                    github.com/ThomasKidane
                  </a>
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
                AREAS OF INTEREST
              </div>
              <div className="space-y-3">
                <div className="border-l-2 border-blue-500 pl-4">
                  <div 
                    style={{ 
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: '0.6rem',
                      color: '#4169E1',
                      letterSpacing: '0.05em',
                      marginBottom: '0.25rem'
                    }}
                  >
                    PRIMARY FOCUS
                  </div>
                  <div 
                    style={{ 
                      fontFamily: 'Georgia, serif',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      color: '#333'
                    }}
                  >
                    • Deep Learning<br/>
                    • Accelerated Hardware
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
                    RELATED INTERESTS
                  </div>
                  <div 
                    style={{ 
                      fontFamily: 'Georgia, serif',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      color: '#333'
                    }}
                  >
                    • Mathematical foundations of ML<br/>
                    • Systems optimization<br/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
