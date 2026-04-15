import { AppNode } from '@/types/app-node'
import { ExecutionEnvironment, TaskExecutorFn } from './types'
import { WorkflowExecutionPhase } from '@/prisma/generated/client'
import { LogLevel } from '@/prisma/generated/enums'

interface ZipEntry {
  id: string
  key: string
  label: string
  required: boolean
  inputId: string
}

function tryParseArray(value: string): unknown[] {
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed
    // If it's a newline-separated string, split it
    return String(parsed).split('\n').filter(Boolean)
  } catch {
    // Plain newline-separated string
    return value.split('\n').filter(Boolean)
  }
}

export const zipArraysExecutor: TaskExecutorFn = async (
  node: AppNode,
  env: ExecutionEnvironment,
  phase: WorkflowExecutionPhase
) => {
  const entriesRaw = node.data.inputs['__entries']
  if (!entriesRaw) {
    await env.log(phase, LogLevel.error, 'No entries configured')
    return false
  }

  let entries: ZipEntry[]
  try {
    entries = JSON.parse(entriesRaw)
  } catch {
    await env.log(phase, LogLevel.error, 'Invalid entries config')
    return false
  }

  // Collect arrays for each key
  const arrays: { key: string; values: unknown[] }[] = []

  for (const entry of entries) {
    if (!entry.key) continue
    const raw = env.getInput(node, entry.inputId)

    if (!raw && entry.required) {
      await env.log(
        phase,
        LogLevel.error,
        `Required field "${entry.label || entry.key}" is missing`
      )
      return false
    }

    if (!raw) continue
    const arr = tryParseArray(raw)
    arrays.push({ key: entry.key, values: arr })
    await env.log(
      phase,
      LogLevel.info,
      `"${entry.label || entry.key}" → key "${entry.key}": ${arr.length} items`
    )
  }

  if (arrays.length === 0) {
    await env.log(phase, LogLevel.error, 'No valid arrays to zip')
    return false
  }

  // Zip by index — use length of shortest array
  const length = Math.min(...arrays.map((a) => a.values.length))
  await env.log(phase, LogLevel.info, `Zipping ${arrays.length} arrays, ${length} rows`)

  const zipped = Array.from({ length }, (_, i) => {
    const row: Record<string, unknown> = {}
    for (const { key, values } of arrays) {
      row[key] = values[i]
    }
    return row
  })

  env.setOutput(node, 'Zipped JSON', JSON.stringify(zipped, null, 2))
  await env.log(phase, LogLevel.info, `Output: ${zipped.length} objects`)
  return true
}
