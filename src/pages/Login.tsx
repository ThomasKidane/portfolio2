import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function Login() {
  const { signInWithEmail, signUpWithEmail, signInWithOAuth, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || '/'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  if (user) {
    navigate(from, { replace: true })
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const fn = mode === 'signin' ? signInWithEmail : signUpWithEmail
    const { error } = await fn(email, password)

    if (error) {
      setError(error.message)
    } else if (mode === 'signup') {
      setMessage('Check your email to confirm your account.')
    } else {
      navigate(from, { replace: true })
    }
    setLoading(false)
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setError('')
    const { error } = await signInWithOAuth(provider)
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="text-sm text-gray-400 hover:text-blue-600 transition-colors mb-8 inline-block"
          style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.6rem' }}
        >
          &larr; BACK
        </Link>

        <h1
          className="mb-2"
          style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1.2rem', color: '#4169E1' }}
        >
          {mode === 'signin' ? 'SIGN IN' : 'SIGN UP'}
        </h1>
        <p className="text-gray-500 mb-8" style={{ fontFamily: 'Georgia, serif' }}>
          {mode === 'signin' ? 'Welcome back.' : 'Create your account.'}
        </p>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-dotted border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50/30 transition-all"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-dotted border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-xs text-gray-400" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem' }}>
              OR
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-dotted border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-dotted border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border-2 border-dotted border-red-200 rounded-lg">
              <p className="text-sm text-red-600" style={{ fontFamily: 'Georgia, serif' }}>{error}</p>
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 border-2 border-dotted border-green-200 rounded-lg">
              <p className="text-sm text-green-600" style={{ fontFamily: 'Georgia, serif' }}>{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors"
            style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.6rem' }}
          >
            {loading ? 'LOADING...' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => { setMode('signup'); setError(''); setMessage('') }} className="text-blue-600 hover:underline">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => { setMode('signin'); setError(''); setMessage('') }} className="text-blue-600 hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
