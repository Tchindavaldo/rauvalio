import { contextBridge, ipcRenderer } from 'electron'

const devServerCallbacks = new Map<string, (event: DevServerEvent) => void>()

contextBridge.exposeInMainWorld('rauvalio', {
  openProject: (): Promise<string | null> => ipcRenderer.invoke('open-project'),
  scanProject: (rootDir?: string) => ipcRenderer.invoke('scan-project', rootDir),
  askAgent: (name: string, payload: unknown) =>
    ipcRenderer.invoke('ask-agent', { name, payload }),
  getMemory: () => ipcRenderer.invoke('get-memory'),
  startDevServer: (projectPath: string): Promise<{ port: number; framework: string }> =>
    ipcRenderer.invoke('start-dev-server', projectPath),
  onDevServerReady: (projectPath: string, cb: (event: DevServerEvent) => void) => {
    devServerCallbacks.set(projectPath, cb)
  },
  onAgentEvent: (cb: (event: AgentEvent) => void) => {
    ipcRenderer.on('agent-event', (_event, data) => cb(data))
  }
})

ipcRenderer.on('dev-server-ready', (_event, projectPath: string, event: DevServerEvent) => {
  const cb = devServerCallbacks.get(projectPath)
  if (cb) cb(event)
})

interface AgentEvent {
  agent: string
  msg: string
  state: 'spinning' | 'done' | 'idle'
}

interface DevServerEvent {
  ready: boolean
  port: number
  framework: string
}
