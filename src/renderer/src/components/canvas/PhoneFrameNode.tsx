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

const SCREEN_TYPE_BADGE: Record<string, { label: string; color: string }> = {
  route: { label: 'route', color: '#4F8EF7' },
  modal: { label: 'modal', color: '#B084F7' },
  sheet: { label: 'sheet', color: '#84C7F7' },
  overlay: { label: 'overlay', color: '#F77C84' },
  tab: { label: 'tab', color: '#F7C684' },
  panel: { label: 'panel', color: '#84F7B0' },
  step: { label: 'step', color: '#F784D0' },
  unknown: { label: '?', color: '#666' },
}

function ChildScreenPreview({ name, file, screenType, trigger }: { name: string; file: string; screenType?: string; trigger?: string }) {
  const badge = SCREEN_TYPE_BADGE[screenType ?? 'unknown'] ?? SCREEN_TYPE_BADGE.unknown
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #181822 0%, #20202C 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 10, padding: 16, color: '#fff',
    }}>
      <div style={{
        fontSize: 9, padding: '3px 8px', borderRadius: 999,
        background: badge.color + '22', color: badge.color,
        fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: 0.8,
      }}>{badge.label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{name}</div>
      <div style={{ fontSize: 9, color: '#888', fontFamily: 'JetBrains Mono, monospace' }}>{file}</div>
      {trigger && (
        <div style={{
          fontSize: 9, color: '#999', textAlign: 'center', lineHeight: 1.4,
          marginTop: 6, padding: '6px 10px', background: 'rgba(0,0,0,0.25)', borderRadius: 4,
        }}>{trigger}</div>
      )}
    </div>
  )
}

export default function PhoneFrameNode(props: NodeProps) {
  const name = props.data.name as string
  const file = props.data.file as string
  const status = props.data.status as Status
  const selected = props.data.selected as boolean | undefined
  const projectPath = props.data.projectPath as string | undefined
  const screenType = props.data.screenType as string | undefined
  const isChild = props.data.isChild as boolean | undefined
  const trigger = props.data.trigger as string | undefined

  const [devServer, setDevServer] = useState<DevServerInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Child screens (tabs/overlays/steps) don't get their own iframe — they
    // share the parent's URL and live as preview cards on the canvas.
    if (isChild) {
      setLoading(false)
      return
    }
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
    if (isChild) {
      return <ChildScreenPreview name={name} file={file} screenType={screenType} trigger={trigger} />
    }
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
          {screenType && SCREEN_TYPE_BADGE[screenType] && (
            <span style={{
              fontSize: 8, padding: '2px 6px', borderRadius: 999,
              background: SCREEN_TYPE_BADGE[screenType].color + '22',
              color: SCREEN_TYPE_BADGE[screenType].color,
              fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: 0.6,
            }}>{SCREEN_TYPE_BADGE[screenType].label}</span>
          )}
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
