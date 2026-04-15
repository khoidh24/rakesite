import { prisma } from '@/lib/prisma'
import { executeWorkflow } from '@/lib/workflow/executor/engine'
import { ExecutionStatus } from '@/prisma/generated/enums'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { buildExecutionPlan } from '@/lib/workflow/execution-plan'
import { AppNode } from '@/types/app-node'
import { Edge } from '@xyflow/react'
import { Cron } from 'croner'
import { NextResponse } from 'next/server'
import { after } from 'next/server'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Find workflows due to run
  const workflows = await prisma.workflow.findMany({
    where: {
      cron: { not: '' },
      nextRunAt: { lte: now },
    },
  })

  for (const workflow of workflows) {
    if (!workflow.definition) continue

    const flow = JSON.parse(workflow.definition) as { nodes: AppNode[]; edges: Edge[] }
    const { plan, errors } = buildExecutionPlan(flow.nodes, flow.edges)
    if (errors.length > 0) continue

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        userId: workflow.userId,
        trigger: 'cron',
        status: ExecutionStatus.running,
        startedAt: now,
        phases: {
          create: plan.flatMap(({ phase, nodes }) =>
            nodes.map((node) => ({
              userId: workflow.userId,
              status: 'pending' as ExecutionStatus,
              number: phase,
              node: JSON.stringify(node),
              name: TaskRegistry[node.data.type]?.labelKey ?? node.data.type,
              inputs: JSON.stringify(node.data.inputs),
            }))
          ),
        },
      },
    })

    // Update nextRunAt
    try {
      const job = new Cron(workflow.cron)
      const nextRunAt = job.nextRun() ?? null
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          lastRunAt: now,
          lastRunId: execution.id,
          lastRunStatus: ExecutionStatus.running,
          nextRunAt,
        },
      })
    } catch {}

    after(executeWorkflow(execution.id))
  }

  return NextResponse.json({ triggered: workflows.length })
}
