'use client'

import { EdgeStatus } from '@/types/app-node'
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react'
import { CheckCircle2, CircleDashed, Loader2, XCircle } from 'lucide-react'

const STATUS_ICON: Record<EdgeStatus, React.ReactNode> = {
  idle: <CircleDashed className="text-muted-foreground size-4" />,
  running: <Loader2 className="text-primary size-4 animate-spin" />,
  done: <CheckCircle2 className="size-4 text-emerald-500" />,
  failed: <XCircle className="text-destructive size-4" />,
}

export default function StatusEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  data,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const status = (data?.status as EdgeStatus) ?? 'idle'

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerEnd={markerEnd}
        className="animated-dash"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="bg-background border-border nodrag nopan flex size-7 items-center justify-center rounded-full border shadow-sm"
        >
          {STATUS_ICON[status]}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
