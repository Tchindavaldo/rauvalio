import React from 'react'
import StatusBar from './shared/StatusBar'

const cartItems = [
  { c: '#3B3B45', n: 'Bottines Aro', s: 'Taille 39', p: '149€' },
  { c: '#E8DFD1', n: 'Sac Lina', s: 'Beige', p: '89€' },
  { c: '#C9D4C5', n: 'Foulard Soie', s: 'Vert sauge', p: '45€' },
]

export default function CartScreen() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#FAFAF7', color: '#111', fontFamily: 'Space Grotesk, system-ui, sans-serif', position: 'relative' }}>
      <StatusBar />
      <div style={{ paddingTop: 48, padding: '48px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Mon panier</div>
          <div style={{ fontSize: 10, color: '#888' }}>3 articles</div>
        </div>

        {cartItems.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 10, background: it.c, flexShrink: 0 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{it.n}</div>
              <div style={{ fontSize: 9, color: '#888', marginTop: 2 }}>{it.s}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <div style={{ width: 18, height: 18, border: '1px solid #DDD', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</div>
                <div style={{ fontSize: 10 }}>1</div>
                <div style={{ width: 18, height: 18, border: '1px solid #DDD', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600 }} className="price">{it.p}</div>
          </div>
        ))}

        {/* Promo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: '#F0F0EA', borderRadius: 8, fontSize: 10, color: '#666', marginTop: 6 }}>
          <span style={{ color: '#3FA86A' }}>✓</span> Code "PRINT26" appliqué — −30€
        </div>

        {/* Totals */}
        <div style={{ marginTop: 14, fontSize: 10, color: '#666' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Sous-total</span><span className="price">283€</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Livraison</span><span>Offerte</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Réduction</span><span style={{ color: '#3FA86A' }}>−30€</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid #EFEFE8', fontSize: 12, color: '#111', fontWeight: 600 }}>
            <span>Total</span><span className="price">253€</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
        <button
          data-anchor="checkout-cta"
          style={{ width: '100%', height: 40, background: '#111', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 600 }}
        >
          Passer commande
        </button>
      </div>
    </div>
  )
}
