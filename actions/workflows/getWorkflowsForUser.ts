'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WorkflowStatus } from '@/prisma/generated/enums'
import { getServerSession } from 'next-auth'

export async function getWorkflowsForUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthenticated')

  const workflows = await prisma.workflow.findMany({
    where: {
      userId: session.user.id,
      status: { in: [WorkflowStatus.draft, WorkflowStatus.published] },
    },
    orderBy: { createdAt: 'asc' },
  })

  if (!workflows) throw new Error('Failed to get Workflow Information')

  return workflows.sort((a, b) => {
    if (a.status === b.status) return 0
    return a.status === WorkflowStatus.published ? -1 : 1
  })
}
