export function Hero() {
  return (
    <div className="border-b-2 border-dotted border-blue-500 pb-12 pt-16 px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 
            style={{ 
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '3rem',
              color: '#4169E1',
              letterSpacing: '0.1em',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}
          >
            THOMAS KIDANE
          </h1>
          <div 
            style={{ 
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '1rem',
              color: '#666',
              letterSpacing: '0.05em',
              lineHeight: '1.8'
            }}
          >
            MATH & CS @ DUKE
          </div>
        </div>
        
        <div className="mt-8">
          <p 
            style={{ 
              fontFamily: 'Georgia, serif',
              fontSize: '1.125rem',
              lineHeight: '1.8',
              color: '#333',
              maxWidth: '600px'
            }}
          >
            Building at the intersection of engineering, mathematics, and statistics. 
            I create tools and systems that are both theoretically sound and practically useful.
          </p>
        </div>
      </div>
    </div>
  );
}