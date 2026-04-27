import React from 'react'
import { EdgeProps, getBezierPath } from '@xyflow/react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function NavigationEdge(props: EdgeProps<any>) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
  } = props

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const dim = (data?.dim as boolean) ?? false
  const label = data?.label as string | undefined
  const stroke = dim ? '#4A4A60' : '#4F8EF7'
  const markerId = dim ? 'nav-arrow-dim' : 'nav-arrow'

  return (
    <g>
      {/* Glow halo */}
      {!dim && (
        <path
          d={edgePath}
          stroke="#4F8EF7"
          strokeWidth={6}
          fill="none"
          opacity={0.12}
          strokeLinecap="round"
        />
      )}

      {/* Main path */}
      <path
        id={id}
        d={edgePath}
        stroke={stroke}
        strokeWidth={dim ? 1.2 : 1.6}
        fill="none"
        strokeLinecap="round"
        markerEnd={`url(#${markerId})`}
        opacity={dim ? 0.55 : 1}
      />

      {/* Animated flow overlay */}
      {!dim && (
        <path
          d={edgePath}
          stroke="#A8CDFF"
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="6 8"
          opacity={0.9}
          style={{ animation: 'flow 1.4s linear infinite' }}
        />
      )}

      {/* Source dot */}
      <circle cx={sourceX} cy={sourceY} r={3.5} fill={stroke} opacity={dim ? 0.6 : 1} />
      {!dim && <circle cx={sourceX} cy={sourceY} r={6} fill="#4F8EF7" opacity={0.18} />}

      {/* Label pill */}
      {label && (
        <g transform={`translate(${labelX} ${labelY})`}>
          <rect
            x={-(label.length * 3.3 + 14)}
            y={-10}
            width={label.length * 3.3 * 2 + 28}
            height={20}
            rx={10}
            fill="#12121A"
            stroke={dim ? '#2A2A38' : 'rgba(79,142,247,0.4)'}
            strokeWidth="1"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="10"
            fill={dim ? '#7A7A90' : '#C8DEFF'}
          >
            {label}
          </text>
        </g>
      )}
    </g>
  )
}
