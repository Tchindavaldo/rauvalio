import React, { useCallback } from 'react'
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

const initialNodes: Node[] = [
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

const initialEdges: Edge[] = [
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

export default function CanvasView() {
  const [nodes, setNodes] = React.useState<Node[]>(initialNodes)

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes(nds => applyNodeChanges(changes, nds)),
    []
  )

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
        edges={initialEdges}
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

        {/* Section header — viewport-fixed overlay */}
        <div style={{
          position: 'absolute', left: 24, top: 56,
          fontSize: 10, color: 'var(--text-mute)',
          textTransform: 'uppercase', letterSpacing: 1.4,
          zIndex: 16, pointerEvents: 'none',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          ◇ Flux d'achat — 5 écrans · 6 transitions
        </div>

        <CanvasToolbar />
        <AgentsPanel />
        <CanvasMinimap />
        <GlobalChat />

        {/* Bottom status hints */}
        <div style={{ position: 'absolute', bottom: 14, left: 14, display: 'flex', gap: 8, zIndex: 15 }}>
          <div className="glass mono" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, fontSize: 10, color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--green)' }}>●</span> 5 pages
            <span style={{ color: 'var(--text-mute)' }}>·</span>
            <span>6 routes</span>
            <span style={{ color: 'var(--text-mute)' }}>·</span>
            <span>1 conditional</span>
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
