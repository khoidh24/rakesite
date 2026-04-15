import { AppNode } from '@/types/app-node'
import { ExecutionEnvironment, TaskExecutorFn } from './types'
import { WorkflowExecutionPhase } from '@/prisma/generated/client'
import { LogLevel } from '@/prisma/generated/enums'

export const addPropertyExecutor: TaskExecutorFn = async (
  node: AppNode,
  env: ExecutionEnvironment,
  phase: WorkflowExecutionPhase
) => {
  const jsonStr = env.getInput(node, 'JSON')
  const propertyName = env.getInput(node, 'Property name')
  const propertyValue = env.getInput(node, 'Property value')

  if (!jsonStr) {
    await env.log(phase, LogLevel.error, 'JSON input is required')
    return false
  }
  if (!propertyName) {
    await env.log(phase, LogLevel.error, 'Property name is required')
    return false
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    await env.log(phase, LogLevel.error, 'Invalid JSON input')
    return false
  }

  // Try to parse value as JSON, fallback to string
  let value: unknown = propertyValue
  try {
    value = JSON.parse(propertyValue)
  } catch {
    /* keep as string */
  }

  const updated = { ...(parsed as Record<string, unknown>), [propertyName]: value }
  const result = JSON.stringify(updated)

  env.setOutput(node, 'Updated JSON', result)
  await env.log(phase, LogLevel.info, `Set "${propertyName}" = ${propertyValue.slice(0, 80)}`)
  return true
}
