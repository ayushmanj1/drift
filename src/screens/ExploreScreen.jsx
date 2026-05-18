import { useState } from 'react'
import { motion } from 'framer-motion'
import { discoveries } from '../data/mockData'


export default function ExploreScreen({ onBack, onUserTap }) {
  const [query, setQuery] = useState('')

  const q = query.toLowerCase().trim()

  // Filter discoveries based on query (users, cafes, places, etc)
  const filtered = discoveries.filter(d => {
    if (!q) return true
    return d.user.toLowerCase().includes(q) ||
           d.category.toLowerCase().includes(q) ||
           d.moods.some(m => m.toLowerCase().includes(q)) ||
           d.caption.toLowerCase().includes(q)
  })

  // Duplicate discoveries for explore grid visual
  const extendedFiltered = [
    ...filtered,
    ...filtered.map(d => ({ ...d, id: d.id + 100 })),
    ...filtered.map(d => ({ ...d, id: d.id + 200 }))
  ].sort(() => Math.random() - 0.5)


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}
    >
      {/* Search Header */}
      <div style={{
        padding: '24px 16px 16px',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          style={{
            background: 'none', border: 'none', color: 'var(--text-primary)',
            padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </motion.button>

        <div style={{
          flex: 1,
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(240, 235, 225, 0.05)',
          border: '1px solid rgba(240, 235, 225, 0.1)',
          borderRadius: 'var(--radius-pill)',
          padding: '10px 16px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search users, places, cafes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              width: '100%'
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>



      {/* Explore Grid — 3x3 images with no text */}
      <div className="explore-grid" style={{ paddingBottom: '100px' }}>
        {extendedFiltered.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (i % 9) * 0.05 }}
            style={{
              aspectRatio: '1 / 1',
              backgroundImage: `url(${post.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
      </div>

      {extendedFiltered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            color: 'var(--text-muted)', fontSize: '0.95rem',
          }}>
            Nothing found for "{query}"
          </p>
        </div>
      )}
    </motion.div>
  )
}
