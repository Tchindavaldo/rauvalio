import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname } from 'path'
import { config } from 'dotenv'
import { resolve } from 'path'
import { spawn, ChildProcess } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { scanDirectory } from '../../packages/agents/cartographer/ASTReaderAgent'
import { classifyFiles } from '../../packages/agents/cartographer/PageIdentifierAgent'
import { detectNavigation } from '../../packages/agents/cartographer/NavigationAgent'
import { labelPages } from '../../packages/agents/cartographer/SemanticLabelAgent'

// __dirname = out/main/ en dev et en prod — remonter à la racine du projet
config({ path: resolve(__dirname, '../../.env') })

// --- Dev server management ---

interface DevServerState {
  process: ChildProcess | null
  port: number | null
  framework: string | null
}

const devServers = new Map<string, DevServerState>()

type Framework = 'next' | 'expo' | 'vite' | 'unknown'

function detectFramework(projectPath: string): Framework {
  if (existsSync(join(projectPath, 'next.config.js')) || existsSync(join(projectPath, 'next.config.ts'))) {
    return 'next'
  }
  const packageJsonPath = join(projectPath, 'package.json')
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      if (existsSync(join(projectPath, 'app.json')) && packageJson.dependencies?.expo) {
        return 'expo'
      }
    } catch { /* ignore */ }
  }
  if (existsSync(join(projectPath, 'vite.config.ts')) || existsSync(join(projectPath, 'vite.config.js'))) {
    return 'vite'
  }
  return 'unknown'
}

async function waitForPort(port: number, timeout = 30000): Promise<boolean> {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1000)
      const response = await fetch(`http://localhost:${port}`, { method: 'HEAD', signal: controller.signal })
      clearTimeout(timeoutId)
      return response.ok || response.status === 404
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  return false
}

function spawnDevServer(projectPath: string, framework: Framework): { process: ChildProcess; port: number } {
  let cmd: string
  let args: string[] = []
  let port = 3000

  if (framework === 'next') {
    cmd = 'npm'
    args = ['run', 'dev']
    port = 3000
  } else if (framework === 'expo') {
    cmd = 'npm'
    args = ['run', 'web']
    port = 8081
  } else if (framework === 'vite') {
    cmd = 'npm'
    args = ['run', 'dev']
    port = 5173
  } else {
    throw new Error(`Unknown framework: ${framework}`)
  }

  const childProcess = spawn(cmd, args, {
    cwd: projectPath,
    stdio: 'pipe',
    shell: true,
  })

  return { process: childProcess, port }
}

async function startDevServer(projectPath: string): Promise<{ port: number; framework: string }> {
  // Check if already running
  const existing = devServers.get(projectPath)
  if (existing?.process && existing.port) {
    return { port: existing.port, framework: existing.framework ?? 'unknown' }
  }

  const framework = detectFramework(projectPath)
  if (framework === 'unknown') {
    throw new Error('Could not detect framework (Next.js, Expo, or Vite required)')
  }

  const { process: childProcess, port } = spawnDevServer(projectPath, framework)

  devServers.set(projectPath, {
    process: childProcess,
    port,
    framework,
  })

  // Wait for port to be ready
  const ready = await waitForPort(port)
  if (!ready) {
    childProcess.kill()
    devServers.delete(projectPath)
    throw new Error(`Dev server did not start on port ${port} within 30s`)
  }

  return { port, framework }
}

function killDevServer(projectPath: string): void {
  const state = devServers.get(projectPath)
  if (state?.process) {
    state.process.kill()
    devServers.delete(projectPath)
  }
}

// --- IPC handlers (registered after app.whenReady) ---

function registerIpcHandlers(): void {
  ipcMain.handle('open-project', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Ouvrir un projet',
      properties: ['openDirectory'],
      buttonLabel: 'Ouvrir dans Rauvalio',
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle('scan-project', async (_event, rootDir?: string) => {
    const target = rootDir ?? join(__dirname, '../../src/renderer/src/screens')

    const scanResult = await scanDirectory(target)
    const classificationResult = await classifyFiles(scanResult)
    const navigationResult = await detectNavigation(scanResult, classificationResult)
    const semanticResult = await labelPages(scanResult.files, classificationResult.classifications, navigationResult.edges)

    // Merge labels into classifications
    const labelMap = new Map(semanticResult.labels.map((l) => [l.filePath, l]))
    const classificationsWithLabels = classificationResult.classifications.map((c) => ({
      ...c,
      label: labelMap.get(c.filePath)?.label ?? null,
      semanticConfidence: labelMap.get(c.filePath)?.confidence ?? 0,
    }))

    return {
      files: scanResult.files,
      classifications: classificationsWithLabels,
      edges: navigationResult.edges,
      scannedAt: scanResult.scannedAt,
    }
  })

  ipcMain.handle('ask-agent', (_event, { name, payload }: { name: string; payload: unknown }) => ({
    agent: name,
    response: `Agent ${name} processed: ${JSON.stringify(payload)}`
  }))

  ipcMain.handle('get-memory', () => ({
    sessionId: 'sess-001',
    tokens: 2100,
    entries: [
      { key: 'project', value: 'maison-vitelli' },
      { key: 'framework', value: 'React Native / Expo' },
      { key: 'scanned', value: '5 pages, 6 routes' }
    ]
  }))

  ipcMain.handle('start-dev-server', async (_event, projectPath: string) => {
    try {
      const result = await startDevServer(projectPath)
      return result
    } catch (error) {
      throw new Error(`Failed to start dev server: ${(error as Error).message}`)
    }
  })
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    titleBarStyle: 'hidden',
    backgroundColor: '#0A0A0F',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const agentEvents = [
    { agent: 'AgentCartographe', msg: 'Analyse navigation…', state: 'spinning' },
    { agent: 'ScannerAgent', msg: '5 pages détectées', state: 'done' },
    { agent: 'PageIdentifierAgent', msg: 'Classification en cours', state: 'spinning' },
    { agent: 'MemoryAgent', msg: 'Session active · 2.1k tokens', state: 'done' },
    { agent: 'AmbiguityResolver', msg: 'En attente', state: 'idle' },
  ]

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  win.webContents.on('did-finish-load', () => {
    let tick = 0
    const interval = setInterval(() => {
      const event = agentEvents[tick % agentEvents.length]
      win.webContents.send('agent-event', event)
      tick++
    }, 2500)
    win.on('closed', () => clearInterval(interval))
  })
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('before-quit', () => {
  // Kill all dev servers when Rauvalio closes
  devServers.forEach((state, projectPath) => {
    killDevServer(projectPath)
  })
})
