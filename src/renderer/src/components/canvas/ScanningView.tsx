import React, { useEffect, useState } from 'react'

interface Step {
  id: string
  label: string
  detail: string
  state: 'waiting' | 'running' | 'done' | 'error'
}

const STEPS: Omit<Step, 'state'>[] = [
  { id: 'ast',      label: 'ASTReaderAgent',       detail: 'Lecture des fichiers TypeScript / TSX' },
  { id: 'classify', label: 'PageIdentifierAgent',   detail: 'Classification IA des fichiers' },
  { id: 'nav',      label: 'NavigationAgent',       detail: 'Détection des liens de navigation' },
  { id: 'render',   label: 'Canvas',                detail: 'Construction du graphe de pages' },
]

interface Props {
  currentStep: number  // 0-based index into STEPS, -1 = not started, 4 = done
  fileCount?: number
  error?: string
}

export default function ScanningView({ currentStep, fileCount, error }: Props) {
  const [dots, setDots] = useState('.')
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 500)
    return () => clearInterval(t)
  }, [])

  const steps: Step[] = STEPS.map((s, i) => ({
    ...s,
    state: error && i === currentStep ? 'error'
         : i < currentStep ? 'done'
         : i === currentStep ? 'running'
         : 'waiting',
  }))

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-deep)',
      gap: 0,
    }}>
      {/* Title */}
      <div style={{ fontSize: 12, color: 'var(--text-mute)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1.2, marginBottom: 32, textTransform: 'uppercase' }}>
        Scan en cours{dots}
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: 360 }}>
        {steps.map((step, i) => {
          const isRunning = step.state === 'running'
          const isDone    = step.state === 'done'
          const isError   = step.state === 'error'
          const isWaiting = step.state === 'waiting'

          const color = isError ? 'var(--rose)'
                      : isDone  ? 'var(--green)'
                      : isRunning ? 'var(--accent)'
                      : 'var(--text-mute)'

          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '10px 0', position: 'relative' }}>
              {/* Vertical connector */}
              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: 9,
                  top: 28,
                  width: 2,
                  height: 22,
                  background: isDone ? 'var(--green)' : 'var(--line)',
                  borderRadius: 1,
                  transition: 'background 0.4s',
                }} />
              )}

              {/* Icon */}
              <div style={{
                width: 20, height: 20, borderRadius: 999, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isRunning ? 'rgba(79,142,247,0.15)'
                           : isDone   ? 'rgba(63,214,138,0.12)'
                           : isError  ? 'rgba(242,109,109,0.12)'
                           : 'var(--bg-elev)',
                border: `1.5px solid ${color}`,
                transition: 'all 0.3s',
              }}>
                {isDone && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6 L5 9 L10 3" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                )}
                {isRunning && (
                  <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)', display: 'inline-block' }} />
                )}
                {isError && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M3 3 L9 9 M9 3 L3 9" stroke="var(--rose)" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                )}
                {isWaiting && (
                  <div style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--line-2)' }} />
                )}
              </div>

              {/* Text */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{
                  fontSize: 12, fontWeight: 600,
                  color: isWaiting ? 'var(--text-mute)' : 'var(--text)',
                  fontFamily: 'JetBrains Mono, monospace',
                  transition: 'color 0.3s',
                }}>
                  {step.label}
                </div>
                <div style={{ fontSize: 11, color: isRunning ? 'var(--text-dim)' : 'var(--text-mute)', transition: 'color 0.3s' }}>
                  {isError ? (error ?? 'Erreur') : step.detail}
                  {isRunning && step.id === 'ast' && fileCount != null && fileCount > 0 && (
                    <span style={{ marginLeft: 6, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {fileCount} fichiers
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
