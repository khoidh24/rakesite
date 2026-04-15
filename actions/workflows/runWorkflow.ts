'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { buildExecutionPlan } from '@/lib/workflow/execution-plan'
import { executeWorkflow } from '@/lib/workflow/executor/engine'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { AppNode } from '@/types/app-node'
import { ExecutionStatus } from '@/prisma/generated/enums'
import { getServerSession } from 'next-auth'
import { after } from 'next/server'
import { redirect } from 'next/navigation'
import { Edge } from '@xyflow/react'

export async function runWorkflow({ workflowId }: { workflowId: string }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthenticated')

  const workflow = await prisma.workflow.findUnique({ where: { id: workflowId, userId } })
  if (!workflow) throw new Error('Workflow not found')
  if (!workflow.definition) throw new Error('Workflow has no definition')

  const flow = JSON.parse(workflow.definition) as { nodes: AppNode[]; edges: Edge[] }
  const { plan, errors } = buildExecutionPlan(flow.nodes, flow.edges)
  if (errors.length > 0) throw new Error(errors[0].message)

  // Create execution + phases
  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId,
      userId,
      trigger: 'manual',
      status: ExecutionStatus.running,
      startedAt: new Date(),
      phases: {
        create: plan.flatMap(({ phase, nodes }) =>
          nodes.map((node) => ({
            userId,
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

  await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      lastRunAt: new Date(),
      lastRunId: execution.id,
      lastRunStatus: ExecutionStatus.running,
    },
  })

  // Run engine after redirect
  after(executeWorkflow(execution.id))

  redirect(`/workflow/run/${execution.id}`)
}
