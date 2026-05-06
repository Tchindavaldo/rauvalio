import React, { useCallback, useEffect, useRef, useState } from 'react'
import ScanningView from './ScanningView'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  applyNodeChanges,
  NodeChange,
} from '@xyflow/react'
import PhoneFrameNode from './PhoneFrameNode'
import AIContextNode from './AIContextNode'
import NavigationEdge from './NavigationEdge'
import CanvasToolbar from './CanvasToolbar'
import AgentsPanel from '../AgentsPanel'
import CanvasMinimap from './CanvasMinimap'
import GlobalChat from '../GlobalChat'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: Record<string, React.ComponentType<any>> = {
  phoneFrame: PhoneFrameNode,
  aiContext: AIContextNode,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const edgeTypes: Record<string, React.ComponentType<any>> = {
  navigation: NavigationEdge,
}

// Fallback static data shown while IPC scan is in progress
const FALLBACK_NODES: Node[] = [
  {
    id: 'home',
    type: 'phoneFrame',
    position: { x: 60, y: 220 },
    data: { name: 'Home', file: 'HomeScreen.tsx', status: 'analyzed', screen: 'home' },
  },
  {
    id: 'product',
    type: 'phoneFrame',
    position: { x: 600, y: 220 },
    data: { name: 'Produit', file: 'ProductScreen.tsx', status: 'analyzing', screen: 'product', selected: true },
  },
  {
    id: 'cart',
    type: 'phoneFrame',
    position: { x: 1500, y: 60 },
    data: { name: 'Panier', file: 'CartScreen.tsx', status: 'analyzed', screen: 'cart' },
  },
  {
    id: 'checkout',
    type: 'phoneFrame',
    position: { x: 1500, y: 580 },
    data: { name: 'Checkout', file: 'CheckoutScreen.tsx', status: 'analyzed', screen: 'checkout' },
  },
  {
    id: 'login',
    type: 'phoneFrame',
    position: { x: 600, y: 800 },
    data: { name: 'Login', file: 'LoginScreen.tsx', status: 'analyzed', screen: 'login' },
  },
  {
    id: 'ai-context',
    type: 'aiContext',
    position: { x: 916, y: 250 },
    data: {},
    draggable: false,
    selectable: false,
    focusable: false,
  },
]

const FALLBACK_EDGES: Edge[] = [
  {
    id: 'home-product',
    source: 'home',
    sourceHandle: 'source-tap-product',
    target: 'product',
    targetHandle: 'target-default',
    type: 'navigation',
    data: { label: 'tap product', dim: false },
  },
  {
    id: 'product-cart',
    source: 'product',
    sourceHandle: 'source-add-to-cart',
    target: 'cart',
    targetHandle: 'target-default',
    type: 'navigation',
    data: { label: 'add to cart', dim: false },
  },
  {
    id: 'product-checkout',
    source: 'product',
    sourceHandle: 'source-order-now',
    target: 'checkout',
    targetHandle: 'target-left',
    type: 'navigation',
    data: { label: 'order now', dim: false },
  },
  {
    id: 'product-login',
    source: 'product',
    sourceHandle: 'source-order-now',
    target: 'login',
    targetHandle: 'target-top',
    type: 'navigation',
    data: { label: 'if !auth', dim: true },
  },
  {
    id: 'cart-checkout',
    source: 'cart',
    sourceHandle: 'source-checkout-cta',
    target: 'checkout',
    targetHandle: 'target-top',
    type: 'navigation',
    data: { label: 'checkout', dim: false },
  },
  {
    id: 'login-home',
    source: 'login',
    sourceHandle: 'source-login-cta',
    target: 'home',
    targetHandle: 'target-bottom',
    type: 'navigation',
    data: { label: 'auth ok', dim: true },
  },
]

// Maps a bare filename → the screen key used by PhoneFrameNode
function fileToScreenKey(filePath: string): string {
  const name = filePath.split('/').pop()?.replace('.tsx', '').replace('.ts', '') ?? ''
  return name.replace('Screen', '').toLowerCase()
}

// Derives a readable page name from filePath
function fileToName(filePath: string): string {
  const base = filePath.split('/').pop()?.replace('.tsx', '').replace('Screen', '') ?? filePath
  return base.charAt(0).toUpperCase() + base.slice(1)
}

// Positions arranged in a loose arc so edges don't overlap
const PAGE_POSITIONS: Record<number, { x: number; y: number }> = {
  0: { x: 60, y: 220 },
  1: { x: 600, y: 220 },
  2: { x: 1500, y: 60 },
  3: { x: 1500, y: 580 },
  4: { x: 600, y: 800 },
  5: { x: 60, y: 750 },
  6: { x: 1100, y: 400 },
  7: { x: 1100, y: 900 },
}

interface Props {
  rootDir: string
}

interface ScreenInfo {
  filePath: string
  screenId: string
  screenLabel: string
  screenType: 'route' | 'modal' | 'sheet' | 'overlay' | 'tab' | 'panel' | 'step' | 'unknown'
  parentScreenId?: string
  trigger?: string
}

interface ScanResponse {
  classifications: Array<{ filePath: string; role: string; confidence: number; reason: string; label?: string; semanticConfidence?: number; screenId?: string; screenType?: ScreenInfo['screenType']; parentScreenId?: string; trigger?: string }>
  edges: Array<{ from: string; to: string; label: string; anchor: string; type: string }>
  screens?: ScreenInfo[]
  scannedAt: string
}

// Layout constants — main screens go on a wide horizontal flow, children are
// arranged in a small grid around their parent.
const MAIN_GAP_X = 600
const MAIN_GAP_Y = 700
const MAIN_PER_ROW = 4
const CHILD_OFFSET_X = 360
const CHILD_OFFSET_Y = 0
const CHILD_GAP_X = 280
const CHILD_GAP_Y = 220

function buildNodesFromScan(scan: ScanResponse, projectPath: string): Node[] {
  const screens: ScreenInfo[] = scan.screens && scan.screens.length > 0
    ? scan.screens
    // Backwards compatibility: synthesise one screen per classification
    : scan.classifications.map((c) => ({
        filePath: c.filePath,
        screenId: c.screenId ?? `${c.filePath}#main`,
        screenLabel: c.label ?? fileToName(c.filePath),
        screenType: (c.screenType ?? 'route') as ScreenInfo['screenType'],
        parentScreenId: c.parentScreenId,
        trigger: c.trigger,
      }))

  const mainScreens = screens.filter((s) => !s.parentScreenId)
  const childrenByParent = new Map<string, ScreenInfo[]>()
  for (const s of screens) {
    if (!s.parentScreenId) continue
    const arr = childrenByParent.get(s.parentScreenId) ?? []
    arr.push(s)
    childrenByParent.set(s.parentScreenId, arr)
  }

  const nodes: Node[] = []
  mainScreens.forEach((main, i) => {
    const col = i % MAIN_PER_ROW
    const row = Math.floor(i / MAIN_PER_ROW)
    const mainPos = { x: 60 + col * MAIN_GAP_X, y: 220 + row * MAIN_GAP_Y }

    nodes.push({
      id: main.screenId,
      type: 'phoneFrame',
      position: mainPos,
      data: {
        name: main.screenLabel,
        file: main.filePath.split('/').pop() ?? main.filePath,
        status: 'analyzed',
        screen: fileToScreenKey(main.filePath),
        selected: i === 0,
        projectPath,
        screenType: main.screenType,
        screenId: main.screenId,
        isChild: false,
      },
    })

    // Lay out children in a 2-column grid to the right of the parent
    const children = childrenByParent.get(main.screenId) ?? []
    children.forEach((child, ci) => {
      const childCol = ci % 2
      const childRow = Math.floor(ci / 2)
      nodes.push({
        id: child.screenId,
        type: 'phoneFrame',
        position: {
          x: mainPos.x + CHILD_OFFSET_X + childCol * CHILD_GAP_X,
          y: mainPos.y + CHILD_OFFSET_Y + childRow * CHILD_GAP_Y,
        },
        data: {
          name: child.screenLabel,
          file: child.filePath.split('/').pop() ?? child.filePath,
          status: 'analyzed',
          screen: fileToScreenKey(child.filePath),
          selected: false,
          projectPath,
          screenType: child.screenType,
          screenId: child.screenId,
          parentScreenId: child.parentScreenId,
          trigger: child.trigger,
          isChild: true,
        },
      })
    })
  })

  nodes.push({
    id: 'ai-context',
    type: 'aiContext',
    position: { x: 916, y: 250 },
    data: {},
    draggable: false,
    selectable: false,
    focusable: false,
  })

  return nodes
}

function buildEdgesFromScan(scan: ScanResponse): Edge[] {
  return scan.edges.map((e, i) => ({
    id: `edge-${i}`,
    source: e.from,
    sourceHandle: `source-${e.anchor}`,
    target: e.to,
    targetHandle: 'target-default',
    type: 'navigation',
    data: { label: e.label, dim: e.type === 'conditional' },
  }))
}

export default function CanvasView({ rootDir }: Props) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [scanMeta, setScanMeta] = useState<{ pages: number; routes: number; conditionals: number } | null>(null)
  const [scanStep, setScanStep] = useState(0)   // 0=AST 1=classify 2=nav 3=render
  const [scanError, setScanError] = useState<string | undefined>()
  const [done, setDone] = useState(false)
  const didScan = useRef(false)

  useEffect(() => {
    if (didScan.current) return
    didScan.current = true

    const rauvalio = (window as unknown as {
      rauvalio: { scanProject: (dir?: string) => Promise<ScanResponse & { fileCount?: number }> }
    }).rauvalio
    if (!rauvalio) { setDone(true); return }

    // Step 0 — AST (running immediately)
    setScanStep(0)

    rauvalio.scanProject(rootDir).then((scan) => {
      console.log('[CanvasView] scan result:', scan)
      console.log('[CanvasView] rootDir:', rootDir)
      console.log('[CanvasView] pages found:', scan?.classifications?.filter((c: any) => c.role === 'page'))
      // Step 1 — classify done, step 2 — nav done (both happened server-side)
      setScanStep(2)

      if (!scan?.classifications) {
        console.warn('[CanvasView] no classifications in scan result')
        setScanStep(3)
        setDone(true)
        return
      }

      // Step 3 — render
      setScanStep(3)
      const builtNodes = buildNodesFromScan(scan, rootDir)
      const builtEdges = buildEdgesFromScan(scan)

      setNodes(builtNodes)
      setEdges(builtEdges)
      setScanMeta({
        pages: scan.classifications.filter((c) => c.role === 'page').length,
        routes: scan.edges.length,
        conditionals: scan.edges.filter((e) => e.type === 'conditional').length,
      })

      // Brief pause so user sees step 3 complete before canvas appears
      setTimeout(() => setDone(true), 600)
    }).catch((err: Error) => {
      setScanError(err?.message ?? 'Erreur inconnue')
    })
  }, [rootDir])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes(nds => applyNodeChanges(changes, nds)),
    []
  )

  if (!done) {
    return <ScanningView currentStep={scanStep} error={scanError} />
  }

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      {/* SVG marker defs — referenced by NavigationEdge as url(#nav-arrow) */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          <marker id="nav-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="#4F8EF7"/>
          </marker>
          <marker id="nav-arrow-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="#4A4A60"/>
          </marker>
        </defs>
      </svg>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        defaultViewport={{ x: 60, y: 30, zoom: 0.78 }}
        minZoom={0.25}
        maxZoom={2}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--bg-deep)' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          color="rgba(255,255,255,0.045)"
        />

        <div style={{
          position: 'absolute', left: 24, top: 56,
          fontSize: 10, color: 'var(--text-mute)',
          textTransform: 'uppercase', letterSpacing: 1.4,
          zIndex: 16, pointerEvents: 'none',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          {scanMeta
            ? `◇ ${scanMeta.pages} écrans · ${scanMeta.routes} transitions`
            : '◇ Canvas'}
        </div>

        <CanvasToolbar />
        <AgentsPanel />
        <CanvasMinimap />
        <GlobalChat />

        <div style={{ position: 'absolute', bottom: 14, left: 14, display: 'flex', gap: 8, zIndex: 15 }}>
          <div className="glass mono" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, fontSize: 10, color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--green)' }}>●</span>
            {scanMeta?.pages ?? 0} pages
            <span style={{ color: 'var(--text-mute)' }}>·</span>
            <span>{scanMeta?.routes ?? 0} routes</span>
            <span style={{ color: 'var(--text-mute)' }}>·</span>
            <span>{scanMeta?.conditionals ?? 0} conditional</span>
          </div>
          <div className="glass mono" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, fontSize: 10, color: 'var(--text-dim)' }}>
            <span>drag to pan</span>
            <span style={{ color: 'var(--text-mute)' }}>·</span>
            <span>⌘ + scroll to zoom</span>
          </div>
        </div>
      </ReactFlow>
    </div>
  )
}
