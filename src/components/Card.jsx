import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Card({ discovery, index = 0, onLike, onSave, onUserTap, onDeletePost }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(discovery.resonated || 0)
  const [showRipple, setShowRipple] = useState(false)

  // Comment state
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeCard, setActiveCard] = useState(0)

  const handleLike = () => {
    if (isLiked) {
      setLikeCount((c) => c - 1)
      setIsLiked(false)
      onLike?.(discovery.id, false)
    } else {
      setLikeCount((c) => c + 1)
      setIsLiked(true)
      setShowRipple(true)
      setTimeout(() => setShowRipple(false), 600)
      onLike?.(discovery.id, true)
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave?.(discovery.id, !isSaved)
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return
    if (replyingTo !== null) {
      setComments(prev => prev.map((c, i) =>
        i === replyingTo
          ? { ...c, replies: [...(c.replies || []), { user: 'You', text: commentText.trim(), liked: false }] }
          : c
      ))
      setReplyingTo(null)
    } else {
      setComments(prev => [...prev, { user: 'You', text: commentText.trim(), liked: false, replies: [] }])
    }
    setCommentText('')
  }

  const toggleCommentLike = (idx) => {
    setComments(prev => prev.map((c, i) => i === idx ? { ...c, liked: !c.liked } : c))
  }

  const toggleReplyLike = (cIdx, rIdx) => {
    setComments(prev => prev.map((c, ci) =>
      ci === cIdx
        ? { ...c, replies: c.replies.map((r, ri) => ri === rIdx ? { ...r, liked: !r.liked } : r) }
        : c
    ))
  }

  return (
    <div>
      {/* ── The Card ── */}
      <motion.div
        className="discovery-card"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Background image or custom background */}
        <div
          className="discovery-card-bg"
          style={{
            ...(discovery.background?.startsWith('url(') 
                 ? { backgroundImage: discovery.background, backgroundColor: '#111' }
                 : discovery.background 
                   ? { background: discovery.background }
                   : { backgroundImage: `url(${discovery.image})` }
            )
          }}
        />
        {(!discovery.background || discovery.background?.startsWith('url(')) && (
          <div className="discovery-card-overlay" />
        )}

        {/* Content — just the text */}
        <div style={{
          position: 'relative', zIndex: 2, height: '100%',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          padding: '36px 28px',
        }}>
          {/* Previous Page Button */}
          {discovery.cards && discovery.cards.length > 1 && activeCard > 0 && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={(e) => { e.stopPropagation(); setActiveCard(activeCard - 1); }}
              style={{
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
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
          {discovery.cards && discovery.cards.length > 1 && activeCard < discovery.cards.length - 1 && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={(e) => { e.stopPropagation(); setActiveCard(activeCard + 1); }}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
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

          {discovery.title && activeCard === 0 && (
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#fff', 
              marginBottom: 16, textShadow: '0 1px 8px rgba(0,0,0,0.3)'
            }}>
              {discovery.title}
            </h2>
          )}
          <p 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              fontFamily: discovery.contentType && ['story', 'blog', 'journal', 'letter', 'rant'].includes(discovery.contentType) ? 'var(--font-body)' : 'var(--font-heading)', 
              fontStyle: discovery.contentType && ['story', 'blog', 'journal', 'letter', 'rant'].includes(discovery.contentType) ? 'normal' : 'italic',
              fontSize: discovery.contentType && ['story', 'blog', 'journal', 'letter', 'rant'].includes(discovery.contentType) ? '0.95rem' : 'clamp(1.15rem, 3vw, 1.5rem)', 
              lineHeight: 1.6,
              color: '#fff', textAlign: discovery.contentType && ['story', 'blog', 'journal', 'letter', 'rant'].includes(discovery.contentType) ? 'left' : 'center',
              maxWidth: '440px', opacity: 0.95, textShadow: '0 1px 8px rgba(0,0,0,0.3)',
              whiteSpace: 'pre-wrap', 
              display: isExpanded ? 'block' : '-webkit-box', 
              WebkitLineClamp: isExpanded ? 'unset' : 12, 
              WebkitBoxOrient: 'vertical', 
              overflow: isExpanded ? 'visible' : 'hidden',
              cursor: 'pointer',
              maxHeight: isExpanded ? '60vh' : 'auto',
              overflowY: isExpanded ? 'auto' : 'hidden',
              padding: '0 12px'
            }}
          >
            {discovery.cards && discovery.cards.length > 0
              ? discovery.cards[activeCard]
              : (discovery.text ? discovery.text : (discovery.caption ? `"${discovery.caption}"` : ''))}
          </p>

          {/* Dots Indicator */}
          {discovery.cards && discovery.cards.length > 1 && (
            <div style={{ 
              position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 6 
            }}>
              {discovery.cards.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: activeCard === i ? 6 : 4,
                    height: activeCard === i ? 6 : 4,
                    borderRadius: '50%',
                    background: activeCard === i ? '#fff' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Action bar BELOW the card ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 8px 0',
      }}>
        {/* Left: Heart + count + Comment */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Heart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <motion.button
              onClick={handleLike}
              whileTap={{ scale: 0.8 }}
              className="icon-button-hover"
              style={{
                position: 'relative', background: 'none', border: 'none',
                cursor: 'pointer', padding: '4px',
                color: isLiked ? '#e74c6f' : 'var(--text-muted)',
                transition: 'color 0.3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <AnimatePresence>
                {showRipple && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0.8 }}
                    animate={{ scale: 3, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                      position: 'absolute', width: '20px', height: '20px',
                      borderRadius: '50%', background: 'rgba(231, 76, 111, 0.3)',
                    }}
                  />
                )}
              </AnimatePresence>
              <svg width="20" height="20" viewBox="0 0 24 24"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </motion.button>
            <span style={{
              fontSize: '0.75rem',
              color: isLiked ? '#e74c6f' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', transition: 'color 0.3s',
            }}>
              {likeCount}
            </span>
          </div>

          {/* Comment icon */}
          <motion.button
            onClick={() => setShowComments(!showComments)}
            whileTap={{ scale: 0.8 }}
            className="icon-button-hover"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
              color: showComments ? 'var(--accent-gold)' : 'var(--text-muted)',
              transition: 'color 0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Comments"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </motion.button>
          {comments.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginLeft: -6 }}>
              {comments.length}
            </span>
          )}
        </div>

        {/* Center: Author username */}
        <button
          onClick={() => onUserTap?.(discovery.user)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
            fontSize: '0.75rem', color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)', letterSpacing: '0.02em', transition: 'color 0.3s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          {discovery.user}
        </button>

        {/* Right: Save & Delete icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {discovery.isMine && onDeletePost && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onDeletePost?.(discovery.id);
              }}
              whileTap={{ scale: 0.8 }}
              className="icon-button-hover"
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                color: 'var(--text-muted)', transition: 'color 0.3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#d97757'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              aria-label="Delete"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </motion.button>
          )}

          <motion.button
            onClick={handleSave}
            whileTap={{ scale: 0.8 }}
            className="icon-button-hover"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
              color: isSaved ? 'var(--accent-gold)' : 'var(--text-muted)',
              transition: 'color 0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label={isSaved ? 'Unsave' : 'Save'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* ── Comments Section ── */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden', padding: '0 8px' }}
          >
            <div style={{
              marginTop: 8, padding: '16px 16px',
              background: 'rgba(240, 235, 225, 0.02)',
              border: '1px solid rgba(240, 235, 225, 0.08)',
              borderRadius: 20,
            }}>
              {/* Existing comments */}
              {comments.length === 0 && (
                <p style={{
                  fontSize: '0.75rem', color: 'var(--text-muted)',
                  fontStyle: 'italic', textAlign: 'center', padding: '8px 0',
                }}>
                  No comments yet. Be the first.
                </p>
              )}

              {comments.map((c, ci) => (
                <div key={ci} style={{ marginBottom: 10 }}>
                  {/* Comment */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'rgba(200, 169, 110, 0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', color: 'var(--accent-gold)',
                      fontFamily: 'var(--font-heading)', flexShrink: 0,
                    }}>
                      {c.user[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', marginBottom: 2, fontWeight: 500 }}>
                        {c.user}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {c.text}
                      </p>
                      {/* Like & Reply buttons */}
                      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                        <button
                          onClick={() => toggleCommentLike(ci)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                            fontSize: '0.65rem', color: c.liked ? '#e74c6f' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: 3, transition: 'color 0.2s',
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24"
                            fill={c.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          Like
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(ci)
                            setCommentText(`@${c.user} `)
                          }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                            fontSize: '0.65rem', color: 'var(--text-muted)',
                          }}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {c.replies?.map((r, ri) => (
                    <div key={ri} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginLeft: 32, marginTop: 8 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'rgba(240, 235, 225, 0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.55rem', color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-heading)', flexShrink: 0,
                      }}>
                        {r.user[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', marginBottom: 1 }}>{r.user}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{r.text}</p>
                        <button
                          onClick={() => toggleReplyLike(ci, ri)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2,
                            fontSize: '0.6rem', color: r.liked ? '#e74c6f' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: 3,
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24"
                            fill={r.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          Like
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Comment input */}
              <div style={{
                display: 'flex', gap: 8, marginTop: comments.length > 0 ? 10 : 0,
                borderTop: comments.length > 0 ? '1px solid rgba(240,235,225,0.06)' : 'none',
                paddingTop: comments.length > 0 ? 10 : 0,
              }}>
                <input
                  type="text"
                  placeholder={replyingTo !== null ? 'Write a reply...' : 'Add a comment...'}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                  style={{
                    flex: 1, background: 'rgba(240,235,225,0.04)',
                    border: '1px solid rgba(240,235,225,0.08)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '8px 14px', color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)', fontSize: '0.8rem', outline: 'none',
                  }}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddComment}
                  style={{
                    background: commentText.trim() ? 'var(--accent-gold)' : 'rgba(240,235,225,0.06)',
                    border: 'none', borderRadius: 'var(--radius-pill)',
                    padding: '8px 14px', cursor: 'pointer',
                    color: commentText.trim() ? '#0D0D0D' : 'var(--text-muted)',
                    fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                    transition: 'all 0.3s',
                  }}
                >
                  Post
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
