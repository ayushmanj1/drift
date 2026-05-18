import { motion } from 'framer-motion'

export default function GlassPanel({ children, className = '', strong = false, style = {}, ...props }) {
  return (
    <motion.div
      className={`${strong ? 'glass-panel-strong' : 'glass-panel'} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  )
}
