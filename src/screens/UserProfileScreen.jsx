import { motion } from 'framer-motion'
import { discoveries } from '../data/mockData'

/*
  UserProfileScreen — shown when tapping another user's username.
  Displays their posts, taste identity, and shared resonance.
*/

export default function UserProfileScreen({ username, onBack }) {
  // Filter discoveries by this user
  const userPosts = discoveries.filter((d) => d.user === username)
  const totalLikes = userPosts.reduce((sum, p) => sum + (p.resonated || 0), 0)
  const allMoods = [...new Set(userPosts.flatMap((p) => p.moods))]

  // Generate a taste identity from moods
  const tasteIdentity = allMoods.slice(0, 3).join('. ') + '.'
  const initial = username ? username.replace('@', '')[0].toUpperCase() : '?'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ minHeight: '100vh', padding: '20px 20px 120px', position: 'relative' }}
    >
      {/* Back button */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onBack}
        style={{
          position: 'absolute', top: 20, left: 20,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: 6, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: '0.75rem', fontFamily: 'var(--font-body)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M19 12H5" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        back
      </motion.button>

      {/* Profile header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, marginBottom: 40 }}>
        {/* Avatar */}
        <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 20 }}>
          <div className="taste-aura" style={{
            position: 'absolute', inset: -8, width: 136, height: 136,
            filter: 'blur(20px)', opacity: 0.6,
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1px solid rgba(240,235,225,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(13,13,13,0.6)', backdropFilter: 'blur(20px)',
          }}>
            <span style={{
              fontFamily: 'var(--font-heading)', fontSize: '2.5rem',
              color: 'var(--text-primary)',
            }}>
              {initial}
            </span>
          </div>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.4rem',
          color: 'var(--text-primary)', marginBottom: 8,
        }}>
          {username}
        </h2>

        <p style={{
          fontFamily: 'var(--font-heading)', fontStyle: 'italic',
          fontSize: '0.85rem', color: 'var(--text-secondary)',
          textAlign: 'center', maxWidth: 300, lineHeight: 1.6, marginBottom: 20,
        }}>
          {tasteIdentity || 'A fellow wanderer of quiet places.'}
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 8 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 500 }}>{userPosts.length}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>drops</p>
          </div>
          <div style={{ width: 1, background: 'rgba(240,235,225,0.06)' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: '#e74c6f', fontWeight: 500 }}>{totalLikes}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>likes</p>
          </div>
        </div>
      </div>


      {/* User's posts */}
      <div style={{ marginBottom: 16 }}>
        <p style={{
          fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase',
          letterSpacing: '0.08em', marginBottom: 16,
        }}>
          Their discoveries
        </p>
      </div>

      {userPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: '0.9rem', color: 'var(--text-muted)',
          }}>
            No public drops yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {userPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: 'flex', gap: 14,
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(240, 235, 225, 0.02)',
                border: '1px solid rgba(240, 235, 225, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              whileHover={{
                borderColor: 'rgba(200, 169, 110, 0.15)',
                background: 'rgba(240, 235, 225, 0.03)',
              }}
            >
              {/* Thumbnail */}
              <div style={{
                width: 72, height: 72, borderRadius: 'var(--radius-sm)',
                backgroundImage: `url(${post.image})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                flexShrink: 0,
              }} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                  fontSize: '0.85rem', color: 'var(--text-primary)',
                  lineHeight: 1.5, marginBottom: 8,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  "{post.caption}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {post.resonated || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
