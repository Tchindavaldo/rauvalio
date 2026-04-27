export {}

declare global {
  interface Window {
    rauvalio: {
      scanProject: () => Promise<ScanResult>
      askAgent: (name: string, payload: unknown) => Promise<AgentResponse>
      getMemory: () => Promise<MemoryState>
      onAgentEvent: (cb: (event: AgentEvent) => void) => void
    }
  }
}

interface ScanResult {
  pages: number
  routes: number
  conditionals: number
  screens: string[]
}

interface AgentResponse {
  agent: string
  response: string
}

interface MemoryState {
  sessionId: string
  tokens: number
  entries: Array<{ key: string; value: string }>
}

interface AgentEvent {
  agent: string
  msg: string
  state: 'spinning' | 'done' | 'idle'
}
