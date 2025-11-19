import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/shared/lib/prisma'
import { requireRole } from '@/shared/lib/auth-helpers'
import { Role, BookingStatus } from '@prisma/client'

const enrollSchema = z.object({
  scheduledAt: z.string().refine((date) => {
    // Try to parse the date string
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime()) && parsedDate > new Date()
  }, {
    message: 'Invalid date format or date must be in the future'
  }),
  notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole([Role.STUDENT, Role.PARENT, Role.ADMIN])
    const body = await request.json()
    const { scheduledAt, notes } = enrollSchema.parse(body)

    const courseId = params.id
    const userId = session.user.id

    // Check if course exists and is active
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                scheduledAt: new Date(scheduledAt),
                status: {
                  in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
                }
              }
            }
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

    if (!course.isActive) {
      return NextResponse.json(
        { error: 'Course is not active' },
        { status: 400 }
      )
    }

    // Check if the scheduled time slot is available
    if (course._count.bookings >= course.maxStudents) {
      return NextResponse.json(
        { error: 'This time slot is fully booked' },
        { status: 400 }
      )
    }

    // Check if user is already enrolled for this course at this time
    const existingBooking = await prisma.booking.findUnique({
      where: {
        userId_courseId_scheduledAt: {
          userId,
          courseId,
          scheduledAt: new Date(scheduledAt)
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You are already enrolled for this course at this time' },
        { status: 400 }
      )
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId,
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
        },
        user: {
          select: {
            name: true,
            email: true,
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

    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.error('Enroll in course error:', error)
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
    const session = await requireRole([Role.STUDENT, Role.PARENT, Role.ADMIN])
    const { searchParams } = new URL(request.url)
    const scheduledAt = searchParams.get('scheduledAt')

    if (!scheduledAt) {
      return NextResponse.json(
        { error: 'scheduledAt parameter is required' },
        { status: 400 }
      )
    }

    const courseId = params.id
    const userId = session.user.id

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: {
        userId_courseId_scheduledAt: {
          userId,
          courseId,
          scheduledAt: new Date(scheduledAt)
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if booking can be cancelled (not completed)
    if (booking.status === BookingStatus.COMPLETED) {
      return NextResponse.json(
        { error: 'Cannot cancel completed booking' },
        { status: 400 }
      )
    }

    // Cancel the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED
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

    return NextResponse.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    })

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.error('Cancel enrollment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
