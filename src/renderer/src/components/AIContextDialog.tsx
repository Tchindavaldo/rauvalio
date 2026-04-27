import React, { useState } from 'react'

const IcoSpark = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6 7.7 7.7M16.3 16.3l2.1 2.1M5.6 18.4 7.7 16.3M16.3 7.7l2.1-2.1"/>
  </svg>
)

const IcoArrow = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
)

export default function AIContextDialog() {
  const [draft, setDraft] = useState('')

  return (
    <div className="glass-strong" style={{
      width: 340,
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 20px 60px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,142,247,0.25), 0 0 60px -10px rgba(79,142,247,0.3)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: 'linear-gradient(135deg, #4F8EF7, #A988FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <IcoSpark />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Modifier ce composant</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>
              Bouton « Commander maintenant »
            </div>
          </div>
        </div>
        <button style={{ color: 'var(--text-mute)' }}>✕</button>
      </div>

      {/* Source location */}
      <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-dim)' }} className="mono">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        ProductScreen.tsx
        <span style={{ color: 'var(--text-mute)' }}>:</span>
        <span style={{ color: 'var(--accent-2)' }}>L142</span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-mute)' }}>2 routes</span>
      </div>

      {/* Suggestion card */}
      <div style={{
        margin: '0 14px 12px', padding: 12, borderRadius: 10,
        background: 'linear-gradient(180deg, rgba(79,142,247,0.10), rgba(79,142,247,0.04))',
        border: '1px solid rgba(79,142,247,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 10, color: 'var(--accent-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--accent)', display: 'inline-block' }}/>
          Suggestion contextuelle
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text)' }}>
          Je vois que ce bouton mène vers{' '}
          <span style={{ background: 'rgba(79,142,247,0.15)', padding: '1px 5px', borderRadius: 3, color: 'var(--accent-2)' }}>2 destinations</span>
          {' '}selon l'état auth. Ajouter un état{' '}
          <span className="mono" style={{ color: 'var(--accent-2)' }}>loading</span>
          {' '}pendant la vérification ?
        </div>
        <div className="mono" style={{
          marginTop: 10, padding: 8, borderRadius: 6,
          background: 'rgba(0,0,0,0.3)', fontSize: 10, lineHeight: 1.55,
          color: 'var(--text-dim)'
        }}>
          <div><span style={{ color: 'var(--text-mute)' }}>142</span> &lt;Pressable onPress=&#123;handleOrder&#125;&gt;</div>
          <div style={{ background: 'rgba(63,214,138,0.08)', color: 'var(--green)' }}>
            + &nbsp;&nbsp;&nbsp;&nbsp;&#123;loading ? &lt;Spinner/&gt; : 'Commander'&#125;
          </div>
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '0 14px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(0,0,0,0.35)', border: '1px solid var(--line-2)'
        }}>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Décris la modification…"
            style={{ flex: 1, background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--text)', border: 'none' }}
          />
          <span className="mono caret" style={{ color: 'var(--accent)', fontSize: 12 }}>{draft ? '' : '|'}</span>
          <span className="mono" style={{ fontSize: 9, color: 'var(--text-mute)', padding: '2px 5px', border: '1px solid var(--line-2)', borderRadius: 4 }}>↵</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ fontSize: 10, color: 'var(--text-mute)', marginRight: 'auto' }} className="mono">claude-opus · 2.4s</div>
        <button className="btn-ghost" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11 }}>Ignorer</button>
        <button className="btn-primary" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
          Appliquer <IcoArrow />
        </button>
      </div>
    </div>
  )
}
