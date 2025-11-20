import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/shared/config/auth'
import { prisma } from '@/shared/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is teacher or admin
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get teacher's courses and their bookings
    const teacherBookings = await prisma.booking.findMany({
      where: {
        course: {
          teacher: {
            userId: session.user.id
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    return NextResponse.json(teacherBookings)
  } catch (error) {
    console.error('Error fetching teacher bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
