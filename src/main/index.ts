import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { config } from 'dotenv'
import { resolve } from 'path'
import { scanDirectory } from '../../packages/agents/cartographer/ASTReaderAgent'
import { classifyFiles } from '../../packages/agents/cartographer/PageIdentifierAgent'
import { detectNavigation } from '../../packages/agents/cartographer/NavigationAgent'
import { labelPages } from '../../packages/agents/cartographer/SemanticLabelAgent'

// __dirname = out/main/ en dev et en prod — remonter à la racine du projet
config({ path: resolve(__dirname, '../../.env') })

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
