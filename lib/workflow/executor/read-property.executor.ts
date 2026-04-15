import { AppNode } from '@/types/app-node'
import { ExecutionEnvironment, TaskExecutorFn } from './types'
import { WorkflowExecutionPhase } from '@/prisma/generated/client'
import { LogLevel } from '@/prisma/generated/enums'

// Supports dot notation and array index: "items[0].src", "data.name"
function getNestedValue(obj: unknown, path: string): unknown {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .reduce((acc: unknown, key) => {
      if (acc == null) return undefined
      return (acc as Record<string, unknown>)[key]
    }, obj)
}

export const readPropertyExecutor: TaskExecutorFn = async (
  node: AppNode,
  env: ExecutionEnvironment,
  phase: WorkflowExecutionPhase
) => {
  const jsonStr = env.getInput(node, 'JSON')
  const property = env.getInput(node, 'Property')

  if (!jsonStr) {
    await env.log(phase, LogLevel.error, 'JSON input is required')
    return false
  }
  if (!property) {
    await env.log(phase, LogLevel.error, 'Property is required')
    return false
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    await env.log(phase, LogLevel.error, 'Invalid JSON input')
    return false
  }

  const value = getNestedValue(parsed, property)

  if (value === undefined) {
    await env.log(phase, LogLevel.error, `Property "${property}" not found`)
    return false
  }

  const result = typeof value === 'string' ? value : JSON.stringify(value)
  env.setOutput(node, 'Property value', result)
  await env.log(phase, LogLevel.info, `Read "${property}": ${result.slice(0, 100)}`)
  return true
}
