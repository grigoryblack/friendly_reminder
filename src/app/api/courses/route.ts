import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/shared/lib/prisma'
import { requireRole } from '@/shared/lib/auth-helpers'
import { Role } from '@prisma/client'

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  imageUrl: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'Invalid URL format'
  }),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  price: z.number().min(0, 'Price must be non-negative'),
  maxStudents: z.number().min(1, 'Max students must be at least 1'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    const courses = await prisma.course.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
        ...(teacherId && { teacherId })
      },
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
            bookings: {
              where: {
                status: {
                  in: ['PENDING', 'CONFIRMED']
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(courses)

  } catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole([Role.TEACHER, Role.ADMIN])
    const body = await request.json()
    const courseData = createCourseSchema.parse(body)

    // Get teacher ID
    let teacherId: string
    if (session.user.role === Role.ADMIN) {
      // Admin can specify teacherId or use their own if they're also a teacher
      teacherId = body.teacherId || session.user.id
    } else {
      // Teachers can only create courses for themselves
      let teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id }
      })
      
      // Auto-create teacher profile if it doesn't exist
      if (!teacher) {
        console.log('Teacher profile not found, creating one for user:', session.user.id)
        teacher = await prisma.teacher.create({
          data: {
            userId: session.user.id,
            bio: null,
            experience: null,
            specialties: [],
            hourlyRate: null,
            avatarUrl: session.user.image || null,
          }
        })
        console.log('Created teacher profile:', teacher.id)
      }
      
      teacherId = teacher.id
    }

    const course = await prisma.course.create({
      data: {
        ...courseData,
        teacherId,
      },
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
    })

    return NextResponse.json(course, { status: 201 })

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

    console.error('Create course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
