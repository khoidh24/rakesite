'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function getWorkflowExecutions(workflowId: string) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthenticated')

  return prisma.workflowExecution.findMany({
    where: { workflowId, userId },
    orderBy: { createdAt: 'desc' },
    include: {
      phases: {
        select: { id: true, status: true, creditsConsumed: true },
      },
    },
  })
}
