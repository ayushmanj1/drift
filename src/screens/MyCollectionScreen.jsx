import { useState } from 'react'
import { motion } from 'framer-motion'
import Card from '../components/Card'
import { discoveries } from '../data/mockData'

/*
  My Collection tab — shows only the cards/posts that the current user
  has created and published. This is the user's own content library.
*/

// Mock: current user's posts (filtered from discoveries by user handle)
const currentUserHandle = '@solitary.wanderer'
const currentUserPosts = [
  {
    id: 901,
    image: 'https://images.unsplash.com/photo-1495195134756-60a79b4b5c60?w=800&q=80',
    category: 'photography',
    location: 'abandoned greenhouse',
    caption: 'I found an old greenhouse where nature was quietly reclaiming everything. Moss on glass. Roots through tile. It felt like watching time in slow motion.',
    moods: ['dreamy', 'solitude', 'numb'],
    resonated: 203,
    user: currentUserHandle,
  },
  {
    id: 902,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    category: 'café',
    location: 'Shimokitazawa, Tokyo',
    caption: 'This café had no Wi-Fi. Just rain sounds and the smell of old books. I stayed four hours and wrote nothing. It was the most productive day I\'ve had.',
    moods: ['rainy-night', 'warmth', 'solitude'],
    resonated: 147,
    user: currentUserHandle,
  },
  {
    id: 903,
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    category: 'place',
    location: 'Scottish Highlands',
    caption: 'Drove until the road ended. Walked until my legs hurt. Sat until the sky changed colors three times. Then I drove back.',
    moods: ['existential', 'solitude', 'restless'],
    resonated: 89,
    user: currentUserHandle,
  },
]

export default function MyCollectionScreen({ onLike, onSave, onUserTap }) {
  const [viewMode, setViewMode] = useState('feed')

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
              My Collection
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Everything you've dropped into the world.
            </p>
          </div>

          {/* Post count badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(200, 169, 110, 0.06)',
            border: '1px solid rgba(200, 169, 110, 0.12)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 16px',
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 500 }}>
              {currentUserPosts.length}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              drops
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: 'flex', gap: '12px', marginBottom: 32, padding: '0 4px',
        }}
      >
        {[
          { label: 'Total Likes', value: currentUserPosts.reduce((sum, p) => sum + (p.resonated || 0), 0) },
          { label: 'Avg Likes', value: Math.round(currentUserPosts.reduce((sum, p) => sum + (p.resonated || 0), 0) / (currentUserPosts.length || 1)) },
          { label: 'Moods Used', value: [...new Set(currentUserPosts.flatMap(p => p.moods))].length },
        ].map((stat, i) => (
          <div key={stat.label} style={{
            flex: 1,
            padding: '14px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(240, 235, 225, 0.03)',
            border: '1px solid rgba(240, 235, 225, 0.06)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 500, marginBottom: 4 }}>
              {stat.value}
            </p>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Posts feed */}
      {currentUserPosts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '80px 24px', textAlign: 'center',
          }}
        >
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(200, 169, 110, 0.06)',
            border: '1px solid rgba(200, 169, 110, 0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <p style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: '1.1rem', color: 'var(--text-secondary)',
            maxWidth: 280, lineHeight: 1.6, marginBottom: 8,
          }}>
            No drops yet
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Drop your first discovery and it will appear here.
          </p>
        </motion.div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '32px',
          maxWidth: '720px', margin: '0 auto',
        }}>
          {currentUserPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Card
                discovery={post}
                index={i}
                onLike={onLike}
                onSave={onSave}
                onUserTap={onUserTap}
              />
              {/* Post date */}
              <div style={{
                display: 'flex', justifyContent: 'flex-end',
                padding: '8px 4px 0', opacity: 0.4,
              }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  dropped {i === 0 ? '3 days ago' : i === 1 ? '2 weeks ago' : '1 month ago'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
