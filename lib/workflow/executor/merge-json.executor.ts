import { AppNode } from '@/types/app-node'
import { ExecutionEnvironment, TaskExecutorFn } from './types'
import { WorkflowExecutionPhase } from '@/prisma/generated/client'
import { LogLevel } from '@/prisma/generated/enums'
import { Edge } from '@xyflow/react'

interface MergeEntry {
  id: string
  key: string
  label: string
  required: boolean
  inputId: string
}

function tryParse(value: string): unknown {
  if (!value) return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export const mergeJsonExecutor: TaskExecutorFn = async (
  node: AppNode,
  env: ExecutionEnvironment,
  phase: WorkflowExecutionPhase
) => {
  const entriesRaw = node.data.inputs['__entries']
  if (!entriesRaw) {
    await env.log(phase, LogLevel.error, 'No entries configured')
    return false
  }

  let entries: MergeEntry[]
  try {
    entries = JSON.parse(entriesRaw)
  } catch {
    await env.log(phase, LogLevel.error, 'Invalid entries config')
    return false
  }

  const result: Record<string, unknown> = {}

  for (const entry of entries) {
    if (!entry.key) continue
    const value = env.getInput(node, entry.inputId)

    if (!value && entry.required) {
      await env.log(
        phase,
        LogLevel.error,
        `Required field "${entry.label || entry.key}" is missing`
      )
      return false
    }

    if (!value) continue
    result[entry.key] = tryParse(value)
    await env.log(phase, LogLevel.info, `Merged "${entry.label || entry.key}" → key "${entry.key}"`)
  }

  if (Object.keys(result).length === 0) {
    await env.log(phase, LogLevel.error, 'No valid entries to merge')
    return false
  }

  env.setOutput(node, 'Merged JSON', JSON.stringify(result, null, 2))
  await env.log(phase, LogLevel.info, `Merged ${Object.keys(result).length} key(s)`)
  return true
}
