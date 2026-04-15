'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function getWorkflowsInfo({ workflowId }: { workflowId: string }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthenticated')

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
      userId,
    },
  })

  if (!workflow) throw new Error('Failed to get Workflow Information')

  return workflow
}
