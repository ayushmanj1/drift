import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { discoveries } from '../data/mockData'
import Card from '../components/Card'


export default function ExploreScreen({ onBack, onUserTap, onDeletePost }) {
  const [query, setQuery] = useState('')
  const [activePost, setActivePost] = useState(null)
  const [showPostOptions, setShowPostOptions] = useState(false)

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
            onClick={() => setActivePost(post)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (i % 9) * 0.05 }}
            style={{
              aspectRatio: '1 / 1',
              backgroundImage: `url(${post.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              cursor: 'pointer'
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

      {/* Full-screen Post Viewer */}
      <AnimatePresence>
        {activePost && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 20px 10px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10000,
              background: 'linear-gradient(180deg, rgba(13,13,13,0.8) 0%, transparent 100%)'
            }}>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => setActivePost(null)}
                className="icon-button-hover"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 4 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </motion.button>
              
              <div 
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowPostOptions(true)}
                onMouseLeave={() => setShowPostOptions(false)}
              >
                <motion.button whileTap={{ scale: 0.85 }} 
                  className="icon-button-hover"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 4 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {showPostOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      style={{
                        position: 'absolute', right: 0, top: '100%', marginTop: 8,
                        background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-md)', padding: 8, minWidth: 150,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 10001
                      }}
                    >
                      <button
                        onClick={() => {
                          setShowPostOptions(false)
                          const btn = document.getElementById(`share-btn-${activePost.id}`)
                          if (btn) btn.click()
                        }}
                        style={{
                          width: '100%', padding: '12px 16px', background: 'none', border: 'none',
                          color: 'var(--text-primary)', textAlign: 'left', fontFamily: 'var(--font-body)',
                          fontSize: '0.9rem', cursor: 'pointer', borderRadius: '6px',
                          display: 'flex', alignItems: 'center', gap: 10
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,235,225,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                        Share
                      </button>
                      
                      {/* Only show delete if they own the post */}
                      {activePost.isMine && (
                        <button
                          onClick={() => {
                            setShowPostOptions(false)
                            setActivePost(null)
                            onDeletePost?.(activePost.id)
                          }}
                          style={{
                            width: '100%', padding: '12px 16px', background: 'none', border: 'none',
                            color: '#d97757', textAlign: 'left', fontFamily: 'var(--font-body)',
                            fontSize: '0.9rem', cursor: 'pointer', borderRadius: '6px',
                            display: 'flex', alignItems: 'center', gap: 10
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,235,225,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                          Delete
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Card 
                discovery={activePost} 
                index={0} 
                hideOptions={true}
                onUserTap={onUserTap}
                onDeletePost={(id) => {
                  setActivePost(null)
                  onDeletePost?.(id)
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
