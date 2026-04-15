import { prisma } from '@/lib/prisma'
import { ExecutionStatus, LogLevel } from '@/prisma/generated/enums'
import { WorkflowExecutionPhase } from '@/prisma/generated/client'
import { AppNode } from '@/types/app-node'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { TaskType } from '@/types/task'
import { Edge } from '@xyflow/react'
import { ExecutionEnvironment } from './types'
import { ExecutorRegistry } from './registry'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function logToPhase(phase: WorkflowExecutionPhase, level: LogLevel, message: string) {
  await prisma.executionLog.create({
    data: { executionPhaseId: phase.id, logLevel: level, message },
  })
}

// ─── Setup execution environment ──────────────────────────────────────────────

function setupEnvironment(edges: Edge[]): ExecutionEnvironment {
  return {
    outputs: {},
    getInput(node, inputName) {
      const edge = edges.find((e) => e.target === node.id && e.targetHandle === inputName)
      if (edge) {
        return this.outputs[edge.source]?.[edge.sourceHandle ?? ''] ?? ''
      }
      return node.data.inputs[inputName] ?? ''
    },
    setOutput(node, outputName, value) {
      if (!this.outputs[node.id]) this.outputs[node.id] = {}
      // Ensure value is always stored as string
      this.outputs[node.id][outputName] = typeof value === 'string' ? value : JSON.stringify(value)
    },
    async log(phase, level, message) {
      await logToPhase(phase, level, message)
    },
  }
}

// ─── Initialize workflow execution ────────────────────────────────────────────

async function initializeWorkflowExecution(executionId: string) {
  await prisma.workflowExecution.update({
    where: { id: executionId },
    data: { status: ExecutionStatus.running, startedAt: new Date() },
  })
}

// ─── Initialize phases status ─────────────────────────────────────────────────

async function initializePhasesStatus(executionId: string) {
  await prisma.workflowExecutionPhase.updateMany({
    where: { workflowExecutionId: executionId },
    data: { status: 'pending' as ExecutionStatus },
  })
}

// ─── Execute phase ────────────────────────────────────────────────────────────

async function executePhase(
  phase: WorkflowExecutionPhase,
  node: AppNode,
  env: ExecutionEnvironment
): Promise<boolean> {
  const executor = ExecutorRegistry[node.data.type as TaskType]
  if (!executor) {
    await logToPhase(phase, 'error', `No executor for task type: ${node.data.type}`)
    return false
  }

  await prisma.workflowExecutionPhase.update({
    where: { id: phase.id },
    data: { status: ExecutionStatus.running, startedAt: new Date() },
  })

  let success = false
  try {
    success = await executor(node, env, phase)
  } catch (err) {
    await logToPhase(phase, 'error', `Executor threw: ${(err as Error).message}`)
    success = false
  }

  const task = TaskRegistry[node.data.type as TaskType]
  const outputs = env.outputs[node.id] ?? {}

  await prisma.workflowExecutionPhase.update({
    where: { id: phase.id },
    data: {
      status: success ? ExecutionStatus.completed : ExecutionStatus.failed,
      completedAt: new Date(),
      outputs: JSON.stringify(outputs),
      creditsConsumed: success ? (task?.credits ?? 1) : 0,
    },
  })

  return success
}

// ─── Consume credits ─────────────────────────────────────────────────────────

async function consumeCredits(userId: string, credits: number) {
  if (credits <= 0) return
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: credits } },
  })
}

// ─── Finalize execution ───────────────────────────────────────────────────────

async function finalizeExecution(
  executionId: string,
  workflowId: string,
  userId: string,
  failed: boolean,
  creditsConsumed: number
) {
  const finalStatus = failed ? ExecutionStatus.failed : ExecutionStatus.completed

  await prisma.workflowExecution.update({
    where: { id: executionId },
    data: { status: finalStatus, completedAt: new Date(), creditsConsumed },
  })

  await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      lastRunStatus: finalStatus,
      lastRunAt: new Date(),
      lastRunId: executionId,
    },
  })

  // Consume credits from user
  await consumeCredits(userId, creditsConsumed)
}

// ─── Clean up environment ─────────────────────────────────────────────────────

async function cleanupEnvironment(env: ExecutionEnvironment) {
  if (env.browser) {
    await env.browser.close().catch(() => {})
    env.browser = undefined
    env.page = undefined
  }
}

// ─── Main executor ────────────────────────────────────────────────────────────

export async function executeWorkflow(executionId: string) {
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId },
    include: {
      workflow: true,
      phases: { orderBy: [{ number: 'asc' }] },
    },
  })

  if (!execution) throw new Error('Execution not found')

  const flow = JSON.parse(execution.workflow.definition) as {
    nodes: AppNode[]
    edges: Edge[]
  }

  // TODO: setup execution environment
  const env = setupEnvironment(flow.edges)

  // TODO: initialize workflow execution
  await initializeWorkflowExecution(executionId)

  // TODO: initialize phases status
  await initializePhasesStatus(executionId)

  let executionFailed = false
  let totalCredits = 0

  // Group phases by number
  const phaseGroups = execution.phases.reduce<Record<number, WorkflowExecutionPhase[]>>(
    (acc, p) => {
      acc[p.number] = acc[p.number] ?? []
      acc[p.number].push(p)
      return acc
    },
    {}
  )

  for (const phaseNum of Object.keys(phaseGroups).map(Number).sort()) {
    for (const phase of phaseGroups[phaseNum]) {
      // TODO: execute phase
      const node = JSON.parse(phase.node) as AppNode
      const success = await executePhase(phase, node, env)

      const task = TaskRegistry[node.data.type as TaskType]
      if (success) totalCredits += task?.credits ?? 1

      if (!success) {
        executionFailed = true
        break
      }
    }
    if (executionFailed) break
  }

  // TODO: finalize execution
  await finalizeExecution(
    executionId,
    execution.workflowId,
    execution.userId,
    executionFailed,
    totalCredits
  )

  // TODO: clean up environment
  await cleanupEnvironment(env)
}
