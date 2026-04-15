'use client'

import { cn } from '@/lib/utils'
import { useReactFlow } from '@xyflow/react'
import { ReactNode } from 'react'

export default function NodeCard({
  children,
  nodeId,
  isSelected,
}: {
  children: ReactNode
  nodeId: string
  isSelected: boolean
}) {
  const { getNode, setCenter } = useReactFlow()

  return (
    <div
      onDoubleClick={() => {
        const node = getNode(nodeId)
        if (!node) return
        const { position, measured } = node
        if (!position || !measured) return
        setCenter(position.x + measured.width! / 2, position.y + measured.height! / 2, {
          zoom: 1,
          duration: 500,
        })
      }}
      className={cn(
        'bg-card border-border w-[420px] rounded-2xl border shadow-sm transition-shadow',
        isSelected && 'border-primary/50 ring-primary/20 shadow-md ring-2'
      )}
    >
      {children}
    </div>
  )
}
