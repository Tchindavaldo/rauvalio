import React from 'react'
import StatusBar from './shared/StatusBar'

const products = [
  { c: '#E8DFD1', n: 'Sac Lina', p: '89€' },
  { c: '#3B3B45', n: 'Bottines Aro', p: '149€', anchor: 'tap-product' },
  { c: '#C9D4C5', n: 'Foulard Soie', p: '45€' },
  { c: '#E6C9B8', n: 'Ceinture Tan', p: '38€' },
]

export default function HomeScreen() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#FAFAF7', position: 'relative', color: '#111', fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
      <StatusBar />
      <div style={{ paddingTop: 48, paddingLeft: 16, paddingRight: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: '#888', letterSpacing: 0.4 }}>Bonjour Léa</div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>Découvrir</div>
          </div>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>L</div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0F0EA', borderRadius: 10, padding: '8px 10px', fontSize: 11, color: '#999', marginBottom: 12 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          Rechercher
        </div>

        {/* Hero banner */}
        <div style={{
          height: 96, borderRadius: 12, marginBottom: 12,
          background: 'linear-gradient(120deg, #2A2A35 0%, #4A4A5A 100%)',
          position: 'relative', overflow: 'hidden', color: '#fff', padding: 12
        }}>
          <div style={{ fontSize: 9, opacity: 0.7, letterSpacing: 0.6 }}>SÉRIE PRINTEMPS</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4, lineHeight: 1.1 }}>−30% sur la<br/>nouvelle saison</div>
          <div style={{ position: 'absolute', right: -6, bottom: -6, width: 60, height: 60, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}/>
          <div style={{ position: 'absolute', right: 14, bottom: 22, width: 32, height: 32, borderRadius: 999, background: 'rgba(255,255,255,0.12)' }}/>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, fontSize: 10 }}>
          {['Tout', 'Sacs', 'Chaussures', 'Accessoires'].map((c, i) => (
            <div key={c} style={{
              padding: '4px 10px', borderRadius: 999,
              background: i === 0 ? '#111' : '#F0F0EA',
              color: i === 0 ? '#fff' : '#666',
              fontWeight: 500
            }}>{c}</div>
          ))}
        </div>

        {/* Product grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {products.map((p, i) => (
            <div key={i} data-anchor={p.anchor} style={{
              background: '#fff',
              borderRadius: 10,
              overflow: 'hidden',
              border: p.anchor ? '1.5px solid #4F8EF7' : '1px solid #EFEFE8',
              boxShadow: p.anchor ? '0 0 0 3px rgba(79,142,247,0.15)' : 'none',
            }}>
              <div style={{ height: 80, background: p.c, position: 'relative' }}>
                {i === 1 && (
                  <div style={{ position: 'absolute', top: 6, left: 6, fontSize: 8, padding: '2px 5px', background: '#111', color: '#fff', borderRadius: 4 }}>−30%</div>
                )}
              </div>
              <div style={{ padding: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 500 }}>{p.n}</div>
                <div style={{ fontSize: 9, color: '#888' }} className="price">{p.p}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, borderTop: '1px solid #ECECE5', background: '#fff', display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 6 }}>
        {[
          ['M0 18 L0 8 L9 0 L18 8 L18 18 Z', true],
          ['M2 4 L16 4 M2 9 L16 9 M2 14 L11 14', false],
          ['M9 0 L9 18 M0 9 L18 9', false],
          ['M3 6 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M9 12 v6', false],
        ].map(([d, active], i) => (
          <svg key={i} width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? '#111' : '#BBB'} strokeWidth="1.5">
            <path d={d as string}/>
          </svg>
        ))}
      </div>
    </div>
  )
}
