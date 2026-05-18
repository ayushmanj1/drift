import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '../components/Card'
import { moodOptions, moodColors, discoveries } from '../data/mockData'

// Organic scattered positions for mood words
const positions = [
  { top: '8%', left: '10%' },
  { top: '5%', left: '55%' },
  { top: '18%', left: '35%' },
  { top: '15%', left: '70%' },
  { top: '28%', left: '12%' },
  { top: '30%', left: '52%' },
  { top: '40%', left: '28%' },
  { top: '38%', left: '68%' },
  { top: '50%', left: '8%' },
  { top: '48%', left: '48%' },
]

export default function MoodSearchScreen({ onBack }) {
  const [selectedMood, setSelectedMood] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const observerRef = useRef(null)
  const batchRef = useRef(0)

  const getFilteredDiscoveries = useCallback((mood) => {
    // Get items matching the mood, or random subset
    const matching = discoveries.filter((d) => d.moods.includes(mood))
    if (matching.length >= 4) return matching
    // Fill with random items
    const shuffled = [...discoveries].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 8)
  }, [])

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood)
    setLoading(true)
    batchRef.current = 0
    setTimeout(() => {
      setResults(getFilteredDiscoveries(mood).map((d, i) => ({ ...d, id: d.id + 10000 + i })))
      setLoading(false)
    }, 600)
  }

  const loadMoreResults = useCallback(() => {
    if (loading || !selectedMood) return
    setLoading(true)
    setTimeout(() => {
      batchRef.current += 1
      const more = getFilteredDiscoveries(selectedMood).map((d, i) => ({
        ...d,
        id: d.id + 20000 + batchRef.current * 100 + i,
        resonated: d.resonated + Math.floor(Math.random() * 80),
      }))
      setResults((prev) => [...prev, ...more])
      setLoading(false)
    }, 800)
  }, [loading, selectedMood, getFilteredDiscoveries])

  useEffect(() => {
    if (!selectedMood) return
    const sentinel = observerRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMoreResults() },
      { rootMargin: '400px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [selectedMood, loadMoreResults])

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Color wash background */}
      <AnimatePresence>
        {selectedMood && (
          <motion.div
            key={selectedMood}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 0,
              background: `radial-gradient(ellipse at 50% 30%, ${moodColors[selectedMood] || 'transparent'}, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!selectedMood ? (
          /* ─── MOOD SELECTION ─── */
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{ minHeight: '100vh', padding: '80px 24px', position: 'relative' }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              style={{
                fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 6vw, 3rem)',
                fontWeight: 400, color: 'var(--text-primary)',
                textAlign: 'center', marginBottom: 60,
              }}
            >
              How are you feeling?
            </motion.h1>

            {/* Scattered mood words */}
            <div style={{ position: 'relative', height: '55vh', maxWidth: 500, margin: '0 auto' }}>
              {moodOptions.map((mood, i) => (
                <motion.button
                  key={mood}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                  whileHover={{ scale: 1.12, color: 'var(--accent-gold)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodSelect(mood)}
                  style={{
                    position: 'absolute',
                    ...positions[i],
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                    fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                    color: 'var(--text-secondary)',
                    transition: 'color 0.3s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {mood}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ─── RESULTS FEED ─── */
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{ paddingBottom: 120 }}
          >
            {/* Header */}
            <div style={{
              padding: '24px 20px 8px',
              position: 'sticky', top: 0, zIndex: 50,
              background: 'linear-gradient(180deg, var(--bg-primary) 60%, transparent 100%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => { setSelectedMood(null); setResults([]) }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: '4px',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <h2 style={{
                  fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                  fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 400,
                }}>
                  {selectedMood}
                </h2>
              </div>
            </div>

            {/* Feed */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 40,
              padding: '20px 16px', maxWidth: 720, margin: '0 auto',
            }}>
              {results.map((item, i) => (
                <Card key={item.id} discovery={item} index={i} />
              ))}
            </div>

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}
                >
                  feeling into it...
                </motion.div>
              </div>
            )}

            <div ref={observerRef} style={{ height: 1 }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
