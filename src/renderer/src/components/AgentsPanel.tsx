import React, { useState, useEffect } from 'react'

type AgentState = 'spinning' | 'done' | 'idle'

interface Agent {
  name: string
  msg: string
  state: AgentState
}

const StateIcon = ({ state }: { state: AgentState }) => {
  if (state === 'spinning') {
    return (
      <div className="spin" style={{
        width: 12, height: 12,
        border: '1.5px solid var(--accent)',
        borderTopColor: 'transparent',
        borderRadius: 999
      }}/>
    )
  }
  if (state === 'done') {
    return (
      <div style={{
        width: 12, height: 12, borderRadius: 999,
        background: 'rgba(63,214,138,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--green)', fontSize: 9
      }}>✓</div>
    )
  }
  return <div style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--text-mute)' }}/>
}

const AgentRow = ({ name, msg, state }: Agent) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <div style={{ width: 16, display: 'flex', justifyContent: 'center' }}>
      <StateIcon state={state} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)' }}>{name}</div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{msg}</div>
    </div>
  </div>
)

const defaultAgents: Agent[] = [
  { name: 'AgentCartographe', msg: 'Analyse navigation…', state: 'spinning' },
  { name: 'ScannerAgent', msg: '5 pages détectées', state: 'done' },
  { name: 'PageIdentifierAgent', msg: 'Classification en cours', state: 'spinning' },
  { name: 'MemoryAgent', msg: 'Session active · 2.1k tokens', state: 'done' },
  { name: 'AmbiguityResolver', msg: 'En attente', state: 'idle' },
]

export default function AgentsPanel() {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents)

  useEffect(() => {
    window.rauvalio?.onAgentEvent((event) => {
      setAgents(prev => prev.map(a =>
        a.name === event.agent ? { ...a, msg: event.msg, state: event.state } : a
      ))
    })
  }, [])

  return (
    <div className="glass" style={{
      position: 'absolute', top: 60, right: 14,
      width: 260, borderRadius: 12, zIndex: 18,
      padding: '14px 14px 6px',
      boxShadow: '0 20px 60px -20px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Agents</span>
          <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 999, background: 'rgba(79,142,247,0.14)', color: 'var(--accent-2)', fontWeight: 600 }}>
            {agents.filter(a => a.state !== 'idle').length} actifs
          </span>
        </div>
        <span style={{ color: 'var(--text-mute)', fontSize: 11 }}>⌄</span>
      </div>

      {agents.map(a => <AgentRow key={a.name} {...a} />)}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 10, fontSize: 10, color: 'var(--text-mute)' }}>
        <span className="mono">12 events · </span>
        <span style={{ color: 'var(--accent-2)' }}>view log →</span>
      </div>
    </div>
  )
}
