import { AppNode } from '@/types/app-node'
import { ExecutionEnvironment, TaskExecutorFn } from './types'
import { WorkflowExecutionPhase } from '@/prisma/generated/client'
import { LogLevel } from '@/prisma/generated/enums'

export const pageToHtmlExecutor: TaskExecutorFn = async (
  node: AppNode,
  env: ExecutionEnvironment,
  phase: WorkflowExecutionPhase
) => {
  if (!env.page) {
    await env.log(phase, LogLevel.error, 'No browser page available')
    return false
  }

  await env.log(phase, LogLevel.info, 'Extracting page HTML')

  const html = await env.page.content()
  env.setOutput(node, 'HTML', html)
  env.setOutput(node, 'Web page', 'browser_instance')

  await env.log(phase, LogLevel.info, `HTML extracted (${html.length} chars)`)
  return true
}
