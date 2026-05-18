import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '../components/Card'

export default function ProfileScreen({
  onOpenSettings, onDiscoveryTap,
  savedPosts = [], onUserTap, onAddTap,
  userPosts = [], userProfile = {}, onProfileUpdate, onDeletePost
}) {
  const [activeTab, setActiveTab] = useState('collection')
  const [editSheet, setEditSheet] = useState(null) // null | 'photo' | 'username' | 'name' | 'bio'
  const [editValue, setEditValue] = useState('')
  const [activePost, setActivePost] = useState(null)

  const { photo, username, name, bio } = userProfile

  const initial = username
    ? (username.replace('@', '')[0]?.toUpperCase() || '?')
    : (name ? (name[0]?.toUpperCase() || '?') : '?')


  const openEdit = (field, current = '') => {
    setEditValue(current)
    setEditSheet(field)
  }

  const saveEdit = () => {
    if (editSheet === 'photo') {
      // photo handled separately via file input
      setEditSheet(null)
      return
    }
    onProfileUpdate?.({ ...userProfile, [editSheet]: editValue })
    setEditSheet(null)
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onProfileUpdate?.({ ...userProfile, photo: ev.target.result })
      setEditSheet(null)
    }
    reader.readAsDataURL(file)
  }

  const editOptions = [
    { key: 'photo', label: photo ? 'Change profile photo' : 'Add profile photo' },
    ...(photo ? [{ key: 'photo-delete', label: 'Remove profile photo', danger: true }] : []),
    { key: 'username', label: 'Edit username' },
    { key: 'name', label: 'Edit name' },
    { key: 'bio', label: 'Edit bio' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ minHeight: '100vh', padding: '40px 20px 120px', position: 'relative' }}
    >
      {/* Hidden photo input */}
      <input
        id="profile-photo-input"
        type="file"
        accept="image/*"
        onChange={handlePhotoSelect}
        style={{ display: 'none' }}
      />

      {/* Top right actions */}
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8, zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.85 }} onClick={onOpenSettings}
          className="icon-button-hover"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </motion.button>
      </div>

      {/* Avatar + Edit */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10, marginBottom: 32 }}>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          {/* Avatar */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: photo ? `url(${photo}) center/cover` : 'rgba(200, 169, 110, 0.1)',
            border: '1px solid rgba(200, 169, 110, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {!photo && (
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--accent-gold)' }}>
                {initial}
              </span>
            )}
          </div>
          {/* Edit icon */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setEditSheet('menu')}
            className="icon-button-hover"
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--bg-card)', border: '1px solid rgba(240,235,225,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </motion.button>
        </div>

        {/* Name, username, bio */}
        {(name || username) && (
          <div style={{ textAlign: 'center' }}>
            {name && <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 4 }}>{name}</h2>}
            {username && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{username}</p>}
            {bio && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8, maxWidth: 280, textAlign: 'center', lineHeight: 1.5, fontStyle: 'italic' }}>{bio}</p>}
          </div>
        )}
        
        {/* Stats: Drops & Likes */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: (name || username || bio) ? 16 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{userPosts.length}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Drops</span>
          </div>
          <div style={{ width: 1, height: 24, background: 'rgba(240,235,225,0.1)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              {userPosts.reduce((acc, post) => acc + (post.resonated || 0), 0)}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Likes</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid rgba(240,235,225,0.06)' }}>
        {['My Collection', 'Saved'].map((tab, i) => {
          const key = i === 0 ? 'collection' : 'saved'
          return (
            <button key={tab} onClick={() => setActiveTab(key)} style={{
              flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.05em',
              color: activeTab === key ? 'var(--accent-gold)' : 'var(--text-muted)',
              borderBottom: activeTab === key ? '1px solid var(--accent-gold)' : '1px solid transparent',
              transition: 'all 0.3s', textTransform: 'uppercase',
            }}>
              {tab}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'collection' && (
            <div style={{ minHeight: '300px' }}>
              {userPosts.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onAddTap}
                    style={{
                      width: 64, height: 64, borderRadius: '50%', background: 'transparent',
                      border: '2px dashed rgba(200,169,110,0.4)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent-gold)', cursor: 'pointer', marginBottom: 16,
                    }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </motion.button>
                  <p style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                    create your first drop
                  </p>
                </div>
              ) : (
                <div className="explore-grid">
                  {userPosts.map((post, i) => (
                    <motion.div
                      key={post.id || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (i % 9) * 0.05 }}
                      onClick={() => setActivePost(post)}
                      style={{
                        aspectRatio: '1/1',
                        ...(post.background?.startsWith('url(') 
                           ? { backgroundImage: post.background, backgroundColor: '#111' }
                           : { background: post.background || '#222' }),
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 12, overflow: 'hidden', position: 'relative'
                      }}
                    >
                      {post.background?.startsWith('url(') && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
                      )}
                      <p style={{
                         position: 'relative', zIndex: 1,
                         fontSize: '0.65rem', fontFamily: 'var(--font-heading)',
                         color: '#fff', textAlign: 'center',
                         display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
                         overflow: 'hidden', fontStyle: 'italic'
                      }}>
                        {post.title || post.cards?.[0] || post.text || ''}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div style={{ minHeight: '300px' }}>
              {savedPosts.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1" style={{ marginBottom: 16, opacity: 0.5 }}>
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <p style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                    Nothing saved yet
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                    Tap the bookmark icon on any drop to save it here.
                  </p>
                </div>
              ) : (
                <div className="explore-grid">
                  {savedPosts.map((post, i) => (
                    <motion.div
                      key={post.id || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (i % 9) * 0.05 }}
                      onClick={() => setActivePost(post)}
                      style={{
                        aspectRatio: '1/1',
                        backgroundImage: `url(${post.image})`,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Edit bottom sheet — menu */}
      <AnimatePresence>
        {editSheet === 'menu' && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditSheet(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100 }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1101,
                background: 'var(--bg-card)', borderRadius: '24px 24px 0 0',
                padding: '8px 0 40px',
                border: '1px solid rgba(240,235,225,0.06)',
              }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(240,235,225,0.1)', margin: '8px auto 20px' }} />
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', textAlign: 'center', marginBottom: 16, letterSpacing: '0.05em' }}>
                Edit Profile
              </p>
              {editOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => {
                    if (opt.key === 'photo') {
                      document.getElementById('profile-photo-input').click()
                      setEditSheet(null)
                    } else if (opt.key === 'photo-delete') {
                      onProfileUpdate?.({ ...userProfile, photo: null })
                      setEditSheet(null)
                    } else {
                      openEdit(opt.key, userProfile[opt.key] || '')
                    }
                  }}
                  style={{
                    width: '100%', padding: '16px 24px', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem', color: opt.danger ? '#d97757' : 'var(--text-primary)',
                    borderBottom: '1px solid rgba(240,235,225,0.04)', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,235,225,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          </>
        )}

        {/* Edit text field sheet */}
        {editSheet && editSheet !== 'menu' && editSheet !== 'photo' && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditSheet(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100 }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1101,
                background: 'var(--bg-card)', borderRadius: '24px 24px 0 0',
                padding: '8px 24px 40px',
                border: '1px solid rgba(240,235,225,0.06)',
              }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(240,235,225,0.1)', margin: '8px auto 20px' }} />
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '0.05em', textTransform: 'capitalize' }}>
                Edit {editSheet}
              </p>
              {editSheet === 'bio' ? (
                <textarea
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  placeholder="Something about your taste..."
                  rows={4}
                  autoFocus
                  style={{
                    width: '100%', background: 'rgba(240,235,225,0.03)',
                    border: '1px solid rgba(240,235,225,0.1)', borderRadius: 'var(--radius-md)',
                    padding: '12px 14px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem', outline: 'none', resize: 'none',
                  }}
                />
              ) : (
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  placeholder={editSheet === 'username' ? '@yourhandle' : `Your ${editSheet}`}
                  autoFocus
                  style={{
                    width: '100%', background: 'rgba(240,235,225,0.03)',
                    border: '1px solid rgba(240,235,225,0.1)', borderRadius: 'var(--radius-md)',
                    padding: '12px 14px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem', outline: 'none',
                  }}
                />
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={() => setEditSheet(null)} style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-pill)',
                  background: 'rgba(240,235,225,0.05)', border: '1px solid rgba(240,235,225,0.08)',
                  color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                }}>Cancel</button>
                <button onClick={saveEdit} style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-pill)',
                  background: 'var(--accent-gold)', border: 'none',
                  color: '#0D0D0D', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.85rem',
                }}>Save</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Card 
                discovery={activePost} 
                index={0} 
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
