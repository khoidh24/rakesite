import { TaskRegistry } from '@/lib/workflow/task/registry'
import { AppNode } from '@/types/app-node'
import { TaskType } from '@/types/task'
import { Connection, Edge, Node } from '@xyflow/react'

export function isValidConnection(
  connection: Connection | Edge,
  nodes: Node[],
  edges: Edge[]
): boolean {
  // Không cho self-loop
  if (connection.source === connection.target) return false

  const sourceNode = nodes.find((n) => n.id === connection.source) as AppNode | undefined
  const targetNode = nodes.find((n) => n.id === connection.target) as AppNode | undefined
  if (!sourceNode || !targetNode) return false

  const sourceTask = TaskRegistry[sourceNode.data.type]
  const targetTask = TaskRegistry[targetNode.data.type]

  const sourceOutput = sourceTask.outputs?.find((o) => o.name === connection.sourceHandle)
  const targetInput = targetTask.inputs.find((i) => i.name === connection.targetHandle)

  // Allow dynamic handles for MERGE_JSON (input_xxx pattern)
  if (!targetInput && connection.targetHandle?.startsWith('input_')) {
    if (sourceOutput?.type === undefined) return false
    // Still enforce single connection per handle
    return !edges.some(
      (e) => e.target === connection.target && e.targetHandle === connection.targetHandle
    )
  }

  if (!sourceOutput || !targetInput) return false

  // Type phải khớp
  if (sourceOutput.type !== targetInput.type) return false

  // Rule: không nối 2 node cùng type với nhau
  if (sourceNode.data.type === targetNode.data.type) return false

  // Rule: target input đã có edge nối vào thì không cho nối thêm
  const targetInputAlreadyConnected = edges.some(
    (e) => e.target === connection.target && e.targetHandle === connection.targetHandle
  )
  if (targetInputAlreadyConnected) return false

  return true
}
