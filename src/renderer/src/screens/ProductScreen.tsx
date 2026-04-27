import React from 'react'
import StatusBar from './shared/StatusBar'

const sizes = ['37', '38', '39', '40', '41']

export default function ProductScreen() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#FAFAF7', position: 'relative', color: '#111', fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
      <StatusBar />
      <div style={{ paddingTop: 44 }}>
        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 14px 8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </div>

        {/* Hero image */}
        <div style={{
          margin: '0 14px', height: 200, borderRadius: 14,
          background: 'linear-gradient(135deg, #1F1F28 0%, #3A3A48 60%, #5A5A6E 100%)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 35%, rgba(255,255,255,0.18), transparent 55%)' }}/>
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: i===0?14:5, height: 5, borderRadius: 3, background: i===0?'#fff':'rgba(255,255,255,0.4)' }}/>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ padding: '14px 16px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Bottines Aro</div>
            <div style={{ fontSize: 14, fontWeight: 600 }} className="price">149€</div>
          </div>
          <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>Cuir grainé · Édition limitée</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 9, color: '#666' }}>
            <span style={{ color: '#F2B544' }}>★★★★★</span> 4.8 · 124 avis
          </div>
        </div>

        {/* Size selector */}
        <div style={{ padding: '0 16px 10px' }}>
          <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Taille</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {sizes.map((s, i) => (
              <div key={s} style={{
                width: 32, height: 32, borderRadius: 8,
                border: i===2 ? '1.5px solid #111' : '1px solid #E2E2DA',
                background: i===2 ? '#111' : '#fff',
                color: i===2 ? '#fff' : '#111',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 500
              }}>{s}</div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ padding: '6px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            data-anchor="add-to-cart"
            style={{
              height: 38, borderRadius: 10, border: '1px solid #111',
              background: '#fff', color: '#111', fontSize: 11, fontWeight: 600,
              width: '100%'
            }}
          >
            Ajouter au panier
          </button>
          <button
            data-anchor="order-now"
            style={{
              height: 38, borderRadius: 10, background: '#111',
              color: '#fff', fontSize: 11, fontWeight: 600,
              width: '100%', position: 'relative'
            }}
          >
            Commander maintenant
          </button>
        </div>
      </div>
    </div>
  )
}
