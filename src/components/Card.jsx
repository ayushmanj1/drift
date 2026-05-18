import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'

export default function Card({ discovery, index = 0, onLike, onSave, onUserTap, onDeletePost, hideOptions = false }) {
  const cardRef = useRef(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(discovery.resonated || 0)
  const [showRipple, setShowRipple] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [shareImage, setShareImage] = useState(null)

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

  const handleShareClick = async (e) => {
    e.stopPropagation();
    try {
      if (!cardRef.current) return;
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2
      });
      const dataUrl = canvas.toDataURL('image/png');
      setShareImage(dataUrl);
      setShowShareMenu(true);
    } catch (err) {
      console.error('Error generating share image', err);
    }
  }

  const handleNativeShare = async () => {
    try {
      const res = await fetch(shareImage);
      const blob = await res.blob();
      const file = new File([blob], 'drift-quote.png', { type: 'image/png' });
      const shareData = { title: discovery.title || 'Drift', text: 'Found this on Drift', files: [file] };
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
      } else if (navigator.share) {
        await navigator.share({ title: shareData.title, text: `${shareData.text}\n${window.location.href}` });
      }
    } catch (err) {
      console.error('Error sharing', err);
    }
  }

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = shareImage;
    link.download = 'drift-quote.png';
    link.click();
  }

  return (
    <div>
      {/* ── The Card ── */}
      <motion.div
        ref={cardRef}
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
          {!hideOptions && discovery.isMine && onDeletePost && (
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

          {/* Share Button */}
          {!hideOptions && (
            <motion.button
              id={`share-btn-${discovery.id}`}
              onClick={handleShareClick}
            whileTap={{ scale: 0.8 }}
            className="icon-button-hover"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
              color: 'var(--text-muted)', transition: 'color 0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            aria-label="Share"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
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

      {/* ── Custom Share Menu ── */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareMenu(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
              zIndex: 9999, display: 'flex', flexDirection: 'column',
              justifyContent: 'flex-end', alignItems: 'center'
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '500px',
                background: 'var(--bg-secondary)',
                borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column', gap: '24px',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>Share Drop</h3>
                <button onClick={() => setShowShareMenu(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {shareImage && (
                <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', maxHeight: '35vh', display: 'flex', justifyContent: 'center', background: '#000', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                  <img src={shareImage} alt="Preview" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                {/* Download */}
                <button onClick={downloadImage} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(240, 235, 225, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>Save</span>
                </button>

                {/* WhatsApp */}
                <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>WhatsApp</span>
                </button>

                {/* Copy Link */}
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Copied!'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(240, 235, 225, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>Copy Link</span>
                </button>

                {/* More / Native */}
                <button onClick={handleNativeShare} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(240, 235, 225, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>More</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
