import { AppNode } from '@/types/app-node'
import { TaskRegistry } from './task/registry'
import { Edge } from '@xyflow/react'

export interface ExecutionPlanPhase {
  phase: number
  nodes: AppNode[]
}

export type ExecutionPlan = ExecutionPlanPhase[]

export interface ExecutionPlanError {
  type: 'NO_ENTRY_POINT' | 'INVALID_INPUTS' | 'CYCLE_DETECTED'
  message: string
  nodeId?: string
}

export function buildExecutionPlan(
  nodes: AppNode[],
  edges: Edge[]
): { plan: ExecutionPlan; errors: ExecutionPlanError[] } {
  const errors: ExecutionPlanError[] = []

  // Find entry points
  const entryPoints = nodes.filter((n) => TaskRegistry[n.data.type]?.isEntryPoint)
  if (entryPoints.length === 0) {
    errors.push({ type: 'NO_ENTRY_POINT', message: 'No entry point found in workflow' })
    return { plan: [], errors }
  }

  // Build adjacency: nodeId → [nodeIds that depend on it]
  const planned = new Set<string>()
  const plan: ExecutionPlan = []

  // Phase 1: entry points
  plan.push({ phase: 1, nodes: entryPoints })
  entryPoints.forEach((n) => planned.add(n.id))

  // BFS by phases
  let phaseNum = 1
  while (planned.size < nodes.length) {
    phaseNum++
    const phaseNodes: AppNode[] = []

    for (const node of nodes) {
      if (planned.has(node.id)) continue

      const task = TaskRegistry[node.data.type]
      // Check all required inputs are satisfied
      const inputsSatisfied = task.inputs.every((input) => {
        if (input.hideHandle) return true
        const incomingEdge = edges.find(
          (e) => e.target === node.id && e.targetHandle === input.name
        )
        if (!incomingEdge) return !input.required
        return planned.has(incomingEdge.source)
      })

      // For MERGE_JSON: check dynamic input_xxx handles from __entries
      const dynamicSatisfied = (() => {
        const entriesRaw = node.data.inputs?.['__entries']
        if (!entriesRaw) return true
        try {
          const entries: { id: string; key: string; inputId: string }[] = JSON.parse(entriesRaw)
          return entries.every((entry) => {
            if (!entry.key) return true
            const edge = edges.find((e) => e.target === node.id && e.targetHandle === entry.inputId)
            if (!edge) return true // no connection = user will provide manually
            return planned.has(edge.source)
          })
        } catch {
          return true
        }
      })()

      if (inputsSatisfied && dynamicSatisfied) phaseNodes.push(node)
    }

    if (phaseNodes.length === 0) {
      // Remaining nodes can't be resolved — cycle or disconnected
      const remaining = nodes.filter((n) => !planned.has(n.id))
      errors.push({
        type: 'CYCLE_DETECTED',
        message: `Cannot resolve execution order for ${remaining.length} node(s)`,
      })
      break
    }

    plan.push({ phase: phaseNum, nodes: phaseNodes })
    phaseNodes.forEach((n) => planned.add(n.id))
  }

  return { plan, errors }
}
