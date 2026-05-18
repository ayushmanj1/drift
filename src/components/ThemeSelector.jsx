import { motion } from 'framer-motion'

const themes = [
  { id: 'dark', label: 'Dark', color: '#0D0D0D', border: '#2a2a2a' },
  { id: 'warm', label: 'Warm light', color: '#F5F0E8', border: '#d4cfc6' },
  { id: 'auto', label: 'Auto', color: null, border: '#2a2a2a' },
]

export default function ThemeSelector({ value, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 18, alignItems: 'center',
      justifyContent: 'center', padding: '6px 0',
    }}>
      {themes.map((t) => {
        const isSelected = value === t.id
        return (
          <motion.button
            key={t.id}
            onClick={() => onChange(t.id)}
            whileTap={{ scale: 0.9 }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 7,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4,
            }}
          >
            {/* Dot */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: isSelected
                ? '2px solid var(--accent-gold)'
                : '1.5px solid #333',
              overflow: 'hidden',
              position: 'relative',
              transition: 'border-color 0.25s',
              boxShadow: isSelected ? '0 0 10px rgba(200,169,110,0.2)' : 'none',
            }}>
              {t.id === 'auto' ? (
                <>
                  <div style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '50%', height: '100%',
                    background: '#0D0D0D',
                  }} />
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: '50%', height: '100%',
                    background: '#F5F0E8',
                  }} />
                </>
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  background: t.color,
                }} />
              )}
            </div>

            {/* Label */}
            <span style={{
              fontSize: '0.6rem',
              color: isSelected ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.03em',
              transition: 'color 0.25s',
              textTransform: 'capitalize',
            }}>
              {t.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
