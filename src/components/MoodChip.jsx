import { motion } from 'framer-motion'

export default function MoodChip({ label, selected, onClick, delay = 0, large = false }) {
  return (
    <motion.button
      className={`mood-chip ${selected ? 'selected' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={large ? {
        fontSize: '1.1rem',
        padding: '10px 24px',
        fontFamily: 'var(--font-heading)',
        fontStyle: 'italic',
      } : {}}
    >
      {label}
    </motion.button>
  )
}
