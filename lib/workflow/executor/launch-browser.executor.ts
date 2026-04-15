import { AppNode } from '@/types/app-node'
import { ExecutionEnvironment, TaskExecutorFn } from './types'
import { WorkflowExecutionPhase } from '@/prisma/generated/client'
import { LogLevel } from '@/prisma/generated/enums'
import puppeteer from 'puppeteer'

export const launchBrowserExecutor: TaskExecutorFn = async (
  node: AppNode,
  env: ExecutionEnvironment,
  phase: WorkflowExecutionPhase
) => {
  const url = env.getInput(node, 'Website URL')
  if (!url) {
    await env.log(phase, LogLevel.error, 'Website URL is required')
    return false
  }

  await env.log(phase, LogLevel.info, `Launching browser for: ${url}`)

  const browser = await puppeteer.launch({ headless: true })
  env.browser = browser

  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
  env.page = page

  await env.log(phase, LogLevel.info, `Browser launched, page loaded: ${url}`)
  return true
}
