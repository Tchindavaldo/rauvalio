import React from 'react'
import TitleBar from './components/TitleBar'
import LeftSidebar from './components/LeftSidebar'
import CanvasView from './components/canvas/CanvasView'

export default function App() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
      <TitleBar />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <LeftSidebar />
        <CanvasView />
      </div>
    </div>
  )
}
