'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WorkflowStatus } from '@/prisma/generated/enums'
import { getServerSession } from 'next-auth'

export async function updateWorkflow({ id, definition }: { id: string; definition: string }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthenticated')

  const workflow = await prisma.workflow.findUnique({
    where: {
      id,
      userId,
    },
  })

  if (!workflow) throw new Error('Failed to get Workflow Information')
  if (workflow.status !== WorkflowStatus.draft) throw new Error('Workflow is not in Draft mode')
  await prisma.workflow.update({
    data: {
      definition,
    },
    where: {
      id,
      userId,
    },
  })
}
