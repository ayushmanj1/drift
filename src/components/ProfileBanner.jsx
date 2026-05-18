import { motion } from 'framer-motion'

export default function ProfileBanner({ username, tasteIdentity, onEditProfile, photo }) {
  const initial = (username || 'D')[0].toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '20px 18px',
        background: 'var(--bg-card)',
        borderRadius: 16,
        border: '0.5px solid var(--glass-border)',
        marginBottom: 28,
      }}
    >
      {/* Avatar ring — conic gradient border */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
        background: 'conic-gradient(from 0deg, rgba(200,169,110,0.7), rgba(196,122,122,0.5), rgba(100,120,180,0.4), rgba(200,169,110,0.7))',
        padding: 2.5,
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: photo ? `url(${photo}) center/cover` : 'var(--bg-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-heading)',
          fontSize: '1.15rem',
          color: 'var(--text-primary)',
          overflow: 'hidden',
        }}>
          {!photo && initial}
        </div>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          color: 'var(--text-primary)',
          fontWeight: 500,
          marginBottom: 3,
        }}>
          @{username || 'drift.user'}
        </p>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontStyle: 'italic',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          lineHeight: 1.4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {tasteIdentity || 'No taste identity yet'}
        </p>
      </div>

      {/* Edit button */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={onEditProfile}
        style={{
          background: 'none',
          border: '1px solid rgba(200,169,110,0.25)',
          borderRadius: 999,
          padding: '7px 15px',
          color: 'var(--accent-gold)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.65rem',
          letterSpacing: '0.04em',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.25s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(200,169,110,0.08)'
          e.currentTarget.style.borderColor = 'rgba(200,169,110,0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none'
          e.currentTarget.style.borderColor = 'rgba(200,169,110,0.25)'
        }}
      >
        edit profile
      </motion.button>
    </motion.div>
  )
}
