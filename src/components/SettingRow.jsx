import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

/**
 * Reusable row for the Settings screen.
 * Supports: toggle, chevron, value text, badge, custom right element.
 *
 * Props:
 *   icon       — emoji or small element rendered in a colored square
 *   iconBg     — background color for the icon square
 *   title      — row title
 *   desc       — optional subtitle
 *   onClick    — tap handler
 *   right      — any React node on the right side
 *   danger     — red-tinted text
 *   showChevron — show "›" arrow (default: false)
 *   value      — text shown to the right in muted color
 */
export default function SettingRow({
  icon, iconBg = '#222', title, desc, onClick, right,
  danger = false, showChevron = false, value, style = {},
}) {
  const [flash, setFlash] = useState(false)

  const handleClick = useCallback((e) => {
    if (onClick) onClick(e)
  }, [onClick])

  // Gold flash confirmation (called externally via ref or triggered after API)
  // For simplicity, the parent can pass a `flash` prop or call this method.

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.985 }}
      className="glass-hover"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        width: '100%',
        padding: '13px 16px',
        background: flash ? 'rgba(200,169,110,0.06)' : 'transparent',
        border: 'none',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left',
        borderRadius: 10,
        ...style,
      }}
    >
      {/* Icon square */}
      {icon && (
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', flexShrink: 0,
        }}>
          {icon}
        </div>
      )}

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: danger ? '#C45050' : 'var(--text-primary)',
          fontWeight: 400,
          lineHeight: 1.3,
        }}>
          {title}
        </p>
        {desc && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            marginTop: 2,
            lineHeight: 1.3,
          }}>
            {desc}
          </p>
        )}
      </div>

      {/* Value text */}
      {value && (
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          flexShrink: 0,
        }}>
          {value}
        </span>
      )}

      {/* Right element (toggle, badge, etc.) */}
      {right}

      {/* Chevron */}
      {showChevron && (
        <span style={{
          color: 'var(--text-muted)',
          fontSize: '1.1rem',
          lineHeight: 1,
          flexShrink: 0,
          marginLeft: right ? 0 : 4,
        }}>
          ›
        </span>
      )}
    </motion.button>
  )
}
