import { AppNode } from '@/types/app-node'
import { ExecutionEnvironment, TaskExecutorFn } from './types'
import { WorkflowExecutionPhase } from '@/prisma/generated/client'
import { LogLevel } from '@/prisma/generated/enums'

export const extractTextExecutor: TaskExecutorFn = async (
  node: AppNode,
  env: ExecutionEnvironment,
  phase: WorkflowExecutionPhase
) => {
  const html = env.getInput(node, 'HTML')
  const selector = env.getInput(node, 'Selector')

  if (!html) {
    await env.log(phase, LogLevel.error, 'HTML input is required')
    return false
  }
  if (!selector) {
    await env.log(phase, LogLevel.error, 'Selector is required')
    return false
  }

  await env.log(phase, LogLevel.info, `Extracting text with selector: ${selector}`)

  // Support selector@attribute syntax, e.g. "img@src", "a@href"
  const [cssSelector, attribute] = selector.split('@')

  if (env.page) {
    try {
      // Wait for selector to appear (SPA may not have rendered yet)
      await env.page.waitForSelector(cssSelector, { timeout: 10000 }).catch(() => {})

      const text = await env.page.evaluate(
        (sel: string, attr: string | undefined) => {
          const els = document.querySelectorAll(sel)
          if (els.length === 0) return ''
          const results = Array.from(els)
            .map((el) => {
              if (attr) return (el as HTMLElement).getAttribute(attr)?.trim() ?? ''
              return el.textContent?.trim() ?? ''
            })
            .filter(Boolean)
          return results.length === 1 ? results[0] : JSON.stringify(results)
        },
        cssSelector,
        attribute
      )

      if (!text) {
        await env.log(phase, LogLevel.error, `No element found for selector: ${selector}`)
        return false
      }

      env.setOutput(node, 'Extracted text', text)
      await env.log(
        phase,
        'info',
        `Extracted: "${text.slice(0, 100)}${text.length > 100 ? '...' : ''}"`
      )
      return true
    } catch (err) {
      await env.log(phase, LogLevel.error, `Selector error: ${(err as Error).message}`)
      return false
    }
  }

  // Fallback: strip tags from HTML
  const stripped = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  env.setOutput(node, 'Extracted text', stripped.slice(0, 5000))
  await env.log(phase, LogLevel.info, `Extracted text (fallback, ${stripped.length} chars)`)
  return true
}
