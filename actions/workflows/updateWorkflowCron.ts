'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { Cron } from 'croner'

export async function updateWorkflowCron({ id, cron }: { id: string; cron: string }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthenticated')

  let nextRunAt: Date | null = null
  if (cron.trim()) {
    try {
      const job = new Cron(cron)
      nextRunAt = job.nextRun() ?? null
    } catch {
      throw new Error('Invalid cron expression')
    }
  }

  await prisma.workflow.update({
    where: { id, userId },
    data: { cron: cron.trim(), nextRunAt },
  })

  revalidatePath('/workflows')
}
