import React from 'react'
import StatusBar from './shared/StatusBar'

export default function CheckoutScreen() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#FAFAF7', color: '#111', fontFamily: 'Space Grotesk, system-ui, sans-serif', position: 'relative' }}>
      <StatusBar />
      <div style={{ paddingTop: 48, padding: '48px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Paiement</div>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#888', marginBottom: 14 }}>
          <span style={{ color: '#3FA86A' }}>● Panier</span>
          <span>—</span>
          <span style={{ color: '#111', fontWeight: 600 }}>● Adresse</span>
          <span>—</span>
          <span>○ Paiement</span>
        </div>

        {/* Address */}
        <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Adresse de livraison</div>
        <div style={{ background: '#fff', border: '1px solid #ECECE5', borderRadius: 10, padding: 10, marginBottom: 12 }}>
          {['Léa Marchetti', '12 rue du Faubourg, Apt 4', 'Code postal · Ville'].map((text, i) => (
            <div key={i} style={{
              fontSize: 10,
              padding: '6px 0',
              borderBottom: i < 2 ? '1px solid #F2F2EC' : 'none',
              color: i < 2 ? '#111' : '#888'
            }}>
              {text}
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Récapitulatif</div>
        <div style={{ background: '#fff', border: '1px solid #ECECE5', borderRadius: 10, padding: 10, fontSize: 10, color: '#666' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>3 articles</span><span className="price">283€</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Livraison express</span><span>Offerte</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>TVA incluse</span><span className="price">42€</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid #EFEFE8', fontSize: 12, color: '#111', fontWeight: 600 }}>
            <span>Total</span><span className="price">253€</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
        <button style={{ width: '100%', height: 40, background: '#111', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Payer 253€
        </button>
      </div>
    </div>
  )
}
