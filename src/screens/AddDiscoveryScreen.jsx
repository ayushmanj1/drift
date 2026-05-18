import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CONTENT_TYPES = [
  { id: 'story', label: 'Story', desc: 'Share a moment or experience' },
  { id: 'blog', label: 'Blog', desc: 'Long-form thoughts & reflections' },
  { id: 'shayari', label: 'Shayari', desc: 'Poetry from the soul' },
  { id: 'quote', label: 'Quote', desc: 'Words that stay with you' },
  { id: 'poem', label: 'Poem', desc: 'Verses that paint emotions' },
  { id: 'thoughts', label: 'Thoughts', desc: 'Raw, unfiltered musings' },
  { id: 'lyrics', label: 'Lyrics', desc: 'Songs from your mind' },
  { id: 'letter', label: 'Letter', desc: 'To someone, or no one' },
  { id: 'journal', label: 'Journal', desc: 'A page from your day' },
  { id: 'rant', label: 'Rant', desc: 'Let it all out' },
  { id: 'micro', label: 'Micro Fiction', desc: 'A whole world in few words' },
  { id: 'confession', label: 'Confession', desc: 'The things left unsaid' },
  { id: 'other', label: 'Other', desc: 'Something entirely your own' },
]

const BG_CATEGORIES = ['Plain', 'Designer', 'Image']

const PLAIN_BACKGROUNDS = [
  '#1a1a1a', '#0d0d0d', '#1e1e2e', '#2d1b2e', '#1b2838',
  '#0a192f', '#1a0a2e', '#2a0a0a', '#0a2a1a', '#1a1a0a',
  '#2c2c3a', '#3d1f1f', '#1f3d2a', '#3a2c1f', '#1f2d3d',
  '#0e0e18', '#18120e', '#0e1812', '#12100e', '#100e18',
]

const DESIGNER_BACKGROUNDS = [
  // Moody & cinematic
  'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
  'linear-gradient(135deg, #141E30, #243B55)',
  'linear-gradient(135deg, #2c3e50, #4ca1af)',
  'linear-gradient(135deg, #373B44, #4286f4)',
  // Deep & rich
  'linear-gradient(135deg, #0F2027, #203A43, #2C5364)',
  'linear-gradient(135deg, #1D2B64, #F8CDDA)',
  'linear-gradient(135deg, #4e54c8, #8f94fb)',
  'linear-gradient(135deg, #654ea3, #eaafc8)',
  'linear-gradient(135deg, #a8326e, #4a0030)',
  // Warm earth
  'linear-gradient(135deg, #3E2723, #5D4037, #795548)',
  'linear-gradient(135deg, #4a3728, #8B6914)',
  'linear-gradient(135deg, #232526, #414345)',
  'linear-gradient(135deg, #2d1b00, #6d4c1d, #a67c52)',
  // Night sky
  'linear-gradient(135deg, #0c0c1d, #1a1a3e, #2e1065)',
  'linear-gradient(135deg, #020024, #090979, #00d4ff)',
  'linear-gradient(135deg, #0d0221, #261447, #4a1942)',
  'linear-gradient(135deg, #000428, #004e92)',
  'linear-gradient(135deg, #0B0C10, #1F2833, #45A29E)',
  // Sunset & warm
  'linear-gradient(135deg, #642B73, #C6426E)',
  'linear-gradient(135deg, #C33764, #1D2671)',
  'linear-gradient(135deg, #e96443, #904e95)',
  'linear-gradient(135deg, #f12711, #f5af19)',
  'linear-gradient(135deg, #ee0979, #ff6a00)',
  // Nature
  'linear-gradient(135deg, #134e5e, #71b280)',
  'linear-gradient(135deg, #1D976C, #93F9B9)',
  'linear-gradient(135deg, #11998e, #38ef7d)',
  'linear-gradient(135deg, #1f4037, #99f2c8)',
  // Mesh / multi-stop
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'radial-gradient(circle at 20% 80%, #1a0533 0%, #0d0221 40%, #000 100%)',
  'radial-gradient(circle at 80% 20%, #1a3a2a 0%, #0d1f15 40%, #000 100%)',
]

const IMAGE_BACKGROUNDS = [
  'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1518173946687-a1e2b4218adf?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1500534314805-e5a27648b48f?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1468276311594-df7cb7d3cd12?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80)',
  'url(https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80)',
]

const PLACEHOLDER_MAP = {
  story: 'Start writing your story...\n\nShare an experience, a moment, or something that moved you.',
  blog: 'Write your thoughts...\n\nDive deep into an idea, a reflection, or a perspective.',
  shayari: 'Dil se likhiye...\n\nLet your words flow like poetry.',
  quote: '"Write something that resonates..."\n\n— You',
  poem: 'Let the verses flow...\n\nPaint with words.',
  thoughts: 'What\'s on your mind?\n\nNo filter. Just you.',
  lyrics: '♪ Write your song...\n\nMelody in words.',
  letter: 'Dear...\n\nSay what you\'ve been holding back.',
  journal: 'Today was...\n\nCapture this moment.',
  rant: 'Let it out...\n\nNo judgement here.',
  micro: 'Tell a whole story...\n\nIn as few words as possible.',
  confession: 'I never told anyone, but...\n\nThis is your safe space.',
}

const CENTERED_TYPES = ['shayari', 'quote', 'poem', 'lyrics', 'confession', 'micro']

export default function AddDiscoveryScreen({ onBack, onPostCreated }) {
  const [step, setStep] = useState('type')    // 'type' | 'background' | 'write'
  const [contentType, setContentType] = useState(null)
  const [selectedBg, setSelectedBg] = useState(null)
  const [bgCategory, setBgCategory] = useState('Plain')
  const [title, setTitle] = useState('')
  const [posting, setPosting] = useState(false)

  // Multi-card support: array of card texts
  const [cards, setCards] = useState([''])
  const [activeCard, setActiveCard] = useState(0)

  const updateCardText = (idx, val) => {
    setCards(prev => prev.map((c, i) => i === idx ? val : c))
  }

  const addCard = () => {
    setCards(prev => [...prev, ''])
    setActiveCard(cards.length)
  }

  const removeCard = (idx) => {
    if (cards.length <= 1) return
    setCards(prev => prev.filter((_, i) => i !== idx))
    setActiveCard(Math.max(0, activeCard - 1))
  }

  const handlePost = () => {
    const allText = cards.join('\n\n---\n\n')
    if (!allText.trim()) return
    setPosting(true)
    const newPost = {
      contentType,
      background: selectedBg,
      text: allText,
      cards: cards.filter(c => c.trim()),
      title,
      image: null,
      images: [],
    }
    setTimeout(() => {
      setPosting(false)
      onPostCreated?.(newPost)
      onBack?.()
    }, 800)
  }

  // ─── STEP 1: Choose content type ───
  if (step === 'type') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          minHeight: '100vh', background: 'var(--bg-primary)',
          padding: '0', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '20px 18px 16px',
        }}>
          <motion.button whileTap={{ scale: 0.85 }} onClick={onBack}
            className="icon-button-hover"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </motion.button>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 400,
            color: 'var(--text-primary)', letterSpacing: '0.06em',
          }}>
            create a drop
          </h1>
        </div>

        <div style={{ padding: '12px 20px 40px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CONTENT_TYPES.map((type, i) => (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.97 }}
                className="glass-hover"
                onClick={() => {
                  setContentType(type.id)
                  setStep('background')
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 20px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div>
                  <p style={{
                    fontFamily: 'var(--font-heading)', fontSize: '1rem',
                    color: 'var(--text-primary)', marginBottom: 4,
                  }}>{type.label}</p>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}>{type.desc}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginLeft: 'auto' }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  // ─── STEP 2: Choose background ───
  if (step === 'background') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          minHeight: '100vh', background: 'var(--bg-primary)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '20px 18px 16px',
        }}>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setStep('type')}
            className="icon-button-hover"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </motion.button>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 400,
            color: 'var(--text-primary)', letterSpacing: '0.06em', flex: 1,
          }}>
            choose a vibe
          </h1>
          <span style={{
            fontSize: '0.7rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-body)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {CONTENT_TYPES.find(t => t.id === contentType)?.label}
          </span>
        </div>

        {/* Category toggle */}
        <div style={{
          display: 'flex', gap: 4, padding: '0 20px 16px',
          background: 'var(--bg-primary)',
        }}>
          {BG_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setBgCategory(cat)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 'var(--radius-pill)',
                background: bgCategory === cat ? 'rgba(200, 169, 110, 0.12)' : 'rgba(240, 235, 225, 0.04)',
                border: bgCategory === cat
                  ? '1px solid rgba(200, 169, 110, 0.3)'
                  : '1px solid rgba(240, 235, 225, 0.06)',
                color: bgCategory === cat ? 'var(--accent-gold)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                cursor: 'pointer', transition: 'all 0.3s',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Preview card */}
        {selectedBg && (
          <div style={{ padding: '0 20px 16px' }}>
            <div style={{
              height: 160, borderRadius: 'var(--radius-lg)',
              ...(selectedBg.startsWith('url(')
                ? { backgroundColor: '#111', backgroundImage: selectedBg, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: selectedBg }),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--glass-border)',
              position: 'relative', overflow: 'hidden',
            }}>
              {selectedBg.startsWith('url(') && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                }} />
              )}
              <p style={{
                fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)',
                textAlign: 'center', padding: '0 24px', position: 'relative', zIndex: 1,
              }}>
                Your words will appear here
              </p>
            </div>
          </div>
        )}

        {/* Background grid */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '0 20px 120px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: bgCategory === 'Image' ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
            gap: 10,
          }}>
            {(bgCategory === 'Plain' ? PLAIN_BACKGROUNDS :
              bgCategory === 'Designer' ? DESIGNER_BACKGROUNDS :
              IMAGE_BACKGROUNDS).map((bg, i) => (
              <motion.button
                key={`${bgCategory}-${i}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.015 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedBg(bg)}
                style={{
                  aspectRatio: bgCategory === 'Image' ? '3/4' : '1',
                  borderRadius: 12,
                  ...(bg.startsWith('url(')
                    ? { backgroundColor: '#111', backgroundImage: bg, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: bg }),
                  border: selectedBg === bg
                    ? '2.5px solid var(--accent-gold)'
                    : '1px solid rgba(240,235,225,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: selectedBg === bg ? '0 0 16px rgba(200,169,110,0.25)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Next button */}
        {selectedBg && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              padding: '16px 20px 36px',
              background: 'linear-gradient(transparent, var(--bg-primary) 30%)',
            }}
          >
            <button
              onClick={() => setStep('write')}
              style={{
                width: '100%', padding: '14px', borderRadius: 'var(--radius-pill)',
                background: 'var(--accent-gold)', border: 'none', color: '#0D0D0D',
                fontFamily: 'var(--font-heading)', fontSize: '0.9rem', cursor: 'pointer',
              }}
            >
              Start Writing
            </button>
          </motion.div>
        )}
      </motion.div>
    )
  }

  // ─── STEP 3: Write & Post ───
  const typeInfo = CONTENT_TYPES.find(t => t.id === contentType)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '20px 18px 12px', zIndex: 10,
      }}>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => setStep('background')}
          className="icon-button-hover"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </motion.button>
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: '0.65rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-body)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            {typeInfo?.label}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handlePost}
          disabled={posting || !cards.some(c => c.trim())}
          style={{
            padding: '8px 20px', borderRadius: 'var(--radius-pill)',
            background: cards.some(c => c.trim()) ? 'var(--accent-gold)' : 'var(--bg-card)',
            border: 'none', color: cards.some(c => c.trim()) ? '#0D0D0D' : 'var(--text-muted)',
            fontFamily: 'var(--font-heading)', fontSize: '0.8rem', cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          {posting ? 'Dropping...' : 'Drop'}
        </motion.button>
      </div>

      {/* Card page indicators + add button */}
      {cards.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '0 16px 10px',
        }}>
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveCard(i)}
              style={{
                width: activeCard === i ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: activeCard === i ? 'var(--accent-gold)' : 'rgba(240,235,225,0.15)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            />
          ))}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={addCard}
            style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'rgba(200, 169, 110, 0.1)',
              border: '1px dashed rgba(200, 169, 110, 0.3)',
              color: 'var(--accent-gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', marginLeft: 4,
            }}
            aria-label="Add another card"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </motion.button>
        </div>
      )}

      {/* Writing canvas with background */}
      <div style={{ flex: 1, padding: '0 16px 120px', overflowY: 'auto' }}>
        {/* Background preview card */}
        <div style={{
          borderRadius: 'var(--radius-lg)',
          ...(selectedBg?.startsWith('url(')
            ? { backgroundColor: '#111', backgroundImage: selectedBg, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: selectedBg }),
          padding: '32px 24px',
          minHeight: 320,
          display: 'flex', flexDirection: 'column',
          border: '1px solid var(--glass-border)',
          marginBottom: 12,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Dark overlay for image backgrounds */}
          {selectedBg?.startsWith('url(') && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 0,
            }} />
          )}

          {/* Card number badge */}
          {cards.length > 1 && (
            <div style={{
              position: 'relative', zIndex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <span style={{
                fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)',
                fontFamily: 'var(--font-body)',
              }}>
                Page {activeCard + 1} of {cards.length}
              </span>
              {cards.length > 1 && (
                <button
                  onClick={() => removeCard(activeCard)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Remove page
                </button>
              )}
            </div>
          )}

          {/* Title input (optional — first card only) */}
          {activeCard === 0 && ['story', 'blog', 'journal', 'letter'].includes(contentType) && (
            <input
              type="text"
              placeholder="Title (optional)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                position: 'relative', zIndex: 1,
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'var(--font-heading)', fontSize: '1.3rem',
                color: '#fff', marginBottom: 16, letterSpacing: '0.02em',
                textShadow: '0 1px 8px rgba(0,0,0,0.3)',
              }}
            />
          )}

          {/* Main text area */}
          <textarea
            key={`card-${activeCard}`}
            placeholder={activeCard === 0
              ? (PLACEHOLDER_MAP[contentType] || 'Start writing...')
              : 'Continue writing...'}
            value={cards[activeCard] || ''}
            onChange={e => updateCardText(activeCard, e.target.value)}
            autoFocus
            style={{
              position: 'relative', zIndex: 1,
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: CENTERED_TYPES.includes(contentType)
                ? 'var(--font-heading)'
                : 'var(--font-body)',
              fontSize: CENTERED_TYPES.includes(contentType) ? '1.15rem' : '0.95rem',
              lineHeight: 1.7,
              color: '#fff',
              resize: 'none',
              minHeight: 200,
              textAlign: CENTERED_TYPES.includes(contentType) ? 'center' : 'left',
              fontStyle: CENTERED_TYPES.includes(contentType) ? 'italic' : 'normal',
              textShadow: '0 1px 8px rgba(0,0,0,0.3)',
            }}
          />

          {/* Previous Page Button */}
          {activeCard > 0 && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => setActiveCard(activeCard - 1)}
              style={{
                position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
                zIndex: 10, background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '50%',
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer', backdropFilter: 'blur(2px)'
              }}
              aria-label="Previous page"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </motion.button>
          )}

          {/* Next Page Button */}
          {activeCard < cards.length - 1 && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => setActiveCard(activeCard + 1)}
              style={{
                position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                zIndex: 10, background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '50%',
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer', backdropFilter: 'blur(2px)'
              }}
              aria-label="Next page"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </motion.button>
          )}
        </div>

        {/* Character count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            {(cards[activeCard] || '').length} characters
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            {(cards[activeCard] || '').split(/\s+/).filter(Boolean).length} words
            {cards.length > 1 && ` · ${cards.length} pages`}
          </span>
        </div>

        {/* Change background button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep('background')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '12px', marginTop: 16,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
            color: 'var(--text-muted)', fontSize: '0.8rem',
            fontFamily: 'var(--font-body)', cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          Change Background
        </motion.button>
      </div>
    </motion.div>
  )
}
