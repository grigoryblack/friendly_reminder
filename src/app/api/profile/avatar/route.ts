import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/shared/lib/prisma'
import { requireAuth } from '@/shared/lib/auth-helpers'

const updateAvatarSchema = z.object({
  avatarUrl: z.string().url('Invalid URL format'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { avatarUrl } = updateAvatarSchema.parse(body)

    // Update user avatar in database (both avatarUrl and image fields)
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        avatarUrl,
        image: avatarUrl  // Also update image field for NextAuth compatibility
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        image: true,
        role: true,
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Avatar updated successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Update avatar error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
