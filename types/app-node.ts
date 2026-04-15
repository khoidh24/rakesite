import { Edge, Node } from '@xyflow/react'
import { TaskType } from './task'

export interface AppNodeData {
  type: TaskType
  inputs: Record<string, string>
  [key: string]: unknown
}

export interface AppNode extends Node {
  data: AppNodeData
}

export type EdgeStatus = 'idle' | 'running' | 'done' | 'failed'

export interface AppEdgeData {
  status?: EdgeStatus
  [key: string]: unknown
}

export interface AppEdge extends Edge {
  data?: AppEdgeData
}
