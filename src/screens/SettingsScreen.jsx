import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SettingRow from '../components/SettingRow'
import ToggleSwitch from '../components/ToggleSwitch'
import ThemeSelector from '../components/ThemeSelector'
import ProfileBanner from '../components/ProfileBanner'
import BottomSheet from '../components/BottomSheet'

/* ─── Section label ─────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: '0.6rem', color: 'var(--text-muted)',
      letterSpacing: '0.14em', textTransform: 'uppercase',
      fontFamily: 'var(--font-body)', fontWeight: 600,
      padding: '18px 18px 8px',
    }}>
      {children}
    </p>
  )
}

/* ─── Section card ──────────────────────────────────────────── */
function SectionCard({ children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 14,
      border: '0.5px solid var(--glass-border)',
      overflow: 'hidden',
      marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

/* ─── Divider ───────────────────────────────────────────────── */
function Divider() {
  return <div style={{ height: 0.5, background: 'var(--glass-border)', marginLeft: 60 }} />
}

/* ─── Confirmation Dialog ───────────────────────────────────── */
function ConfirmDialog({ open, title, message, confirmLabel, danger, onConfirm, onCancel, requireText }) {
  const [typed, setTyped] = useState('')

  if (!open) return null

  const canConfirm = requireText ? typed === requireText : true

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{
              position: 'fixed', inset: 0, zIndex: 9500,
              background: 'rgba(0,0,0,0.55)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9501,
              background: 'var(--bg-card)',
              borderRadius: 18,
              border: '0.5px solid var(--glass-border)',
              padding: '28px 24px 22px',
              width: 'min(340px, 88vw)',
              textAlign: 'center',
            }}
          >
            <h3 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.05rem',
              color: 'var(--text-primary)', fontWeight: 400, marginBottom: 10,
            }}>
              {title}
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.78rem',
              color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20,
            }}>
              {message}
            </p>

            {requireText && (
              <input
                type="text"
                placeholder={`Type "${requireText}" to confirm`}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
                  borderRadius: 10, color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                  outline: 'none', marginBottom: 18,
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = danger ? '#C45050' : 'var(--accent-gold)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
              />
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 10,
                  background: 'var(--bg-secondary)', border: 'none',
                  color: 'var(--text-secondary)', fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={!canConfirm}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 10,
                  background: danger ? '#C45050' : 'var(--accent-gold)',
                  border: 'none',
                  color: danger ? '#fff' : '#0D0D0D',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem', fontWeight: 600,
                  cursor: canConfirm ? 'pointer' : 'default',
                  opacity: canConfirm ? 1 : 0.35,
                  transition: 'opacity 0.2s',
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── Helper: apply all classes to <html> ────────────────────── */
function applySettings(theme, fontStyle, aesthetic) {
  const html = document.documentElement

  // Theme classes
  html.classList.remove('theme-warm', 'theme-auto')
  if (theme === 'warm') html.classList.add('theme-warm')
  else if (theme === 'auto') html.classList.add('theme-auto')

  // Font classes
  html.classList.remove('font-serif', 'font-sans')
  if (fontStyle === 'serif') html.classList.add('font-serif')
  else if (fontStyle === 'sans') html.classList.add('font-sans')
  // 'mixed' = default, no class needed

  // Aesthetic classes
  html.classList.remove('no-grain', 'aesthetic-glass')
  if (aesthetic === 'minimal') html.classList.add('no-grain')
  else if (aesthetic === 'glassmorphism') html.classList.add('aesthetic-glass')
  // 'film grain' = default, no class needed
}

/* ─── SETTINGS SCREEN ───────────────────────────────────────── */
export default function SettingsScreen({ onBack, onLogout, userProfile = {}, onProfileUpdate }) {
  // ── State ──────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem('drift-theme') || 'dark')
  const [aesthetic, setAesthetic] = useState(() => localStorage.getItem('drift-aesthetic') || 'film grain')
  const [fontStyle, setFontStyle] = useState(() => localStorage.getItem('drift-font') || 'mixed')

  // Toggles
  const [showTasteMatches, setShowTasteMatches] = useState(true)
  const [notifResonance, setNotifResonance] = useState(true)
  const [notifTasteMatch, setNotifTasteMatch] = useState(true)
  const [notifMood, setNotifMood] = useState(false)
  const [notifCircle, setNotifCircle] = useState(true)
  const [hideFromMap, setHideFromMap] = useState(false)
  const [anonResonances, setAnonResonances] = useState(false)
  const [visibility, setVisibility] = useState('everyone')
  const [discoveryRadius, setDiscoveryRadius] = useState(10)

  // Bottom sheets
  const [sheetOpen, setSheetOpen] = useState(null)
  const [tasteInput, setTasteInput] = useState('')

  // Profile edit
  const [editField, setEditField] = useState(null) // null | 'username' | 'name' | 'bio'
  const [editValue, setEditValue] = useState('')

  // Dialogs
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Flash save feedback
  const [flashRow, setFlashRow] = useState(null)
  const triggerFlash = useCallback((key) => {
    setFlashRow(key)
    setTimeout(() => setFlashRow(null), 600)
  }, [])

  // ── Apply settings on mount ──────────────────────────────
  useEffect(() => {
    applySettings(theme, fontStyle, aesthetic)
  }, [])

  // ── Theme change handler ──────────────────────────────────
  const handleThemeChange = useCallback((id) => {
    setTheme(id)
    localStorage.setItem('drift-theme', id)
    applySettings(id, fontStyle, aesthetic)
    triggerFlash('theme')
  }, [triggerFlash, fontStyle, aesthetic])

  const handleAestheticChange = useCallback((val) => {
    setAesthetic(val)
    localStorage.setItem('drift-aesthetic', val)
    applySettings(theme, fontStyle, val)
    setSheetOpen(null)
    triggerFlash('aesthetic')
  }, [triggerFlash, theme, fontStyle])

  const handleFontChange = useCallback((val) => {
    setFontStyle(val)
    localStorage.setItem('drift-font', val)
    applySettings(theme, val, aesthetic)
    setSheetOpen(null)
    triggerFlash('font')
  }, [triggerFlash, theme, aesthetic])

  const handleLogout = useCallback(() => {
    setLogoutOpen(false)
    if (onLogout) onLogout()
  }, [onLogout])

  const handleDelete = useCallback(() => {
    setDeleteOpen(false)
    if (onLogout) onLogout()
  }, [onLogout])

  // ── Profile edit handlers ──────────────────────────────────
  const openProfileEdit = useCallback((field) => {
    setEditValue(userProfile[field] || '')
    setEditField(field)
  }, [userProfile])

  const saveProfileEdit = useCallback(() => {
    onProfileUpdate?.({ ...userProfile, [editField]: editValue })
    setEditField(null)
    triggerFlash('profile')
  }, [editField, editValue, userProfile, onProfileUpdate, triggerFlash])

  const handleProfilePhoto = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onProfileUpdate?.({ ...userProfile, photo: ev.target.result })
      triggerFlash('profile')
    }
    reader.readAsDataURL(file)
  }, [userProfile, onProfileUpdate, triggerFlash])

  // Row flash style helper
  const rowFlashStyle = (key) => flashRow === key ? {
    background: 'rgba(200,169,110,0.06)',
    transition: 'background 0.15s',
  } : {}

  const { photo, username, name, bio } = userProfile
  const displayName = username || name || 'drift.user'
  const displayBio = bio || tasteInput || 'No taste identity yet'

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        padding: '0 0 60px',
        overflowY: 'auto',
      }}
    >
      {/* Hidden photo input */}
      <input
        id="settings-photo-input"
        type="file"
        accept="image/*"
        onChange={handleProfilePhoto}
        style={{ display: 'none' }}
      />

      {/* ── HEADER ──────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '20px 18px 16px',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'linear-gradient(180deg, var(--bg-primary) 80%, transparent)',
      }}>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onBack}
          className="icon-button-hover"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </motion.button>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.25rem',
          fontWeight: 400,
          color: 'var(--text-primary)',
          letterSpacing: '0.06em',
        }}>
          settings
        </h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* ── PROFILE BANNER ────────────────────────────────── */}
        <ProfileBanner
          username={displayName}
          tasteIdentity={displayBio}
          photo={photo}
          onEditProfile={() => setSheetOpen('profile-edit')}
        />

        {/* ── APPEARANCE ────────────────────────────────────── */}
        <SectionLabel>Appearance</SectionLabel>
        <SectionCard>
          <div style={{ padding: '14px 16px 10px' }}>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.78rem',
              color: 'var(--text-secondary)', marginBottom: 10,
            }}>
              Theme
            </p>
            <ThemeSelector value={theme} onChange={handleThemeChange} />
          </div>
          <Divider />
          <SettingRow
            icon="✦"
            iconBg="rgba(200,169,110,0.15)"
            title="Aesthetic"
            value={aesthetic}
            showChevron
            onClick={() => setSheetOpen('aesthetic')}
            style={rowFlashStyle('aesthetic')}
          />
          <Divider />
          <SettingRow
            icon="Aa"
            iconBg="rgba(140,160,200,0.15)"
            title="Font style"
            value={fontStyle}
            showChevron
            onClick={() => setSheetOpen('font')}
            style={rowFlashStyle('font')}
          />
        </SectionCard>

        {/* ── TASTE & DISCOVERY ─────────────────────────────── */}
        <SectionLabel>Taste & Discovery</SectionLabel>
        <SectionCard>
          <SettingRow
            icon="◐"
            iconBg="rgba(200,169,110,0.15)"
            title="My interests"
            desc="Edit what draws you in"
            showChevron
            onClick={() => triggerFlash('interests')}
          />
          <Divider />
          <SettingRow
            icon="✎"
            iconBg="rgba(196,122,122,0.15)"
            title="Taste identity"
            desc="Your aura phrase"
            value={tasteInput.length > 22 ? tasteInput.slice(0, 22) + '…' : tasteInput}
            showChevron
            onClick={() => setSheetOpen('identity')}
          />
          <Divider />
          <SettingRow
            icon="◎"
            iconBg="rgba(100,180,140,0.15)"
            title="Discovery radius"
            value={`${discoveryRadius} km`}
            showChevron
            onClick={() => setSheetOpen('radius')}
          />
          <Divider />
          <SettingRow
            icon="♡"
            iconBg="rgba(200,169,110,0.15)"
            title="Show taste matches"
            desc="Others can see your match %"
            right={
              <ToggleSwitch
                on={showTasteMatches}
                onChange={(val) => { setShowTasteMatches(val); triggerFlash('taste') }}
              />
            }
            style={rowFlashStyle('taste')}
          />
        </SectionCard>

        {/* ── NOTIFICATIONS ─────────────────────────────────── */}
        <SectionLabel>Notifications</SectionLabel>
        <SectionCard>
          <SettingRow
            icon="◈"
            iconBg="rgba(200,169,110,0.15)"
            title="Like alerts"
            desc="When someone likes your drop"
            right={
              <ToggleSwitch
                on={notifResonance}
                onChange={(val) => { setNotifResonance(val); triggerFlash('n-res') }}
              />
            }
            style={rowFlashStyle('n-res')}
          />
          <Divider />
          <SettingRow
            icon="❋"
            iconBg="rgba(140,120,200,0.15)"
            title="New taste match"
            desc="When you match above 70%"
            right={
              <ToggleSwitch
                on={notifTasteMatch}
                onChange={(val) => { setNotifTasteMatch(val); triggerFlash('n-match') }}
              />
            }
            style={rowFlashStyle('n-match')}
          />
          <Divider />
          <SettingRow
            icon="☽"
            iconBg="rgba(100,140,180,0.15)"
            title="Tonight's mood"
            desc="A curated drop based on your day"
            right={
              <ToggleSwitch
                on={notifMood}
                onChange={(val) => { setNotifMood(val); triggerFlash('n-mood') }}
              />
            }
            style={rowFlashStyle('n-mood')}
          />
          <Divider />
          <SettingRow
            icon="◉"
            iconBg="rgba(100,180,140,0.15)"
            title="Private circle activity"
            right={
              <ToggleSwitch
                on={notifCircle}
                onChange={(val) => { setNotifCircle(val); triggerFlash('n-circle') }}
              />
            }
            style={rowFlashStyle('n-circle')}
          />
        </SectionCard>

        {/* ── PRIVACY ───────────────────────────────────────── */}
        <SectionLabel>Privacy</SectionLabel>
        <SectionCard>
          <SettingRow
            icon="◑"
            iconBg="rgba(140,160,200,0.15)"
            title="Profile visibility"
            value={visibility}
            showChevron
            onClick={() => setSheetOpen('visibility')}
          />
          <Divider />
          <SettingRow
            icon="⊘"
            iconBg="rgba(196,122,122,0.15)"
            title="Hide from map"
            desc="Your drops won't appear on the discovery map"
            right={
              <ToggleSwitch
                on={hideFromMap}
                onChange={(val) => { setHideFromMap(val); triggerFlash('hide-map') }}
              />
            }
            style={rowFlashStyle('hide-map')}
          />
          <Divider />
          <SettingRow
            icon="◌"
            iconBg="rgba(140,120,200,0.15)"
            title="Anonymous likes"
            desc="Others won't see you liked"
            right={
              <ToggleSwitch
                on={anonResonances}
                onChange={(val) => { setAnonResonances(val); triggerFlash('anon') }}
              />
            }
            style={rowFlashStyle('anon')}
          />
          <Divider />
          <SettingRow
            icon="⊗"
            iconBg="rgba(196,80,80,0.15)"
            title="Blocked accounts"
            showChevron
            right={
              <span style={{
                background: '#222', borderRadius: 10,
                padding: '2px 8px', fontSize: '0.6rem',
                color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
              }}>
                0
              </span>
            }
            onClick={() => triggerFlash('blocked')}
          />
        </SectionCard>

        {/* ── ACCOUNT ───────────────────────────────────────── */}
        <SectionLabel>Account</SectionLabel>
        <SectionCard>
          <SettingRow
            icon="✉"
            iconBg="rgba(100,140,180,0.15)"
            title="Email"
            value="user@drift.app"
            showChevron
            onClick={() => triggerFlash('email')}
          />
          <Divider />
          <SettingRow
            icon="⚿"
            iconBg="rgba(140,160,200,0.15)"
            title="Change password"
            showChevron
            onClick={() => triggerFlash('password')}
          />
          <Divider />
          <SettingRow
            icon="⤓"
            iconBg="rgba(100,180,140,0.15)"
            title="Export my data"
            desc="Download all your drops and collections"
            showChevron
            onClick={() => triggerFlash('export')}
          />
        </SectionCard>

        {/* ── DANGER ZONE ───────────────────────────────────── */}
        <SectionLabel>Danger Zone</SectionLabel>
        <SectionCard>
          <SettingRow
            icon="↪"
            iconBg="rgba(196,80,80,0.1)"
            title="Log out"
            danger
            onClick={() => setLogoutOpen(true)}
          />
          <Divider />
          <SettingRow
            icon="✕"
            iconBg="rgba(196,80,80,0.15)"
            title="Delete account"
            desc="This cannot be undone"
            danger
            onClick={() => setDeleteOpen(true)}
          />
        </SectionCard>

        {/* ── VERSION NOTE ──────────────────────────────────── */}
        <p style={{
          textAlign: 'center', padding: '36px 0 20px',
          fontFamily: 'var(--font-body)',
          fontSize: '0.6rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
        }}>
          drift · v1.0.0 · made with intention
        </p>
      </div>

      {/* ── BOTTOM SHEETS ───────────────────────────────────── */}

      {/* Aesthetic */}
      <BottomSheet open={sheetOpen === 'aesthetic'} onClose={() => setSheetOpen(null)} title="Aesthetic Theme">
        {['film grain', 'glassmorphism', 'minimal'].map((opt) => (
          <button
            key={opt}
            onClick={() => handleAestheticChange(opt)}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '14px 18px', borderRadius: 10,
              background: aesthetic === opt ? 'rgba(200,169,110,0.08)' : 'transparent',
              border: aesthetic === opt ? '1px solid rgba(200,169,110,0.2)' : '1px solid transparent',
              color: aesthetic === opt ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-body)', fontSize: '0.85rem',
              cursor: 'pointer', marginBottom: 6,
              transition: 'all 0.2s',
            }}
          >
            {opt}
          </button>
        ))}
      </BottomSheet>

      {/* Font Style */}
      <BottomSheet open={sheetOpen === 'font'} onClose={() => setSheetOpen(null)} title="Font Style">
        {[
          { id: 'serif', label: 'Serif', preview: 'Playfair Display', family: 'var(--font-heading)' },
          { id: 'sans', label: 'Sans-serif', preview: 'DM Sans', family: 'var(--font-body)' },
          { id: 'mixed', label: 'Mixed', preview: 'Serif headings + Sans body', family: 'var(--font-body)' },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleFontChange(opt.id)}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '14px 18px', borderRadius: 10,
              background: fontStyle === opt.id ? 'rgba(200,169,110,0.08)' : 'transparent',
              border: fontStyle === opt.id ? '1px solid rgba(200,169,110,0.2)' : '1px solid transparent',
              color: fontStyle === opt.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontFamily: opt.family, fontSize: '0.85rem',
              cursor: 'pointer', marginBottom: 6,
              transition: 'all 0.2s',
            }}
          >
            <span>{opt.label}</span>
            <span style={{
              display: 'block', fontSize: '0.65rem',
              color: 'var(--text-muted)', marginTop: 3,
              fontFamily: opt.family,
            }}>
              {opt.preview}
            </span>
          </button>
        ))}
      </BottomSheet>

      {/* Taste Identity */}
      <BottomSheet open={sheetOpen === 'identity'} onClose={() => setSheetOpen(null)} title="Your Taste Identity">
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.72rem',
          color: 'var(--text-muted)', marginBottom: 14, textAlign: 'center',
        }}>
          A short phrase that captures your vibe
        </p>
        <input
          type="text"
          value={tasteInput}
          onChange={(e) => setTasteInput(e.target.value)}
          maxLength={60}
          placeholder="Late-night melancholy. Warm cafés."
          className="ghost-input"
          style={{
            textAlign: 'center', fontStyle: 'italic',
            fontFamily: 'var(--font-heading)', marginBottom: 18,
          }}
        />
        <button
          onClick={() => { setSheetOpen(null); triggerFlash('identity') }}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 12,
            background: 'var(--accent-gold)', border: 'none',
            color: '#0D0D0D', fontFamily: 'var(--font-body)',
            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Save
        </button>
      </BottomSheet>

      {/* Visibility */}
      <BottomSheet open={sheetOpen === 'visibility'} onClose={() => setSheetOpen(null)} title="Profile Visibility">
        {['everyone', 'taste matches only', 'nobody'].map((opt) => (
          <button
            key={opt}
            onClick={() => { setVisibility(opt); setSheetOpen(null); triggerFlash('visibility') }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '14px 18px', borderRadius: 10,
              background: visibility === opt ? 'rgba(200,169,110,0.08)' : 'transparent',
              border: visibility === opt ? '1px solid rgba(200,169,110,0.2)' : '1px solid transparent',
              color: visibility === opt ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-body)', fontSize: '0.85rem',
              cursor: 'pointer', marginBottom: 6,
              transition: 'all 0.2s',
              textTransform: 'capitalize',
            }}
          >
            {opt}
          </button>
        ))}
      </BottomSheet>

      {/* Discovery Radius */}
      <BottomSheet open={sheetOpen === 'radius'} onClose={() => setSheetOpen(null)} title="Discovery Radius">
        <div style={{ padding: '10px 8px 20px' }}>
          <p style={{
            textAlign: 'center', fontFamily: 'var(--font-heading)',
            fontSize: '2rem', color: 'var(--accent-gold)',
            marginBottom: 6,
          }}>
            {discoveryRadius} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>km</span>
          </p>
          <input
            type="range"
            min="1" max="50" step="1"
            value={discoveryRadius}
            onChange={(e) => setDiscoveryRadius(parseInt(e.target.value))}
            style={{
              width: '100%', height: 4,
              appearance: 'none', WebkitAppearance: 'none',
              background: `linear-gradient(to right, var(--accent-gold) ${(discoveryRadius / 50) * 100}%, var(--bg-secondary) ${(discoveryRadius / 50) * 100}%)`,
              borderRadius: 2, outline: 'none',
              cursor: 'pointer',
            }}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: 8,
          }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>1 km</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>50 km</span>
          </div>
        </div>
        <button
          onClick={() => { setSheetOpen(null); triggerFlash('radius') }}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 12,
            background: 'var(--accent-gold)', border: 'none',
            color: '#0D0D0D', fontFamily: 'var(--font-body)',
            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Set Radius
        </button>
      </BottomSheet>

      {/* Profile Edit Menu */}
      <BottomSheet open={sheetOpen === 'profile-edit'} onClose={() => setSheetOpen(null)} title="Edit Profile">
        {[
          { key: 'photo', label: photo ? 'Change profile photo' : 'Add profile photo' },
          ...(photo ? [{ key: 'photo-delete', label: 'Remove profile photo', danger: true }] : []),
          { key: 'username', label: 'Edit username' },
          { key: 'name', label: 'Edit name' },
          { key: 'bio', label: 'Edit bio' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => {
              if (opt.key === 'photo') {
                document.getElementById('settings-photo-input').click()
                setSheetOpen(null)
              } else if (opt.key === 'photo-delete') {
                onProfileUpdate?.({ ...userProfile, photo: null })
                setSheetOpen(null)
                triggerFlash('profile')
              } else {
                setSheetOpen(null)
                openProfileEdit(opt.key)
              }
            }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '14px 18px', borderRadius: 10,
              background: 'transparent',
              border: '1px solid transparent',
              color: opt.danger ? '#d97757' : 'var(--text-primary)',
              fontFamily: 'var(--font-body)', fontSize: '0.85rem',
              cursor: 'pointer', marginBottom: 4,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {opt.label}
          </button>
        ))}
      </BottomSheet>

      {/* Profile Field Edit */}
      <AnimatePresence>
        {editField && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditField(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9100 }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9101,
                background: 'var(--bg-card)', borderRadius: '24px 24px 0 0',
                padding: '8px 24px 40px',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(240,235,225,0.1)', margin: '8px auto 20px' }} />
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '0.05em', textTransform: 'capitalize' }}>
                Edit {editField}
              </p>
              {editField === 'bio' ? (
                <textarea
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  placeholder="Something about your taste..."
                  rows={4}
                  autoFocus
                  style={{
                    width: '100%', background: 'rgba(240,235,225,0.03)',
                    border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)',
                    padding: '12px 14px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem', outline: 'none', resize: 'none',
                  }}
                />
              ) : (
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  placeholder={editField === 'username' ? '@yourhandle' : `Your ${editField}`}
                  autoFocus
                  style={{
                    width: '100%', background: 'rgba(240,235,225,0.03)',
                    border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)',
                    padding: '12px 14px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem', outline: 'none',
                  }}
                />
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={() => setEditField(null)} style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-pill)',
                  background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                }}>Cancel</button>
                <button onClick={saveProfileEdit} style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-pill)',
                  background: 'var(--accent-gold)', border: 'none',
                  color: '#0D0D0D', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.85rem',
                }}>Save</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── DIALOGS ─────────────────────────────────────────── */}
      <ConfirmDialog
        open={logoutOpen}
        title="Log out?"
        message="You can always drift back in."
        confirmLabel="Log out"
        danger
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete your account?"
        message="All your drops, collections, and taste data will be permanently erased. This cannot be undone."
        confirmLabel="Delete forever"
        danger
        requireText="DELETE"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </motion.div>
  )
}
