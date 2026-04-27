import React, { useState } from 'react'
import TitleBar from './components/TitleBar'
import LeftSidebar from './components/LeftSidebar'
import CanvasView from './components/canvas/CanvasView'
import WelcomeScreen from './components/WelcomeScreen'

export default function App() {
  const [projectPath, setProjectPath] = useState<string | null>(null)

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
      <TitleBar projectPath={projectPath} />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {projectPath ? (
          <>
            <LeftSidebar />
            <CanvasView rootDir={projectPath} />
          </>
        ) : (
          <WelcomeScreen onProjectOpened={setProjectPath} />
        )}
      </div>
    </div>
  )
}
