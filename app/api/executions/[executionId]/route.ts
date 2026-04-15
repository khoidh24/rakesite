import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ executionId: string }> }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { executionId } = await params

  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId, userId },
    include: {
      workflow: { select: { name: true } },
      phases: { orderBy: [{ number: 'asc' }, { startedAt: 'asc' }] },
    },
  })

  if (!execution) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(execution)
}
