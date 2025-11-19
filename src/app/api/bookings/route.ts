import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/shared/lib/prisma'
import { requireAuth } from '@/shared/lib/auth-helpers'
import { BookingStatus } from '@prisma/client'

const createBookingSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  scheduledAt: z.string().datetime('Invalid date format'),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as BookingStatus | null
    
    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status })
      },
      include: {
        course: {
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
            }
          }
        },
        payments: true,
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    })

    return NextResponse.json(bookings)

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { courseId, scheduledAt, notes } = createBookingSchema.parse(body)

    // Check if course exists and is active
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        bookings: {
          where: {
            scheduledAt: new Date(scheduledAt),
            status: {
              in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
            }
          }
        }
      }
    })

    if (!course || !course.isActive) {
      return NextResponse.json(
        { error: 'Course not found or inactive' },
        { status: 404 }
      )
    }

    // Check if course is full for this time slot
    if (course.bookings.length >= course.maxStudents) {
      return NextResponse.json(
        { error: 'Course is full for this time slot' },
        { status: 400 }
      )
    }

    // Check if user already has a booking for this course at this time
    const existingBooking = await prisma.booking.findUnique({
      where: {
        userId_courseId_scheduledAt: {
          userId: session.user.id,
          courseId,
          scheduledAt: new Date(scheduledAt)
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You already have a booking for this course at this time' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        courseId,
        scheduledAt: new Date(scheduledAt),
        notes,
        status: BookingStatus.PENDING,
      },
      include: {
        course: {
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
            }
          }
        }
      }
    })

    return NextResponse.json(booking, { status: 201 })

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

    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
