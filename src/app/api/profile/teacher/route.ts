import { NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { requireRole } from '@/shared/lib/auth-helpers'
import { Role } from '@prisma/client'

export async function GET() {
  try {
    const session = await requireRole([Role.TEACHER, Role.ADMIN])

    // Get or create teacher profile
    let teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // Auto-create teacher profile if it doesn't exist
    if (!teacher) {
      teacher = await prisma.teacher.create({
        data: {
          userId: session.user.id,
          bio: null,
          experience: null,
          specialties: [],
          hourlyRate: null,
          avatarUrl: session.user.image || null,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.error('Get teacher profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
