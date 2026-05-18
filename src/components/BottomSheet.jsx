import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function BottomSheet({ open, onClose, title, children }) {
  const sheetRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              background: 'rgba(0,0,0,0.45)',
            }}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              zIndex: 9001,
              background: 'var(--bg-card)',
              borderRadius: '20px 20px 0 0',
              border: '0.5px solid var(--glass-border)',
              borderBottom: 'none',
              padding: '16px 20px 40px',
              maxHeight: '75vh',
              overflowY: 'auto',
            }}
          >
            {/* Handle */}
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: 'rgba(240,235,225,0.1)',
              margin: '0 auto 18px',
            }} />

            {/* Title */}
            {title && (
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.1rem',
                fontWeight: 400,
                color: 'var(--text-primary)',
                marginBottom: 18,
                textAlign: 'center',
              }}>
                {title}
              </h3>
            )}

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
