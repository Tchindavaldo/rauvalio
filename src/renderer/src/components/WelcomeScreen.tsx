import React, { useState } from 'react'

interface Props {
  onProjectOpened: (path: string) => void
}

export default function WelcomeScreen({ onProjectOpened }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleOpen() {
    setLoading(true)
    const rauvalio = (window as unknown as { rauvalio: { openProject: () => Promise<string | null> } }).rauvalio
    const path = await rauvalio.openProject()
    setLoading(false)
    if (path) onProjectOpened(path)
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-deep)',
      gap: 0,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <svg width="48" height="48" viewBox="0 0 20 20" fill="none">
          <path d="M3 3 L17 3 L17 9 L10 17 L3 9 Z" stroke="#4F8EF7" strokeWidth="1.4" fill="rgba(79,142,247,0.1)"/>
          <circle cx="10" cy="8" r="1.8" fill="#4F8EF7"/>
        </svg>
      </div>

      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3, marginBottom: 8 }}>
        Rauvalio
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 48, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
        Canvas vivant de ton projet.<br/>Ouvre un dossier pour commencer.
      </div>

      <button
        onClick={handleOpen}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 24px',
          background: loading ? 'var(--bg-elev)' : '#4F8EF7',
          color: loading ? 'var(--text-dim)' : '#fff',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? 'default' : 'pointer',
          transition: 'background 0.15s, opacity 0.15s',
          border: 'none',
          fontFamily: 'inherit',
        }}
      >
        {loading ? (
          <>
            <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--amber)', display: 'inline-block' }} />
            Scan en cours…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Ouvrir un projet
          </>
        )}
      </button>

      <div style={{ marginTop: 48, display: 'flex', gap: 32, fontSize: 10, color: 'var(--text-mute)', fontFamily: 'JetBrains Mono, monospace' }}>
        <span>React · Next.js · Expo</span>
        <span style={{ color: 'var(--line-2)' }}>·</span>
        <span>TypeScript · TSX</span>
      </div>
    </div>
  )
}
