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
      </div>
    </motion.div>
  )
}
