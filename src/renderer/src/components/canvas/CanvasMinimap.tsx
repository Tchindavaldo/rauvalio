import React from 'react'

export default function CanvasMinimap() {
  return (
    <div className="glass" style={{
      position: 'absolute', bottom: 88, right: 286,
      width: 156, height: 100,
      borderRadius: 8, padding: 8, zIndex: 15
    }}>
      <div style={{ fontSize: 9, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Map</div>
      <div style={{
        position: 'relative', width: '100%', height: 70,
        borderRadius: 4,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--line)'
      }}>
        {/* Minimap phone nodes */}
        {[[10,30,16,22],[44,12,16,22],[78,30,16,22],[44,44,16,22],[112,30,16,22]].map(([x,y,w,h],i) => (
          <div key={i} style={{
            position: 'absolute', left: x, top: y, width: w, height: h,
            borderRadius: 2,
            background: i === 1 ? 'var(--accent)' : 'rgba(255,255,255,0.18)'
          }}/>
        ))}
        {/* Viewport rect */}
        <div style={{ position: 'absolute', left: 30, top: 16, width: 90, height: 50, border: '1px solid var(--accent)', borderRadius: 3 }}/>
      </div>
    </div>
  )
}
