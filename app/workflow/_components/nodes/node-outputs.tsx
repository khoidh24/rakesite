'use client'

import { HandleColors } from '@/lib/workflow/handle-colors'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { TaskParam, TaskType } from '@/types/task'
import { Handle, Position } from '@xyflow/react'

export default function NodeOutputs({ taskType }: { taskType: TaskType }) {
  const task = TaskRegistry[taskType]
  if (!task.outputs?.length) return null

  return (
    <div className="bg-muted/40 border-border flex flex-col divide-y border-t py-1">
      {task.outputs.map((output: TaskParam) => (
        <div key={output.name} className="relative flex items-center justify-end px-3 py-2">
          <span className="text-muted-foreground text-xs">{output.name}</span>
          <Handle
            type="source"
            position={Position.Right}
            id={output.name}
            style={{ backgroundColor: HandleColors[output.type] }}
            className="size-3!"
          />
        </div>
      ))}
    </div>
  )
}
