/* Phone screen contents — simulated mobile UI per page */

const StatusBar = ({ dark = false }) => (
  <>
    <div className={"phone-status" + (dark ? " dark" : "")}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <svg width="16" height="10" viewBox="0 0 16 10"><path d="M1 9 L1 6 M5 9 L5 4 M9 9 L9 2 M13 9 L13 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        <svg width="14" height="10" viewBox="0 0 14 10"><path d="M7 8a4 4 0 0 1 4-4 M7 8a7 7 0 0 1 7-7" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/><circle cx="7" cy="8" r="1" fill="currentColor"/></svg>
        <svg width="22" height="10" viewBox="0 0 22 10"><rect x="0.5" y="1" width="18" height="8" rx="2" stroke="currentColor" fill="none"/><rect x="2" y="2.5" width="13" height="5" rx="1" fill="currentColor"/><rect x="19.5" y="3.5" width="1.5" height="3" fill="currentColor" rx="0.5"/></svg>
      </span>
    </div>
  </>
);

/* ---------- HOME ---------- */
const HomeScreen = () => (
  <div style={{ width: '100%', height: '100%', background: '#FAFAF7', position: 'relative', color: '#111', fontFamily: 'Space Grotesk' }}>
    <StatusBar />
    <div style={{ paddingTop: 48, paddingLeft: 16, paddingRight: 16 }}>
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
            color: i === 0 ? '#fff' : '#666', fontWeight: 500
          }}>{c}</div>
        ))}
      </div>
      {/* Product grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { c: '#E8DFD1', n: 'Sac Lina', p: '89€' },
          { c: '#3B3B45', n: 'Bottines Aro', p: '149€', anchor: 'tap-product' },
          { c: '#C9D4C5', n: 'Foulard Soie', p: '45€' },
          { c: '#E6C9B8', n: 'Ceinture Tan', p: '38€' },
        ].map((p, i) => (
          <div key={i} data-anchor={p.anchor} style={{
            background: '#fff', borderRadius: 10, overflow: 'hidden',
            border: p.anchor ? '1.5px solid #4F8EF7' : '1px solid #EFEFE8',
            boxShadow: p.anchor ? '0 0 0 3px rgba(79,142,247,0.15)' : 'none',
            position: 'relative'
          }}>
            <div style={{ height: 80, background: p.c, position: 'relative' }}>
              {i === 1 && <div style={{ position: 'absolute', top: 6, left: 6, fontSize: 8, padding: '2px 5px', background: '#111', color: '#fff', borderRadius: 4 }}>−30%</div>}
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
        ['M0 18 L0 8 L9 0 L18 8 L18 18 Z', 1],
        ['M2 4 L16 4 M2 9 L16 9 M2 14 L11 14', 0],
        ['M9 0 L9 18 M0 9 L18 9', 0],
        ['M3 6 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M9 12 v6', 0],
      ].map((p, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={p[1] ? '#111' : '#BBB'} strokeWidth="1.5"><path d={p[0]}/></svg>
      ))}
    </div>
  </div>
);

/* ---------- PRODUCT ---------- */
const ProductScreen = ({ buttonRef }) => (
  <div style={{ width: '100%', height: '100%', background: '#FAFAF7', position: 'relative', color: '#111', fontFamily: 'Space Grotesk' }}>
    <StatusBar />
    <div style={{ paddingTop: 44 }}>
      {/* nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 14px 8px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
      </div>
      {/* Image */}
      <div style={{
        margin: '0 14px', height: 200, borderRadius: 14,
        background: 'linear-gradient(135deg, #1F1F28 0%, #3A3A48 60%, #5A5A6E 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 35%, rgba(255,255,255,0.18), transparent 55%)' }}/>
        <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ width: i===0?14:5, height: 5, borderRadius: 3, background: i===0?'#fff':'rgba(255,255,255,0.4)' }}/>)}
        </div>
      </div>
      {/* Title row */}
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
          {['37','38','39','40','41'].map((s, i) => (
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
        <button data-anchor="add-to-cart" style={{
          height: 38, borderRadius: 10, border: '1px solid #111', background: '#fff', color: '#111',
          fontSize: 11, fontWeight: 600
        }}>Ajouter au panier</button>
        <button ref={buttonRef} data-anchor="order-now" data-source-button style={{
          height: 38, borderRadius: 10, background: '#111', color: '#fff',
          fontSize: 11, fontWeight: 600, position: 'relative'
        }}>
          Commander maintenant
        </button>
      </div>
    </div>
  </div>
);

/* ---------- CART ---------- */
const CartScreen = () => (
  <div style={{ width: '100%', height: '100%', background: '#FAFAF7', color: '#111', fontFamily: 'Space Grotesk', position: 'relative' }}>
    <StatusBar />
    <div style={{ paddingTop: 48, padding: '48px 16px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Mon panier</div>
        <div style={{ fontSize: 10, color: '#888' }}>3 articles</div>
      </div>
      {[
        { c: '#3B3B45', n: 'Bottines Aro', s: 'Taille 39', p: '149€' },
        { c: '#E8DFD1', n: 'Sac Lina', s: 'Beige', p: '89€' },
        { c: '#C9D4C5', n: 'Foulard Soie', s: 'Vert sauge', p: '45€' },
      ].map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 10, background: it.c }}/>
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
      <button data-anchor="checkout-cta" data-source-button style={{ width: '100%', height: 40, background: '#111', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>Passer commande</button>
    </div>
  </div>
);

/* ---------- CHECKOUT ---------- */
const CheckoutScreen = () => (
  <div style={{ width: '100%', height: '100%', background: '#FAFAF7', color: '#111', fontFamily: 'Space Grotesk', position: 'relative' }}>
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
        {['Nom complet', 'Adresse', 'Code postal · Ville'].map((ph, i) => (
          <div key={i} style={{
            fontSize: 10, padding: '6px 0',
            borderBottom: i < 2 ? '1px solid #F2F2EC' : 'none',
            color: i < 2 ? '#111' : '#888'
          }}>
            {i === 0 ? 'Léa Marchetti' : i === 1 ? '12 rue du Faubourg, Apt 4' : ph}
          </div>
        ))}
      </div>
      {/* Order summary */}
      <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Récapitulatif</div>
      <div style={{ background: '#fff', border: '1px solid #ECECE5', borderRadius: 10, padding: 10, fontSize: 10, color: '#666' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>3 articles</span><span className="price">283€</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Livraison express</span><span className="price">Offerte</span></div>
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
);

/* ---------- LOGIN ---------- */
const LoginScreen = () => (
  <div style={{ width: '100%', height: '100%', background: '#0E0E14', color: '#fff', fontFamily: 'Space Grotesk', position: 'relative' }}>
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
        <button data-anchor="login-cta" data-source-button style={{ width: '100%', marginTop: 16, height: 40, borderRadius: 10, background: '#fff', color: '#111', fontSize: 11, fontWeight: 600 }}>Se connecter</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0', color: '#444', fontSize: 9 }}>
          <div style={{ flex: 1, height: 1, background: '#22222C' }}/> ou <div style={{ flex: 1, height: 1, background: '#22222C' }}/>
        </div>
        <button style={{ width: '100%', height: 38, borderRadius: 10, background: '#1A1A24', border: '1px solid #2A2A38', color: '#ddd', fontSize: 10, fontWeight: 500 }}>Continuer avec Apple</button>
      </div>
    </div>
    <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: '#666' }}>
      Pas encore de compte ? <span style={{ color: '#fff' }}>Créer un compte</span>
    </div>
  </div>
);

Object.assign(window, { HomeScreen, ProductScreen, CartScreen, CheckoutScreen, LoginScreen });
