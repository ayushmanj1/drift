import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '../components/Card'

/*
  Discovery tab — displays the user's SAVED posts/cards.
  This is the personal saved collection view, not algorithmic content.
*/
export default function DiscoveryScreen({ savedPosts = [], onLike, onSave, onUserTap }) {
  const [viewMode, setViewMode] = useState('grid') // grid | feed

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ minHeight: '100vh', padding: '24px 16px 120px' }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28, padding: '0 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 400,
              color: 'var(--text-primary)', marginBottom: 6,
            }}>
              Discovery
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Your saved corners of the world.
            </p>
          </div>

          {/* View mode toggle */}
          <div style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(240, 235, 225, 0.04)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px',
            border: '1px solid rgba(240, 235, 225, 0.06)',
          }}>
            {['grid', 'feed'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  background: viewMode === mode ? 'rgba(200, 169, 110, 0.12)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '6px 12px',
                  color: viewMode === mode ? 'var(--accent-gold)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.3s',
                }}
              >
                {mode === 'grid' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {savedPosts.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(200, 169, 110, 0.06)',
            border: '1px solid rgba(200, 169, 110, 0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1" strokeLinecap="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: '1.1rem', color: 'var(--text-secondary)',
            maxWidth: 280, lineHeight: 1.6, marginBottom: 8,
          }}>
            Nothing saved yet
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tap the bookmark icon on any card to save it here.
          </p>
        </motion.div>
      ) : viewMode === 'grid' ? (
        /* Grid view */
        <div className="masonry-grid">
          {savedPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                height: i % 3 === 0 ? 240 : i % 3 === 1 ? 200 : 180,
              }}
            >
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${post.image})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'blur(1px) brightness(0.5)',
                transform: 'scale(1.1)',
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(13,13,13,0.1) 0%, rgba(13,13,13,0.85) 100%)',
              }} />
              <div style={{
                position: 'relative', zIndex: 2, height: '100%',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: '16px 14px',
              }}>
                <p style={{
                  fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                  fontSize: '0.85rem', color: 'var(--text-primary)',
                  lineHeight: 1.5, marginBottom: 8,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  "{post.caption}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{post.user}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {post.moods.slice(0, 1).map((m) => (
                      <span key={m} style={{
                        fontSize: '0.6rem', color: 'var(--accent-gold)',
                        padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                        background: 'rgba(200,169,110,0.1)',
                      }}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Feed view */
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '32px',
          maxWidth: '720px', margin: '0 auto',
        }}>
          {savedPosts.map((post, i) => (
            <Card
              key={post.id}
              discovery={post}
              index={i}
              onLike={onLike}
              onSave={onSave}
              onUserTap={onUserTap}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
