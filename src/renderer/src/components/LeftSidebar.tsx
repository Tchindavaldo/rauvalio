import React from 'react'

const IcoCanvas = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <path d="M14 17.5h7M17.5 14v7"/>
  </svg>
)

const IcoMemory = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3v1a3 3 0 0 0 3 3M15 3a3 3 0 0 1 3 3v1a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3v1a3 3 0 0 1-3 3M9 8h6M9 12h6M9 16h6"/>
  </svg>
)

const IcoAgents = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="8" r="3"/>
    <path d="M5 21v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1"/>
    <circle cx="19" cy="5" r="1.5"/>
    <circle cx="5" cy="5" r="1.5"/>
  </svg>
)

const IcoHistory = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="M12 7v5l3 2"/>
  </svg>
)

const IcoSettings = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
  </svg>
)

const navItems = [
  { icon: <IcoCanvas />, label: 'Canvas', active: true },
  { icon: <IcoMemory />, label: 'Mémoire' },
  { icon: <IcoAgents />, label: 'Agents', badge: 5 },
  { icon: <IcoHistory />, label: 'Historique' },
]

export default function LeftSidebar() {
  return (
    <div style={{
      width: 48,
      background: '#0C0C13',
      borderRight: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px 0',
      gap: 4,
      flexShrink: 0,
    }}>
      {navItems.map((item, i) => (
        <div
          key={i}
          className={`icon-btn${item.active ? ' active' : ''}`}
          style={{ position: 'relative' }}
          title={item.label}
        >
          {item.icon}
          {item.badge != null && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              background: 'var(--accent)', color: 'white',
              fontSize: 8, padding: '1px 4px', borderRadius: 999,
              fontWeight: 600, lineHeight: 1
            }}>{item.badge}</span>
          )}
        </div>
      ))}

      <div style={{ flex: 1 }}/>
      <div className="icon-btn" title="Settings"><IcoSettings /></div>
      <div style={{
        width: 28, height: 28, marginTop: 6,
        borderRadius: 999,
        background: 'linear-gradient(135deg, #4F8EF7, #A988FF)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 600
      }}>YK</div>
    </div>
  )
}
