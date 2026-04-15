import { AppNode } from '@/types/app-node'
import { ExecutionEnvironment, TaskExecutorFn } from './types'
import { WorkflowExecutionPhase } from '@/prisma/generated/client'
import { LogLevel } from '@/prisma/generated/enums'

export const extractElementExecutor: TaskExecutorFn = async (
  node: AppNode,
  env: ExecutionEnvironment,
  phase: WorkflowExecutionPhase
) => {
  const selector = env.getInput(node, 'Selector')
  const attributesRaw = env.getInput(node, 'Attributes')

  if (!selector) {
    await env.log(phase, LogLevel.error, 'Selector is required')
    return false
  }

  const attrs = attributesRaw
    ? attributesRaw
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean)
    : []

  await env.log(
    phase,
    LogLevel.info,
    `Extracting elements: ${selector}${attrs.length ? ` [${attrs.join(', ')}]` : ''}`
  )

  if (!env.page) {
    await env.log(phase, LogLevel.error, 'No browser page available')
    return false
  }

  try {
    await env.page.waitForSelector(selector, { timeout: 10000 }).catch(() => {})

    const elements = await env.page.evaluate(
      (sel: string, attributes: string[]) => {
        const els = document.querySelectorAll(sel)
        return Array.from(els).map((el) => {
          const result: Record<string, string> = {}

          if (attributes.length === 0) {
            // Auto-detect: get all attributes
            Array.from(el.attributes).forEach((attr) => {
              result[attr.name] = attr.value
            })
            // Also get text content
            const text = el.textContent?.trim()
            if (text) result['_text'] = text
          } else {
            attributes.forEach((attr) => {
              if (attr === 'text') {
                result['text'] = el.textContent?.trim() ?? ''
              } else {
                result[attr] = (el as HTMLElement).getAttribute(attr) ?? ''
              }
            })
          }

          return result
        })
      },
      selector,
      attrs
    )

    if (elements.length === 0) {
      await env.log(phase, LogLevel.error, `No elements found for: ${selector}`)
      return false
    }

    const json = JSON.stringify(elements, null, 2)
    env.setOutput(node, 'Elements JSON', json)
    await env.log(phase, LogLevel.info, `Extracted ${elements.length} element(s)`)
    return true
  } catch (err) {
    await env.log(phase, LogLevel.error, `Error: ${(err as Error).message}`)
    return false
  }
}
