import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SplashScreen({ onComplete }) {
  const [showTagline, setShowTagline] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const taglineTimer = setTimeout(() => setShowTagline(true), 800)
    const exitTimer = setTimeout(() => setExiting(true), 2200)
    const completeTimer = setTimeout(() => onComplete(), 2800)
    return () => {
      clearTimeout(taglineTimer)
      clearTimeout(exitTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
          }}
        >
          {/* Subtle radial glow */}
          <div style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,169,110,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Logo */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              fontWeight: 400,
              letterSpacing: '0.3em',
              color: 'var(--text-primary)',
              marginRight: '-0.3em', // compensate letter-spacing
            }}
          >
            Drift
          </motion.h1>

          {/* Tagline */}
          <AnimatePresence>
            {showTagline && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.5, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  marginTop: '20px',
                  letterSpacing: '0.06em',
                  fontWeight: 300,
                }}
              >
                Discover through people, not algorithms.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
