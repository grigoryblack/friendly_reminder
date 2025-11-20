import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/shared/config/auth'
import { prisma } from '@/shared/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })
    }

    const bookingId = params.id

    // Найти запись и проверить, что она принадлежит текущему пользователю
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        course: true
      }
    })

    if (!booking) {
      return NextResponse.json({ message: 'Запись не найдена' }, { status: 404 })
    }

    // Проверить, что запись принадлежит текущему пользователю
    if (booking.userId !== session.user.id) {
      return NextResponse.json({ message: 'Нет доступа к этой записи' }, { status: 403 })
    }

    // Проверить, что запись можно отменить (только PENDING или CONFIRMED)
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return NextResponse.json({ 
        message: 'Эту запись нельзя отменить' 
      }, { status: 400 })
    }

    // Отменить запись (изменить статус на CANCELLED)
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED'
      }
    })

    return NextResponse.json({ 
      message: 'Запись успешно отменена',
      booking: {
        id: booking.id,
        status: 'CANCELLED'
      }
    })

  } catch (error) {
    console.error('Ошибка при отмене записи:', error)
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })
    }

    const bookingId = params.id

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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
      }
    })

    if (!booking) {
      return NextResponse.json({ message: 'Запись не найдена' }, { status: 404 })
    }

    // Проверить доступ: либо владелец записи, либо учитель курса
    const isOwner = booking.userId === session.user.id
    const isTeacher = booking.course.teacher.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isTeacher && !isAdmin) {
      return NextResponse.json({ message: 'Нет доступа к этой записи' }, { status: 403 })
    }

    return NextResponse.json(booking)

  } catch (error) {
    console.error('Ошибка при получении записи:', error)
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
