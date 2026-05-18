import { motion } from 'framer-motion'
import NearbyMap from '../components/NearbyMap'

export default function MapScreen({ tappedLocation, onUserTap }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}
    >
      <NearbyMap
        userInterests={['cafe', 'bookshop', 'restaurant', 'park', 'bakery', 'bar', 'library']}
        tappedLocation={tappedLocation}
        onUserTap={onUserTap}
      />
    </motion.div>
  )
}
