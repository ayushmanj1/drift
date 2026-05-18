import { motion } from 'framer-motion'
import { collections } from '../data/mockData'

export default function CollectionsScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ minHeight: '100vh', padding: '24px 16px 120px' }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32, padding: '0 4px' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 400,
          color: 'var(--text-primary)', marginBottom: 6,
        }}>
          Collections
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Corners of your world, organized.
        </p>
      </div>

      {/* Masonry grid */}
      <div className="masonry-grid">
        {collections.map((col, i) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              cursor: 'pointer',
              height: i % 3 === 0 ? 280 : i % 3 === 1 ? 220 : 200,
            }}
          >
            {/* Blurred cover image */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${col.image})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              filter: 'blur(2px) brightness(0.4)',
              transform: 'scale(1.1)',
            }} />

            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(13,13,13,0.2) 0%, rgba(13,13,13,0.8) 100%)',
            }} />

            {/* Content */}
            <div style={{
              position: 'relative', zIndex: 2, height: '100%',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              padding: '20px 16px',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: '1rem',
                color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 6,
              }}>
                {col.name}
              </h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {col.count} discoveries
              </p>
            </div>

            {/* Hover glow */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              style={{
                position: 'absolute', inset: 0, zIndex: 1,
                boxShadow: 'inset 0 0 40px rgba(200,169,110,0.08)',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Create collection FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'fixed', bottom: 90, right: 20, zIndex: 100,
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(200,169,110,0.12)',
          border: '1px solid rgba(200,169,110,0.25)',
          color: 'var(--accent-gold)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(20px)',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </motion.button>
    </motion.div>
  )
}
