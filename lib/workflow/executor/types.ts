import { WorkflowExecutionPhase } from '@/prisma/generated/client'
import { LogLevel } from '@/prisma/generated/enums'
import { AppNode } from '@/types/app-node'
import { Browser, Page } from 'puppeteer'

export interface ExecutionEnvironment {
  browser?: Browser
  page?: Page
  outputs: Record<string, Record<string, string>>
  getInput: (node: AppNode, inputName: string) => string
  setOutput: (node: AppNode, outputName: string, value: string) => void
  log: (phase: WorkflowExecutionPhase, level: LogLevel, message: string) => Promise<void>
}

export type TaskExecutorFn = (
  node: AppNode,
  env: ExecutionEnvironment,
  phase: WorkflowExecutionPhase
) => Promise<boolean>
