import { useState } from 'react'
import { motion } from 'framer-motion'

const WRITING_GENRES = [
  { id: 'story', label: 'Stories' },
  { id: 'blog', label: 'Blogs' },
  { id: 'shayari', label: 'Shayari' },
  { id: 'quote', label: 'Quotes' },
  { id: 'poem', label: 'Poems' },
  { id: 'thoughts', label: 'Thoughts' },
  { id: 'lyrics', label: 'Lyrics' },
  { id: 'letter', label: 'Letters' },
  { id: 'journal', label: 'Journal' },
  { id: 'rant', label: 'Rants' },
  { id: 'micro', label: 'Micro Fiction' },
  { id: 'confession', label: 'Confessions' },
]

export default function OnboardingScreen({ onComplete }) {
  const [selected, setSelected] = useState([])

  const toggleGenre = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        position: 'relative',
      }}
    >
      {/* Subtle background glow */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,169,110,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          fontWeight: 400,
          color: 'var(--text-primary)',
          textAlign: 'center',
          marginBottom: '12px',
          lineHeight: 1.3,
        }}
      >
        What do you<br />love to read?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '48px',
          textAlign: 'center',
        }}
      >
        Pick what you'd love in your feed.
      </motion.p>

      {/* Genre chips */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center',
        maxWidth: '520px',
        marginBottom: '60px',
      }}>
        {WRITING_GENRES.map((genre, i) => {
          const isSelected = selected.includes(genre.id)
          return (
            <motion.button
              key={genre.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleGenre(genre.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-pill)',
                background: isSelected ? 'rgba(200, 169, 110, 0.12)' : 'rgba(240, 235, 225, 0.04)',
                border: isSelected
                  ? '1px solid rgba(200, 169, 110, 0.4)'
                  : '1px solid rgba(240, 235, 225, 0.08)',
                color: isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.3s var(--transition-smooth)',
              }}
            >

              {genre.label}
            </motion.button>
          )
        })}
      </div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: selected.length > 0 ? 1 : 0.3, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        whileHover={selected.length > 0 ? { scale: 1.02, borderColor: 'var(--accent-gold)' } : {}}
        whileTap={selected.length > 0 ? { scale: 0.98 } : {}}
        onClick={() => selected.length > 0 && onComplete(selected)}
        disabled={selected.length === 0}
        style={{
          background: selected.length > 0 ? 'var(--accent-gold)' : 'transparent',
          border: selected.length > 0 ? 'none' : '1px solid rgba(240, 235, 225, 0.2)',
          color: selected.length > 0 ? '#0D0D0D' : 'var(--text-primary)',
          fontFamily: 'var(--font-heading)',
          fontSize: '0.9rem',
          padding: '14px 48px',
          borderRadius: 'var(--radius-pill)',
          cursor: selected.length > 0 ? 'pointer' : 'default',
          letterSpacing: '0.08em',
          transition: 'all 0.3s var(--transition-smooth)',
        }}
      >
        Start Reading
      </motion.button>
    </motion.div>
  )
}
