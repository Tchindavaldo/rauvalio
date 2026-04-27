import React, { useState } from 'react'

const IcoSpark = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6 7.7 7.7M16.3 16.3l2.1 2.1M5.6 18.4 7.7 16.3M16.3 7.7l2.1-2.1"/>
  </svg>
)

const suggestions = ["Ajoute l'auth Google", 'Optimise les perfs', 'Génère les tests']

export default function GlobalChat() {
  const [open, setOpen] = useState(true)
  const [input, setInput] = useState('')

  return (
    <div style={{
      position: 'absolute', bottom: 18,
      left: '50%', transform: 'translateX(-50%)',
      width: 380, zIndex: 25
    }}>
      <div className="glass-strong" style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)' }}>
        {open && (
          <div style={{ padding: '12px 14px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[0,1,2,3,4].map(i => (
                    <span
                      key={i}
                      className="pulse-dot"
                      style={{
                        width: 5, height: 5, borderRadius: 999,
                        background: 'var(--accent)',
                        animationDelay: `${i * 0.18}s`,
                        display: 'inline-block'
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>5 agents actifs</span>
              </div>
              <button onClick={() => setOpen(false)} style={{ color: 'var(--text-mute)', fontSize: 11 }}>⌄</button>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  className="suggest-pill mono"
                  style={{ padding: '4px 9px', borderRadius: 999, fontSize: 10 }}
                  onClick={() => setInput(s)}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          borderTop: open ? '1px solid rgba(255,255,255,0.05)' : 'none'
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: 'linear-gradient(135deg, #4F8EF7, #A988FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, color: 'white'
          }}>
            <IcoSpark />
          </div>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Question sur le projet…"
            style={{ flex: 1, background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--text)', border: 'none' }}
          />
          <span className="mono caret" style={{ color: 'var(--accent)', fontSize: 13 }}>|</span>
          <span className="mono" style={{ fontSize: 9, color: 'var(--text-mute)', padding: '2px 6px', border: '1px solid var(--line-2)', borderRadius: 4 }}>⌘ + ↵</span>
        </div>
      </div>
    </div>
  )
}
