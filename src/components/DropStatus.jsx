import { motion } from 'framer-motion'

export default function DropStatus({ used = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.5 }}
      style={{
        padding: '16px 18px',
        background: 'var(--bg-card)',
        borderRadius: 14,
        border: '0.5px solid var(--glass-border)',
        marginBottom: 28,
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 10,
      }}>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.78rem',
          color: 'var(--text-primary)',
          fontWeight: 400,
        }}>
          today's drop
        </span>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.65rem',
          fontWeight: 500,
          letterSpacing: '0.06em',
          color: used ? 'var(--accent-rose)' : 'var(--accent-gold)',
          textTransform: 'uppercase',
        }}>
          {used ? 'used today' : 'available'}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 4, borderRadius: 2,
        background: 'rgba(240,235,225,0.05)',
        overflow: 'hidden',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: used ? '100%' : '0%' }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            height: '100%', borderRadius: 2,
            background: used
              ? 'linear-gradient(90deg, var(--accent-rose), rgba(196,122,122,0.5))'
              : 'var(--accent-gold)',
          }}
        />
      </div>
    </motion.div>
  )
}
