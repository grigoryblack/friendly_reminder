import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/shared/lib/prisma'
import { requireRole } from '@/shared/lib/auth-helpers'
import { Role } from '@prisma/client'

const updateCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'Invalid URL format'
  }),
  duration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  maxStudents: z.number().min(1, 'Max students must be at least 1').optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(course)

  } catch (error) {
    console.error('Get course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole([Role.TEACHER, Role.ADMIN])
    const body = await request.json()
    const courseData = updateCourseSchema.parse(body)

    // Check if course exists and user has permission to edit it
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        teacher: {
          include: {
            user: true
          }
        }
      }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (session.user.role !== Role.ADMIN && existingCourse.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own courses' },
        { status: 403 }
      )
    }

    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: courseData,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })

    return NextResponse.json(updatedCourse)

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

    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.error('Update course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole([Role.TEACHER, Role.ADMIN])

    // Check if course exists and user has permission to delete it
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (session.user.role !== Role.ADMIN && existingCourse.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own courses' },
        { status: 403 }
      )
    }

    // Check if course has bookings
    if (existingCourse._count.bookings > 0) {
      // Instead of deleting, mark as inactive
      const updatedCourse = await prisma.course.update({
        where: { id: params.id },
        data: { isActive: false }
      })
      
      return NextResponse.json({
        message: 'Course deactivated due to existing bookings',
        course: updatedCourse
      })
    }

    // If no bookings, actually delete the course
    await prisma.course.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Course deleted successfully'
    })

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.error('Delete course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
