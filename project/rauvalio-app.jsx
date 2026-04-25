/* Rauvalio main shell — pannable/zoomable canvas, DOM-anchored arrows */
const { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } = React;

/* ---------- ICONS ---------- */
const Ico = {
  canvas: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 17.5h7M17.5 14v7"/></svg>,
  memory: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3v1a3 3 0 0 0 3 3M15 3a3 3 0 0 1 3 3v1a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3v1a3 3 0 0 1-3 3M9 8h6M9 12h6M9 16h6"/></svg>,
  agents: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="3"/><path d="M5 21v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1"/><circle cx="19" cy="5" r="1.5"/><circle cx="5" cy="5" r="1.5"/></svg>,
  history: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  spark: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6 7.7 7.7M16.3 16.3l2.1 2.1M5.6 18.4 7.7 16.3M16.3 7.7l2.1-2.1"/></svg>,
  arrow: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
};

/* ---------- TITLE BAR ---------- */
const TitleBar = () => (
  <div style={{ height: 32, borderBottom: '1px solid var(--line)', background: '#0C0C13', display: 'flex', alignItems: 'center', padding: '0 12px', position: 'relative', flexShrink: 0 }}>
    <div style={{ display: 'flex', gap: 8 }}>
      <span className="tl tl-r"/><span className="tl tl-y"/><span className="tl tl-g"/>
    </div>
    <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <path d="M3 3 L17 3 L17 9 L10 17 L3 9 Z" stroke="#4F8EF7" strokeWidth="1.4" fill="rgba(79,142,247,0.12)"/>
          <circle cx="10" cy="8" r="1.6" fill="#4F8EF7"/>
        </svg>
        <span style={{ fontWeight: 600, letterSpacing: 0.4 }}>Rauvalio</span>
      </div>
      <span style={{ color: 'var(--text-mute)' }}>·</span>
      <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>~/projects/maison-vitelli</span>
      <span style={{ marginLeft: 4, padding: '1px 6px', fontSize: 9, borderRadius: 3, background: 'rgba(63, 214, 138, 0.12)', color: 'var(--green)', fontFamily: 'JetBrains Mono' }}>main</span>
    </div>
    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, fontSize: 10, color: 'var(--text-dim)' }}>
      <span className="mono">⌘K</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--green)', display: 'inline-block' }}/>
        Synced
      </span>
    </div>
  </div>
);

/* ---------- LEFT SIDEBAR ---------- */
const LeftSidebar = () => {
  const items = [
    { ico: Ico.canvas, label: 'Canvas', active: true },
    { ico: Ico.memory, label: 'Mémoire' },
    { ico: Ico.agents, label: 'Agents', badge: 5 },
    { ico: Ico.history, label: 'Historique' },
  ];
  return (
    <div style={{ width: 48, background: '#0C0C13', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: 4, flexShrink: 0 }}>
      {items.map((it, i) => (
        <div key={i} className={'icon-btn' + (it.active ? ' active' : '')} style={{ position: 'relative' }} title={it.label}>
          {it.ico}
          {it.badge && (<span style={{ position: 'absolute', top: 2, right: 2, background: 'var(--accent)', color: 'white', fontSize: 8, padding: '1px 4px', borderRadius: 999, fontWeight: 600, lineHeight: 1 }}>{it.badge}</span>)}
        </div>
      ))}
      <div style={{ flex: 1 }}/>
      <div className="icon-btn" title="Settings">{Ico.settings}</div>
      <div style={{ width: 28, height: 28, marginTop: 6, borderRadius: 999, background: 'linear-gradient(135deg, #4F8EF7, #A988FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>YK</div>
    </div>
  );
};

/* ---------- CANVAS TOOLBAR ---------- */
const CanvasToolbar = ({ zoom, setZoom, resetView }) => (
  <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8, zIndex: 20 }}>
    <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: 2, padding: 4, borderRadius: 10 }}>
      {[
        ['Cursor', <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 8-6 1-2 8z"/></svg>, true],
        ['Hand', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 11V6.5a1.5 1.5 0 0 0-3 0V11M15 11V4.5a1.5 1.5 0 0 0-3 0V11M12 11V4a1.5 1.5 0 0 0-3 0v9M9 11v-2a1.5 1.5 0 0 0-3 0v6.5a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6V8.5a1.5 1.5 0 0 0-3 0V11"/></svg>, false],
        ['Connect', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M5 12c0-3.5 3-6 6-6M19 12c0 3.5-3 6-6 6"/></svg>, false],
      ].map(([label, ico, active], i) => (
        <button key={i} title={label} style={{ padding: 6, borderRadius: 6, background: active ? 'rgba(79,142,247,0.16)' : 'transparent', color: active ? 'var(--accent)' : 'var(--text-dim)' }}>{ico}</button>
      ))}
    </div>
    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', borderRadius: 10, gap: 8, fontSize: 11, color: 'var(--text-dim)' }}>
      <span style={{ color: 'var(--text)' }} className="mono">{Math.round(zoom * 100)}%</span>
      <div style={{ width: 1, height: 12, background: 'var(--line-2)' }}/>
      <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} style={{ color: 'var(--text-mute)' }}>−</button>
      <button onClick={() => setZoom(z => Math.min(1.6, z + 0.1))} style={{ color: 'var(--text-mute)' }}>+</button>
      <div style={{ width: 1, height: 12, background: 'var(--line-2)' }}/>
      <button onClick={resetView} style={{ color: 'var(--text-mute)', fontSize: 10 }}>Fit</button>
    </div>
    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '4px 10px 4px 8px', borderRadius: 10, gap: 6, fontSize: 11, color: 'var(--text-dim)' }}>
      <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)', display: 'inline-block' }}/>
      <span>Live preview</span>
      <span className="mono" style={{ color: 'var(--text-mute)', fontSize: 10 }}>· iPhone 15</span>
    </div>
  </div>
);

const CanvasMinimap = () => (
  <div className="glass" style={{ position: 'absolute', bottom: 88, right: 286, width: 156, height: 100, borderRadius: 8, padding: 8, zIndex: 15 }}>
    <div style={{ fontSize: 9, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Map</div>
    <div style={{ position: 'relative', width: '100%', height: 70, borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)' }}>
      {[[10,30,16,22],[44,12,16,22],[78,30,16,22],[44,44,16,22],[112,30,16,22]].map(([x,y,w,h],i)=>(
        <div key={i} style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 2, background: i===1?'var(--accent)':'rgba(255,255,255,0.18)' }}/>
      ))}
      <div style={{ position: 'absolute', left: 30, top: 16, width: 90, height: 50, border: '1px solid var(--accent)', borderRadius: 3 }}/>
    </div>
  </div>
);

/* ---------- PHONE CARD ---------- */
const PhoneCard = ({ name, file, status, selected, ScreenComp, anchorId }) => (
  <div data-page-anchor={anchorId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
    <div className={'phone phone-hover' + (selected ? ' glow-pulse' : '')}>
      <div className="phone-screen">
        <div className="phone-notch"/>
        <ScreenComp />
      </div>
    </div>
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: status === 'analyzed' ? 'var(--green)' : status === 'analyzing' ? 'var(--amber)' : 'var(--text-mute)' }} className={status === 'analyzing' ? 'pulse-dot' : ''}/>
        <span style={{ fontWeight: 600, fontSize: 13, color: selected ? '#fff' : 'var(--text)' }}>{name}</span>
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--text-mute)' }}>{file}</div>
    </div>
  </div>
);

/* ---------- AI DIALOG ---------- */
const AIDialog = () => {
  const [draft, setDraft] = useState('');
  return (
    <div className="glass-strong" style={{ width: 340, borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,142,247,0.25), 0 0 60px -10px rgba(79,142,247,0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #4F8EF7, #A988FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{Ico.spark}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Modifier ce composant</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>Bouton « Commander maintenant »</div>
          </div>
        </div>
        <button style={{ color: 'var(--text-mute)' }}>✕</button>
      </div>
      <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-dim)' }} className="mono">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        ProductScreen.tsx<span style={{ color: 'var(--text-mute)' }}>:</span><span style={{ color: 'var(--accent-2)' }}>L142</span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-mute)' }}>2 routes</span>
      </div>
      <div style={{ margin: '0 14px 12px', padding: 12, borderRadius: 10, background: 'linear-gradient(180deg, rgba(79,142,247,0.10), rgba(79,142,247,0.04))', border: '1px solid rgba(79,142,247,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 10, color: 'var(--accent-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--accent)', display: 'inline-block' }}/>
          Suggestion contextuelle
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text)' }}>
          Je vois que ce bouton mène vers <span style={{ background: 'rgba(79,142,247,0.15)', padding: '1px 5px', borderRadius: 3, color: 'var(--accent-2)' }}>2 destinations</span> selon l'état auth. Ajouter un état <span className="mono" style={{ color: 'var(--accent-2)' }}>loading</span> pendant la vérification ?
        </div>
        <div className="mono" style={{ marginTop: 10, padding: 8, borderRadius: 6, background: 'rgba(0,0,0,0.3)', fontSize: 10, lineHeight: 1.55, color: 'var(--text-dim)' }}>
          <div><span style={{ color: 'var(--text-mute)' }}>142</span> &lt;Pressable onPress=&#123;handleOrder&#125;&gt;</div>
          <div style={{ background: 'rgba(63,214,138,0.08)', color: 'var(--green)' }}>+ &nbsp;&nbsp;&nbsp;&nbsp;&#123;loading ? &lt;Spinner/&gt; : 'Commander'&#125;</div>
        </div>
      </div>
      <div style={{ padding: '0 14px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.35)', border: '1px solid var(--line-2)' }}>
          <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Décris la modification…" style={{ flex: 1, background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--text)' }}/>
          <span className="mono caret" style={{ color: 'var(--accent)', fontSize: 12 }}>{draft ? '' : '|'}</span>
          <span className="mono" style={{ fontSize: 9, color: 'var(--text-mute)', padding: '2px 5px', border: '1px solid var(--line-2)', borderRadius: 4 }}>↵</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-mute)', marginRight: 'auto' }} className="mono">claude-opus · 2.4s</div>
        <button className="btn-ghost" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11 }}>Ignorer</button>
        <button className="btn-primary" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>Appliquer {Ico.arrow}</button>
      </div>
    </div>
  );
};

/* ---------- AGENTS PANEL ---------- */
const AgentRow = ({ name, msg, state }) => {
  const stateUI = {
    spinning: <div className="spin" style={{ width: 12, height: 12, border: '1.5px solid var(--accent)', borderTopColor: 'transparent', borderRadius: 999 }}/>,
    done: <div style={{ width: 12, height: 12, borderRadius: 999, background: 'rgba(63,214,138,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', fontSize: 9 }}>✓</div>,
    idle: <div style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--text-mute)' }}/>,
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ width: 16, display: 'flex', justifyContent: 'center' }}>{stateUI[state]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)' }}>{name}</div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{msg}</div>
      </div>
    </div>
  );
};

const AgentsPanel = () => (
  <div className="glass" style={{ position: 'absolute', top: 60, right: 14, width: 260, borderRadius: 12, zIndex: 18, padding: '14px 14px 6px', boxShadow: '0 20px 60px -20px rgba(0,0,0,0.5)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>Agents</span>
        <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 999, background: 'rgba(79,142,247,0.14)', color: 'var(--accent-2)', fontWeight: 600 }}>5 actifs</span>
      </div>
      <span style={{ color: 'var(--text-mute)', fontSize: 11 }}>⌄</span>
    </div>
    <AgentRow name="AgentCartographe" msg="Analyse navigation…" state="spinning" />
    <AgentRow name="ScannerAgent" msg="5 pages détectées" state="done" />
    <AgentRow name="PageIdentifierAgent" msg="Classification en cours" state="spinning" />
    <AgentRow name="MemoryAgent" msg="Session active · 2.1k tokens" state="done" />
    <AgentRow name="AmbiguityResolver" msg="En attente" state="idle" />
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 10, fontSize: 10, color: 'var(--text-mute)' }}>
      <span className="mono">12 events · </span>
      <span style={{ color: 'var(--accent-2)' }}>view log →</span>
    </div>
  </div>
);

/* ---------- MINI CHAT ---------- */
const MiniChat = () => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', width: 380, zIndex: 25 }}>
      <div className="glass-strong" style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)' }}>
        {open && (
          <div style={{ padding: '12px 14px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[0,1,2,3,4].map(i => (
                    <span key={i} className="pulse-dot" style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--accent)', animationDelay: `${i*0.18}s`, display: 'inline-block' }}/>
                  ))}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>5 agents actifs</span>
              </div>
              <button onClick={() => setOpen(false)} style={{ color: 'var(--text-mute)', fontSize: 11 }}>⌄</button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {['Ajoute l\'auth Google', 'Optimise les perfs', 'Génère les tests'].map(s => (
                <button key={s} className="suggest-pill mono" style={{ padding: '4px 9px', borderRadius: 999, fontSize: 10 }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: open ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #4F8EF7, #A988FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white' }}>{Ico.spark}</div>
          <input placeholder="Question sur le projet…" style={{ flex: 1, background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--text)' }}/>
          <span className="mono caret" style={{ color: 'var(--accent)', fontSize: 13 }}>|</span>
          <span className="mono" style={{ fontSize: 9, color: 'var(--text-mute)', padding: '2px 6px', border: '1px solid var(--line-2)', borderRadius: 4 }}>⌘ + ↵</span>
        </div>
      </div>
    </div>
  );
};

/* ---------- ARROWS LAYER (DOM-anchored) ---------- */
/* arrows: { id, fromAnchor, toAnchor, label, dim, fromSide, toSide } */
const ArrowsLayer = ({ arrows, world, ticker }) => {
  // Resolve anchor element rects in WORLD (canvas) coords
  const getRect = (anchor) => {
    const el = world.current && world.current.querySelector(`[data-anchor="${anchor}"], [data-page-anchor="${anchor}"]`);
    if (!el || !world.current) return null;
    const wr = world.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    // Convert client px to world px (undo transform scale via wr scaling factor)
    const sx = wr.width === 0 ? 1 : wr.width / world.current.offsetWidth;
    const sy = wr.height === 0 ? 1 : wr.height / world.current.offsetHeight;
    return {
      left: (r.left - wr.left) / sx,
      top: (r.top - wr.top) / sy,
      width: r.width / sx,
      height: r.height / sy,
    };
  };

  const sidePoint = (rect, side) => {
    if (!rect) return null;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    switch (side) {
      case 'left':  return { x: rect.left, y: cy };
      case 'right': return { x: rect.left + rect.width, y: cy };
      case 'top':   return { x: cx, y: rect.top };
      case 'bottom':return { x: cx, y: rect.top + rect.height };
      default:      return { x: cx, y: cy };
    }
  };

  // Re-render when ticker changes (world layout)
  const _ = ticker;

  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}>
      <defs>
        <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#4F8EF7" /></marker>
        <marker id="ahd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#4A4A60" /></marker>
      </defs>
      {arrows.map(a => {
        const fr = getRect(a.fromAnchor);
        const tr = getRect(a.toAnchor);
        const from = sidePoint(fr, a.fromSide || 'right');
        const to = sidePoint(tr, a.toSide || 'left');
        if (!from || !to) return null;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const horiz = Math.abs(dx) > Math.abs(dy);
        const handle = Math.max(80, Math.abs(horiz ? dx : dy) * 0.45);
        let cx1, cy1, cx2, cy2;
        if (a.fromSide === 'top' || a.fromSide === 'bottom') {
          const sgn = a.fromSide === 'bottom' ? 1 : -1;
          cx1 = from.x; cy1 = from.y + sgn * handle;
        } else {
          const sgn = a.fromSide === 'right' ? 1 : -1;
          cx1 = from.x + sgn * handle; cy1 = from.y;
        }
        if (a.toSide === 'top' || a.toSide === 'bottom') {
          const sgn = a.toSide === 'top' ? -1 : 1;
          cx2 = to.x; cy2 = to.y + sgn * handle;
        } else {
          const sgn = a.toSide === 'left' ? -1 : 1;
          cx2 = to.x + sgn * handle; cy2 = to.y;
        }
        const path = `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2 + (a.labelOffsetY || 0);
        const stroke = a.dim ? '#4A4A60' : '#4F8EF7';
        return (
          <g key={a.id}>
            {!a.dim && <path d={path} stroke="#4F8EF7" strokeWidth="6" fill="none" opacity="0.12" strokeLinecap="round"/>}
            <path d={path} stroke={stroke} strokeWidth={a.dim ? 1.2 : 1.6} fill="none" strokeLinecap="round" markerEnd={a.dim ? 'url(#ahd)' : 'url(#ah)'} opacity={a.dim ? 0.55 : 1}/>
            {!a.dim && <path d={path} stroke="#A8CDFF" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.9" className="arrow-flow"/>}
            <circle cx={from.x} cy={from.y} r="3.5" fill={stroke} opacity={a.dim ? 0.6 : 1}/>
            {!a.dim && <circle cx={from.x} cy={from.y} r="6" fill="#4F8EF7" opacity="0.18"/>}
            {a.label && (
              <g transform={`translate(${midX} ${midY})`}>
                <rect x={-(a.label.length * 3.3 + 14)} y={-10} width={a.label.length * 3.3 * 2 + 28} height={20} rx={10} fill="#12121A" stroke={a.dim ? '#2A2A38' : 'rgba(79,142,247,0.4)'} strokeWidth="1"/>
                <text x="0" y="4" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill={a.dim ? '#7A7A90' : '#C8DEFF'}>{a.label}</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/* ---------- INFINITE PANNABLE CANVAS ---------- */
const useCanvasPanZoom = (initial) => {
  const [tx, setTx] = useState(initial.tx);
  const [ty, setTy] = useState(initial.ty);
  const [zoom, setZoom] = useState(initial.zoom);
  const isPan = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const onPointerDown = (e) => {
    if (e.button !== 0 && e.button !== 1) return;
    // Don't pan when clicking a button or input
    if (e.target.closest('button, input, [data-no-pan]')) return;
    isPan.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!isPan.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setTx(t => t + dx);
    setTy(t => t + dy);
  };
  const onPointerUp = (e) => {
    isPan.current = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };
  const onWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      setZoom(z => Math.max(0.4, Math.min(1.6, z * factor)));
    } else {
      setTx(t => t - e.deltaX);
      setTy(t => t - e.deltaY);
    }
  };
  return { tx, ty, zoom, setTx, setTy, setZoom, onPointerDown, onPointerMove, onPointerUp, onWheel };
};

/* ---------- MAIN APP ---------- */
const App = () => {
  const pages = [
    { key: 'home',     name: 'Home',     file: 'HomeScreen.tsx',     x: 60,   y: 220, status: 'analyzed',  comp: HomeScreen },
    { key: 'product',  name: 'Produit',  file: 'ProductScreen.tsx',  x: 600,  y: 220, status: 'analyzing', comp: ProductScreen, selected: true },
    { key: 'cart',     name: 'Panier',   file: 'CartScreen.tsx',     x: 1500, y: 60,  status: 'analyzed',  comp: CartScreen },
    { key: 'checkout', name: 'Checkout', file: 'CheckoutScreen.tsx', x: 1500, y: 580, status: 'analyzed',  comp: CheckoutScreen },
    { key: 'login',    name: 'Login',    file: 'LoginScreen.tsx',    x: 600,  y: 800, status: 'analyzed',  comp: LoginScreen },
  ];

  const arrows = [
    { id: 'home-product',     fromAnchor: 'tap-product',  toAnchor: 'product',  label: 'tap product',   fromSide: 'right', toSide: 'left' },
    { id: 'product-cart',     fromAnchor: 'add-to-cart',  toAnchor: 'cart',     label: 'add to cart',   fromSide: 'right', toSide: 'left' },
    { id: 'product-checkout', fromAnchor: 'order-now',    toAnchor: 'checkout', label: 'order now',     fromSide: 'right', toSide: 'left' },
    { id: 'product-login',    fromAnchor: 'order-now',    toAnchor: 'login',    label: 'if !auth',      fromSide: 'right', toSide: 'top', dim: true },
    { id: 'cart-checkout',    fromAnchor: 'checkout-cta', toAnchor: 'checkout', label: 'checkout',      fromSide: 'bottom',toSide: 'top' },
    { id: 'login-home',       fromAnchor: 'login-cta',    toAnchor: 'home',     label: 'auth ok',       fromSide: 'left',  toSide: 'bottom', dim: true },
  ];

  const viewportRef = useRef(null);
  const worldRef = useRef(null);
  const pz = useCanvasPanZoom({ tx: 60, ty: 30, zoom: 0.78 });
  const [tick, setTick] = useState(0);

  // Re-tick on layout / pan / zoom so arrows recompute against new DOM rects
  useLayoutEffect(() => {
    setTick(t => t + 1);
  }, [pz.tx, pz.ty, pz.zoom]);
  useEffect(() => {
    const onResize = () => setTick(t => t + 1);
    window.addEventListener('resize', onResize);
    // Tick once after fonts settle
    const t1 = setTimeout(() => setTick(t => t + 1), 80);
    const t2 = setTimeout(() => setTick(t => t + 1), 400);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const resetView = () => { pz.setTx(60); pz.setTy(30); pz.setZoom(0.78); };

  const WORLD_W = 2400;
  const WORLD_H = 1500;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
      <TitleBar />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <LeftSidebar />

        <div
          ref={viewportRef}
          className="dot-grid"
          onPointerDown={pz.onPointerDown}
          onPointerMove={pz.onPointerMove}
          onPointerUp={pz.onPointerUp}
          onPointerCancel={pz.onPointerUp}
          onWheel={pz.onWheel}
          style={{
            flex: 1, position: 'relative', overflow: 'hidden',
            background: 'var(--bg-deep)',
            backgroundSize: `${22 * pz.zoom}px ${22 * pz.zoom}px`,
            backgroundPosition: `${pz.tx}px ${pz.ty}px`,
            cursor: 'grab',
            touchAction: 'none',
          }}
        >
          {/* Section header (screen-fixed) */}
          <div style={{ position: 'absolute', left: 24, top: 56, fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1.4, zIndex: 16 }} className="mono">
            ◇ Flux d'achat — 5 écrans · 6 transitions
          </div>

          {/* World — transformed */}
          <div
            ref={worldRef}
            style={{
              position: 'absolute', left: 0, top: 0,
              width: WORLD_W, height: WORLD_H,
              transform: `translate(${pz.tx}px, ${pz.ty}px) scale(${pz.zoom})`,
              transformOrigin: '0 0',
              willChange: 'transform',
            }}
          >
            <ArrowsLayer arrows={arrows} world={worldRef} ticker={tick} />
            {pages.map(p => (
              <div key={p.key} style={{ position: 'absolute', left: p.x, top: p.y, zIndex: 10 }}>
                <PhoneCard name={p.name} file={p.file} status={p.status} selected={!!p.selected} ScreenComp={p.comp} anchorId={p.key}/>
              </div>
            ))}

            {/* AI Dialog anchored next to Product card, in world coords */}
            <div data-no-pan style={{ position: 'absolute', left: 600 + 256 + 60, top: 220 + 30, zIndex: 22 }}>
              <AIDialog />
              <svg style={{ position: 'absolute', left: -64, top: 200, pointerEvents: 'none' }} width="68" height="20">
                <path d="M0 10 L60 10" stroke="#4F8EF7" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.7" fill="none"/>
                <circle cx="2" cy="10" r="3" fill="#4F8EF7"/>
              </svg>
            </div>
          </div>

          {/* Screen-fixed UI */}
          <CanvasToolbar zoom={pz.zoom} setZoom={pz.setZoom} resetView={resetView} />
          <AgentsPanel />
          <CanvasMinimap />
          <MiniChat />

          {/* Hint */}
          <div style={{ position: 'absolute', bottom: 14, left: 14, display: 'flex', gap: 8, zIndex: 15 }}>
            <div className="glass mono" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, fontSize: 10, color: 'var(--text-dim)' }}>
              <span style={{ color: 'var(--green)' }}>●</span> 5 pages
              <span style={{ color: 'var(--text-mute)' }}>·</span><span>6 routes</span>
              <span style={{ color: 'var(--text-mute)' }}>·</span><span>1 conditional</span>
            </div>
            <div className="glass mono" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, fontSize: 10, color: 'var(--text-dim)' }}>
              <span>drag to pan</span><span style={{ color: 'var(--text-mute)' }}>·</span><span>⌘ + scroll to zoom</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
