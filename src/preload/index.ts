import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('rauvalio', {
  openProject: (): Promise<string | null> => ipcRenderer.invoke('open-project'),
  scanProject: (rootDir?: string) => ipcRenderer.invoke('scan-project', rootDir),
  askAgent: (name: string, payload: unknown) =>
    ipcRenderer.invoke('ask-agent', { name, payload }),
  getMemory: () => ipcRenderer.invoke('get-memory'),
  onAgentEvent: (cb: (event: AgentEvent) => void) => {
    ipcRenderer.on('agent-event', (_event, data) => cb(data))
  }
})

interface AgentEvent {
  agent: string
  msg: string
  state: 'spinning' | 'done' | 'idle'
}
