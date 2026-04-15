import { hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { signupSchema } from '@/lib/schemas/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = signupSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: { email: ['Email already in use'] } }, { status: 409 })
  }

  const hashed = await hashPassword(password)
  await prisma.user.create({ data: { name, email, password: hashed } })

  return NextResponse.json({ success: true }, { status: 201 })
}
