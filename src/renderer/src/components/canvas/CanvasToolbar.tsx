import React from 'react'
import { useReactFlow } from '@xyflow/react'

export default function CanvasToolbar() {
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow()
  const [zoom, setZoom] = React.useState(78)

  React.useEffect(() => {
    const id = setInterval(() => {
      setZoom(Math.round(getZoom() * 100))
    }, 200)
    return () => clearInterval(id)
  }, [getZoom])

  return (
    <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8, zIndex: 20 }}>
      {/* Tool selector */}
      <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: 2, padding: 4, borderRadius: 10 }}>
        {[
          {
            label: 'Cursor',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 8-6 1-2 8z"/></svg>,
            active: true
          },
          {
            label: 'Hand',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 11V6.5a1.5 1.5 0 0 0-3 0V11M15 11V4.5a1.5 1.5 0 0 0-3 0V11M12 11V4a1.5 1.5 0 0 0-3 0v9M9 11v-2a1.5 1.5 0 0 0-3 0v6.5a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6V8.5a1.5 1.5 0 0 0-3 0V11"/>
              </svg>
            ),
            active: false
          },
          {
            label: 'Connect',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M5 12c0-3.5 3-6 6-6M19 12c0 3.5-3 6-6 6"/>
              </svg>
            ),
            active: false
          },
        ].map(({ label, icon, active }) => (
          <button key={label} title={label} style={{
            padding: 6, borderRadius: 6,
            background: active ? 'rgba(79,142,247,0.16)' : 'transparent',
            color: active ? 'var(--accent)' : 'var(--text-dim)'
          }}>
            {icon}
          </button>
        ))}
      </div>

      {/* Zoom controls */}
      <div className="glass" style={{
        display: 'flex', alignItems: 'center',
        padding: '4px 10px', borderRadius: 10,
        gap: 8, fontSize: 11, color: 'var(--text-dim)'
      }}>
        <span style={{ color: 'var(--text)' }} className="mono">{zoom}%</span>
        <div style={{ width: 1, height: 12, background: 'var(--line-2)' }}/>
        <button onClick={() => zoomOut()} style={{ color: 'var(--text-mute)' }}>−</button>
        <button onClick={() => zoomIn()} style={{ color: 'var(--text-mute)' }}>+</button>
        <div style={{ width: 1, height: 12, background: 'var(--line-2)' }}/>
        <button onClick={() => fitView({ padding: 0.12, duration: 400 })} style={{ color: 'var(--text-mute)', fontSize: 10 }}>Fit</button>
      </div>

      {/* Live indicator */}
      <div className="glass" style={{
        display: 'flex', alignItems: 'center',
        padding: '4px 10px 4px 8px', borderRadius: 10,
        gap: 6, fontSize: 11, color: 'var(--text-dim)'
      }}>
        <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)', display: 'inline-block' }}/>
        <span>Live preview</span>
        <span className="mono" style={{ color: 'var(--text-mute)', fontSize: 10 }}>· iPhone 15</span>
      </div>
    </div>
  )
}
