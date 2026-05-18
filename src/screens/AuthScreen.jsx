import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Store token
      localStorage.setItem('drift-token', data.data.session.access_token)
      localStorage.setItem('drift-user', JSON.stringify(data.data.user))
      
      onLogin(data.data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 24px',
        background: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background aesthetics */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(200, 169, 110, 0.05) 0%, transparent 60%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '400px', margin: '0 auto', width: '100%' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2.5rem',
          fontWeight: 400,
          color: 'var(--text-primary)',
          textAlign: 'center',
          letterSpacing: '0.15em',
          marginBottom: '8px'
        }}>
          Drift
        </h1>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          marginBottom: '40px',
          fontStyle: 'italic'
        }}>
          Discover through people, not algorithms.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => alert("Google login requires Google Cloud setup. Use 'Explore without login' for now!")}
            style={{
              width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              cursor: 'pointer', transition: 'all 0.3s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          
          <button
            type="button"
            onClick={() => alert("Apple login requires Apple Developer account. Use 'Explore without login' for now!")}
            style={{
              width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              cursor: 'pointer', transition: 'all 0.3s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.92 3.78 2.12-3.21 1.96-2.66 6.32.53 7.65-.7 1.76-1.55 3.47-2.96 4.24zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '14px 16px', background: 'rgba(240,235,225,0.03)',
                border: '1px solid rgba(240,235,225,0.1)', borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '1rem',
                outline: 'none', transition: 'border-color 0.3s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'}
              onBlur={e => e.target.style.borderColor = 'rgba(240,235,225,0.1)'}
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: '100%', padding: '14px 16px', background: 'rgba(240,235,225,0.03)',
              border: '1px solid rgba(240,235,225,0.1)', borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '1rem',
              outline: 'none', transition: 'border-color 0.3s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'}
            onBlur={e => e.target.style.borderColor = 'rgba(240,235,225,0.1)'}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: '100%', padding: '14px 16px', background: 'rgba(240,235,225,0.03)',
              border: '1px solid rgba(240,235,225,0.1)', borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '1rem',
              outline: 'none', transition: 'border-color 0.3s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'}
            onBlur={e => e.target.style.borderColor = 'rgba(240,235,225,0.1)'}
          />

          {error && (
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ color: '#d97757', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            style={{
              width: '100%', padding: '16px', marginTop: '8px',
              background: 'var(--accent-gold)', border: 'none', borderRadius: 'var(--radius-md)',
              color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)', fontSize: '1rem',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
              textDecoration: 'underline', textUnderlineOffset: '4px'
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        {/* Guest / Dev Bypass */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={() => {
              // Mock user for bypass
              onLogin({
                id: 'guest',
                username: 'guest_user',
                email: 'guest@drift.app',
              })
            }}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            Explore without login
          </button>
        </div>
      </div>
    </motion.div>
  )
}
