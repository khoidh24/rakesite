'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function archiveWorkflow(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthenticated')

  const result = prisma.workflow.update({
    where: { id, userId: session.user.id },
    data: { status: 'archived' },
  })

  if (!result) throw new Error('Failed to delete Workflow')

  return result
}
