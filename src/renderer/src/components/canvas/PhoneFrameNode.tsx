import React, { useState, useEffect } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

type Status = 'analyzed' | 'analyzing' | 'pending'

interface DevServerInfo {
  port: number
  framework: string
}

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

function LoadingSpinner() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #1F1F2B 0%, #2A2A3A 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      color: '#fff',
    }}>
      <div style={{
        width: 40, height: 40,
        border: '2px solid rgba(79,142,247,0.2)',
        borderTop: '2px solid var(--accent)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>
        Démarrage du dev server...
      </div>
    </div>
  )
}

export default function PhoneFrameNode(props: NodeProps) {
  const name = props.data.name as string
  const file = props.data.file as string
  const status = props.data.status as Status
  const selected = props.data.selected as boolean | undefined
  const projectPath = props.data.projectPath as string | undefined

  const [devServer, setDevServer] = useState<DevServerInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectPath) {
      setDevServer(null)
      return
    }

    setLoading(true)

    // Delayed startup to avoid race conditions
    const timer = setTimeout(async () => {
      try {
        const rauvalio = (window as any).rauvalio
        if (!rauvalio?.startDevServer) {
          setError('startDevServer not available')
          setLoading(false)
          return
        }

        const result = await rauvalio.startDevServer(projectPath)
        setDevServer(result)
        setError(null)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [projectPath])

  const statusColor =
    status === 'analyzed' ? 'var(--green)'
    : status === 'analyzing' ? 'var(--amber)'
    : 'var(--text-mute)'

  const screenContent = (() => {
    if (error) {
      return (
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #1F1F2B 0%, #2A2A3A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12,
          color: '#f26d6d',
          fontSize: 10,
          textAlign: 'center',
        }}>
          Error: {error}
        </div>
      )
    }

    if (loading) {
      return <LoadingSpinner />
    }

    if (!devServer) {
      // No dev server, show placeholder
      return <PagePlaceholder name={name} file={file} />
    }

    // Real iframe
    const iframeUrl = `http://localhost:${devServer.port}/`
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <iframe
          src={iframeUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 12,
          }}
          sandbox="allow-scripts allow-same-origin allow-forms"
          title={name}
        />
        {/* Click overlay to intercept interactions */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            cursor: 'pointer',
            opacity: 0,
            pointerEvents: 'all',
          }}
          onClick={(e) => {
            // For now, just log. Later: identify component and open AIContextDialog
            console.log('Clicked on', name, 'at', e.clientX, e.clientY)
          }}
        />
      </div>
    )
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Phone shell */}
      <div className={`phone phone-hover${selected ? ' glow-pulse' : ''}`}>
        <div className="phone-screen">
          <div className="phone-notch" />
          {screenContent}
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
