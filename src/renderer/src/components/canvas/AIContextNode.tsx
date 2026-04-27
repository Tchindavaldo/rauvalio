import React from 'react'
import { NodeProps } from '@xyflow/react'
import AIContextDialog from '../AIContextDialog'

export default function AIContextNode(_props: NodeProps) {
  return (
    <div style={{ position: 'relative' }}>
      {/* Dashed connector line extending to the left toward the Product phone */}
      <svg
        style={{ position: 'absolute', left: -64, top: 200, pointerEvents: 'none' }}
        width="68"
        height="20"
      >
        <path d="M0 10 L60 10" stroke="#4F8EF7" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.7" fill="none"/>
        <circle cx="2" cy="10" r="3" fill="#4F8EF7"/>
      </svg>

      <AIContextDialog />
    </div>
  )
}
