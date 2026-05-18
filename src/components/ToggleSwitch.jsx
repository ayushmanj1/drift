import { motion } from 'framer-motion'

export default function ToggleSwitch({ on, onChange, disabled = false }) {
  return (
    <button
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      style={{
        position: 'relative',
        width: 44, height: 24,
        borderRadius: 12,
        border: 'none',
        background: on ? 'var(--accent-gold)' : 'var(--bg-secondary)',
        cursor: disabled ? 'default' : 'pointer',
        padding: 0,
        flexShrink: 0,
        transition: 'background 0.25s ease',
        opacity: disabled ? 0.4 : 1,
      }}
      aria-checked={on}
      role="switch"
    >
      <motion.div
        animate={{ x: on ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute',
          top: 2, width: 20, height: 20,
          borderRadius: '50%',
          background: on ? 'var(--bg-primary)' : 'var(--text-muted)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  )
}
