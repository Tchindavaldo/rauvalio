import React from 'react'

export default function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 22px 0',
      fontFamily: 'Space Grotesk, system-ui, sans-serif',
      fontSize: 11,
      fontWeight: 600,
      color: dark ? '#fff' : '#111',
      zIndex: 11
    }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <svg width="16" height="10" viewBox="0 0 16 10">
          <path d="M1 9 L1 6 M5 9 L5 4 M9 9 L9 2 M13 9 L13 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <svg width="14" height="10" viewBox="0 0 14 10">
          <path d="M7 8a4 4 0 0 1 4-4 M7 8a7 7 0 0 1 7-7" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <circle cx="7" cy="8" r="1" fill="currentColor"/>
        </svg>
        <svg width="22" height="10" viewBox="0 0 22 10">
          <rect x="0.5" y="1" width="18" height="8" rx="2" stroke="currentColor" fill="none"/>
          <rect x="2" y="2.5" width="13" height="5" rx="1" fill="currentColor"/>
          <rect x="19.5" y="3.5" width="1.5" height="3" fill="currentColor" rx="0.5"/>
        </svg>
      </span>
    </div>
  )
}
