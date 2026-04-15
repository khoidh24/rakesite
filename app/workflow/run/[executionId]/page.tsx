import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import ExecutionViewer from './_components/execution-viewer'

export default async function ExecutionPage({
  params,
}: {
  params: Promise<{ executionId: string }>
}) {
  const { executionId } = await params
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) notFound()

  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId, userId },
    include: {
      workflow: { select: { name: true } },
      phases: { orderBy: [{ number: 'asc' }, { startedAt: 'asc' }] },
    },
  })

  if (!execution) notFound()

  return <ExecutionViewer execution={execution} />
}
