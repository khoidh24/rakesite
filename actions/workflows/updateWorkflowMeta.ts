'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export async function updateWorkflowMeta({
  id,
  name,
  description,
}: {
  id: string
  name: string
  description?: string
}) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthenticated')

  const result = await prisma.workflow.update({
    where: { id, userId },
    data: { name, description: description ?? '' },
  })

  if (!result) throw new Error('Failed to update Workflow')
  revalidatePath('/workflows')
}
