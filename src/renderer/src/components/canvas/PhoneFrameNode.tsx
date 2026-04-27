import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

type Status = 'analyzed' | 'analyzing' | 'pending'

const handleStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  width: 1,
  height: 1,
  minWidth: 1,
  minHeight: 1,
  pointerEvents: 'none',
}

function PagePlaceholder({ name, file }: { name: string; file: string }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #1F1F2B 0%, #2A2A3A 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: 16,
      color: '#fff',
    }}>
      <div style={{ fontSize: 32, opacity: 0.6 }}>📄</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{name}</div>
        <div style={{ fontSize: 9, color: '#888', fontFamily: 'JetBrains Mono, monospace' }}>
          {file}
        </div>
      </div>
      <div style={{
        fontSize: 8,
        color: '#666',
        marginTop: 8,
        padding: '6px 8px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: 4,
        textAlign: 'center',
        lineHeight: 1.4,
      }}>
        Placeholder<br/>Vraie iframe en dev
      </div>
    </div>
  )
}

export default function PhoneFrameNode(props: NodeProps) {
  const name = props.data.name as string
  const file = props.data.file as string
  const status = props.data.status as Status
  const selected = props.data.selected as boolean | undefined

  const statusColor =
    status === 'analyzed' ? 'var(--green)'
    : status === 'analyzing' ? 'var(--amber)'
    : 'var(--text-mute)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Phone shell */}
      <div className={`phone phone-hover${selected ? ' glow-pulse' : ''}`}>
        <div className="phone-screen">
          <div className="phone-notch" />
          <PagePlaceholder name={name} file={file} />
        </div>
      </div>

      {/* Label */}
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{ width: 6, height: 6, borderRadius: 999, background: statusColor, display: 'inline-block' }}
            className={status === 'analyzing' ? 'pulse-dot' : ''}
          />
          <span style={{ fontWeight: 600, fontSize: 13, color: selected ? '#fff' : 'var(--text)' }}>
            {name}
          </span>
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--text-mute)' }}>{file}</div>
      </div>

      {/* === HANDLES === */}

      {/* Generic handles for all pages */}
      <Handle type="source" position={Position.Right} id="source-default" style={{ ...handleStyle, top: 248 }} />
      <Handle type="target" position={Position.Left} id="target-default" style={{ ...handleStyle, top: 248 }} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" style={{ ...handleStyle, left: 128 }} />
      <Handle type="target" position={Position.Bottom} id="target-bottom" style={{ ...handleStyle, left: 128 }} />
      <Handle type="target" position={Position.Top} id="target-top" style={{ ...handleStyle, left: 128 }} />
    </div>
  )
}
