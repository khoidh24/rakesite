import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ executionId: string; phaseId: string }> }
) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phaseId } = await params

  const phase = await prisma.workflowExecutionPhase.findUnique({
    where: { id: phaseId, userId },
    include: { logs: { orderBy: { timestamp: 'asc' } } },
  })

  if (!phase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(phase)
}
