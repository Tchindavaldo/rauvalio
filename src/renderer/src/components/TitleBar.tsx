import React from 'react'

export default function TitleBar() {
  return (
    <div
      className="titlebar-drag"
      style={{
        height: 32,
        borderBottom: '1px solid var(--line)',
        background: '#0C0C13',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div className="titlebar-no-drag" style={{ display: 'flex', gap: 8 }}>
        <span className="tl tl-r"/>
        <span className="tl tl-y"/>
        <span className="tl tl-g"/>
      </div>

      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M3 3 L17 3 L17 9 L10 17 L3 9 Z" stroke="#4F8EF7" strokeWidth="1.4" fill="rgba(79,142,247,0.12)"/>
            <circle cx="10" cy="8" r="1.6" fill="#4F8EF7"/>
          </svg>
          <span style={{ fontWeight: 600, letterSpacing: 0.4 }}>Rauvalio</span>
        </div>
        <span style={{ color: 'var(--text-mute)' }}>·</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>~/projects/maison-vitelli</span>
        <span style={{ marginLeft: 4, padding: '1px 6px', fontSize: 9, borderRadius: 3, background: 'rgba(63, 214, 138, 0.12)', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>main</span>
      </div>

      <div className="titlebar-no-drag" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, fontSize: 10, color: 'var(--text-dim)' }}>
        <span className="mono">⌘K</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--green)', display: 'inline-block' }}/>
          Synced
        </span>
      </div>
    </div>
  )
}
