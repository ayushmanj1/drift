import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '../components/Card'
import { discoveries } from '../data/mockData'

const GENRES = ['All', 'Story', 'Poem', 'Shayari', 'Journal', 'Letter', 'Rant', 'Quote']
const getGenreForMock = (id) => GENRES[1 + (id % (GENRES.length - 1))].toLowerCase()

export default function HomeScreen({ userPosts = [], onExplore, onProfileTap, onLike, onSave, onUserTap, onDeletePost }) {
  const [items, setItems] = useState(() => 
    discoveries.slice(0, 8).map(d => ({ ...d, contentType: getGenreForMock(d.id) }))
  )
  const [loading, setLoading] = useState(false)
  const [activeGenre, setActiveGenre] = useState('All')
  const [showGenreMenu, setShowGenreMenu] = useState(false)
  const observerRef = useRef(null)
  const batchRef = useRef(1)

  const loadMore = useCallback(() => {
    if (loading) return
    setLoading(true)
    // Simulate loading delay for calm feel
    setTimeout(() => {
      const nextBatch = batchRef.current
      // Cycle through discoveries for infinite feel
      const startIdx = (nextBatch * 8) % discoveries.length
      const newItems = []
      for (let i = 0; i < 8; i++) {
        const srcItem = discoveries[(startIdx + i) % discoveries.length]
        const newId = srcItem.id + nextBatch * 100 + i
        newItems.push({
          ...srcItem,
          id: newId,
          contentType: getGenreForMock(newId),
          resonated: srcItem.resonated + Math.floor(Math.random() * 50),
        })
      }
      setItems((prev) => [...prev, ...newItems])
      batchRef.current += 1
      setLoading(false)
    }, 800)
  }, [loading])

  useEffect(() => {
    const sentinel = observerRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '400px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ paddingBottom: '100px' }}
    >
      {/* Header */}
      <div style={{
        padding: '24px 20px 8px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'linear-gradient(180deg, var(--bg-primary) 60%, transparent 100%)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        {/* Wordmark Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowGenreMenu(!showGenreMenu)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, padding: 0
            }}
          >
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.5rem',
              fontWeight: 400,
              letterSpacing: '0.15em',
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              {activeGenre === 'All' ? 'Drift' : activeGenre}
            </h1>
            <svg 
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
              style={{ transform: showGenreMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <AnimatePresence>
            {showGenreMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scaleY: 0.8 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -10, scaleY: 0.8 }}
                style={{
                  position: 'absolute', top: '100%', left: 0,
                  marginTop: 12, background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)', padding: 8, zIndex: 60,
                  display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.4)', transformOrigin: 'top left'
                }}
              >
                {GENRES.map(genre => (
                  <button
                    key={genre}
                    onClick={() => {
                      setActiveGenre(genre)
                      setShowGenreMenu(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    style={{
                      background: activeGenre === genre ? 'rgba(200, 169, 110, 0.1)' : 'transparent',
                      border: 'none', padding: '10px 16px', borderRadius: 6,
                      color: activeGenre === genre ? 'var(--accent-gold)' : 'var(--text-primary)',
                      fontFamily: 'var(--font-heading)', fontSize: '1rem',
                      textAlign: 'left', cursor: 'pointer', transition: 'background 0.2s',
                    }}
                  >
                    {genre}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Profile Avatar Button */}
            <motion.button
              onClick={onProfileTap}
              whileTap={{ scale: 0.9 }}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(200, 169, 110, 0.1)',
                border: '1px solid rgba(200, 169, 110, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.9rem',
                color: 'var(--accent-gold)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              S
            </motion.button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        padding: '20px 44px',
        maxWidth: '720px',
        margin: '0 auto',
      }}>
        {[...userPosts, ...items]
          .filter(item => activeGenre === 'All' || item.contentType === activeGenre.toLowerCase())
          .map((item, i) => (
          <Card
            key={item.id}
            discovery={item}
            index={i}
            onLike={onLike}
            onSave={onSave}
            onUserTap={onUserTap}
            onDeletePost={onDeletePost}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '40px 0',
        }}>
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            }}
          >
            discovering more...
          </motion.div>
        </div>
      )}

      {/* Intersection observer sentinel */}
      <div ref={observerRef} style={{ height: '1px' }} />
    </motion.div>
  )
}
