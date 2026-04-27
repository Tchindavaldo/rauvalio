import React from 'react'
import StatusBar from './shared/StatusBar'

export default function LoginScreen() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0E0E14', color: '#fff', fontFamily: 'Space Grotesk, system-ui, sans-serif', position: 'relative' }}>
      <StatusBar dark />
      <div style={{ paddingTop: 60, padding: '60px 18px 16px' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #4F8EF7, #A988FF)', marginBottom: 18 }}/>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Bon retour.</div>
        <div style={{ fontSize: 11, color: '#888' }}>Connectez-vous pour finaliser votre commande</div>

        <div style={{ marginTop: 26 }}>
          <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Email</div>
          <div style={{ background: '#1A1A24', border: '1px solid #2A2A38', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#ddd' }}>
            lea.m@hey.fr
          </div>

          <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6, marginTop: 12 }}>Mot de passe</div>
          <div style={{ background: '#1A1A24', border: '1px solid #2A2A38', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#ddd', letterSpacing: 4 }}>
            ••••••••
          </div>

          <div style={{ textAlign: 'right', fontSize: 9, color: '#888', marginTop: 8 }}>Mot de passe oublié ?</div>

          <button
            data-anchor="login-cta"
            style={{ width: '100%', marginTop: 16, height: 40, borderRadius: 10, background: '#fff', color: '#111', fontSize: 11, fontWeight: 600 }}
          >
            Se connecter
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0', color: '#444', fontSize: 9 }}>
            <div style={{ flex: 1, height: 1, background: '#22222C' }}/>
            ou
            <div style={{ flex: 1, height: 1, background: '#22222C' }}/>
          </div>

          <button style={{ width: '100%', height: 38, borderRadius: 10, background: '#1A1A24', border: '1px solid #2A2A38', color: '#ddd', fontSize: 10, fontWeight: 500 }}>
            Continuer avec Apple
          </button>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: '#666' }}>
        Pas encore de compte ? <span style={{ color: '#fff' }}>Créer un compte</span>
      </div>
    </div>
  )
}
