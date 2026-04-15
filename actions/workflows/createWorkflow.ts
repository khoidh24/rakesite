'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createFlowNode } from '@/lib/workflow/create-flow-node'
import { WorkflowStatus } from '@/prisma/generated/enums'
import { AppNode } from '@/types/app-node'
import { TaskType } from '@/types/task'
import { Edge } from '@xyflow/react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  description: z.string().max(200).optional(),
})

export async function createWorkflow(input: z.infer<typeof schema>) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthenticated')

  const parsed = schema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const initialFlow: { nodes: AppNode[]; edges: Edge[] } = { nodes: [], edges: [] }

  initialFlow.nodes.push(createFlowNode(TaskType.LAUNCH_BROWSER))

  const result = await prisma.workflow.create({
    data: {
      userId: session.user.id,
      status: WorkflowStatus.draft,
      definition: JSON.stringify(initialFlow),
      name: parsed.data.name,
      description: parsed.data.description ?? '',
    },
  })

  if (!result) throw new Error('Failed to create Workflow')

  redirect(`/workflow/editor/${result.id}`)
}
