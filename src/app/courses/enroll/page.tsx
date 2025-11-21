'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { MegaImage } from '@/shared/components/mega-image'

interface Course {
  id: string
  title: string
  description?: string
  imageUrl?: string
  duration: number
  price: number
  maxStudents: number
  isActive: boolean
  teacher: {
    user: {
      name: string
      email: string
    }
  }
  _count: {
    bookings: number
  }
}

interface Booking {
  id: string
  scheduledAt: string
  status: string
  notes?: string
  course: Course
}

export default function EnrollCoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [myBookings, setMyBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [scheduledAt, setScheduledAt] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    if (session.user.role !== 'STUDENT' && session.user.role !== 'PARENT') {
      router.push('/')
      return
    }

    fetchCourses()
    fetchMyBookings()
  }, [session, status, router])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      if (!response.ok) {
        throw new Error('Не удалось загрузить курсы')
      }
      const data = await response.json()
      setCourses(data.filter((course: Course) => course.isActive))
    } catch (error) {
      console.error('Ошибка загрузки курсов:', error)
      setError('Не удалось загрузить курсы')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (!response.ok) {
        throw new Error('Не удалось загрузить записи')
      }
      const data = await response.json()
      setMyBookings(data)
    } catch (error) {
      console.error('Ошибка загрузки записей:', error)
    }
  }

  const handleEnroll = async (course: Course) => {
    setSelectedCourse(course)
    setScheduledAt('')
    setNotes('')
  }

  const submitEnrollment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse) return

    setEnrolling(selectedCourse.id)
    setError('')

    try {
      const scheduledDate = new Date(scheduledAt)

      if (isNaN(scheduledDate.getTime())) {
        throw new Error('Неверный формат даты')
      }

      if (scheduledDate <= new Date()) {
        throw new Error('Дата и время должны быть в будущем')
      }

      const isoScheduledAt = scheduledDate.toISOString()

      const response = await fetch(`/api/courses/${selectedCourse.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduledAt: isoScheduledAt,
          notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось записаться на курс')
      }

      setSelectedCourse(null)
      setScheduledAt('')
      setNotes('')
      await fetchMyBookings()
    } catch (error) {
      console.error('Ошибка записи на курс:', error)
      setError(error instanceof Error ? error.message : 'Не удалось записаться на курс')
    } finally {
      setEnrolling(null)
    }
  }

  const cancelBooking = async (booking: Booking) => {
    if (!confirm('Вы уверены, что хотите отменить эту запись?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/courses/${booking.course.id}/enroll?scheduledAt=${encodeURIComponent(booking.scheduledAt)}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось отменить запись')
      }

      await fetchMyBookings()
    } catch (error) {
      console.error('Ошибка отмены записи:', error)
      setError(error instanceof Error ? error.message : 'Не удалось отменить запись')
    }
  }

  const isEnrolled = (courseId: string) => {
    return myBookings.some(
      booking =>
        booking.course.id === courseId &&
        (booking.status === 'PENDING' || booking.status === 'CONFIRMED')
    )
  }

  const getAvailableSlots = (course: Course) => {
    return course.maxStudents - course._count.bookings
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Доступные курсы</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Запись на курс: {selectedCourse.title}</h2>

            <form onSubmit={submitEnrollment} className="space-y-4">
              <div>
                <Label htmlFor="scheduledAt">Выберите дату и время</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Комментарий (необязательно)</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Особые пожелания или комментарии..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={enrolling === selectedCourse.id}>
                  {enrolling === selectedCourse.id ? 'Записываем...' : 'Записаться'}
                </Button>
                <Button type="button" variant="default" onClick={() => setSelectedCourse(null)}>
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {courses.map(course => (
          <div key={course.id} className="bg-white shadow rounded-lg overflow-hidden">
            {course.imageUrl && (
              <div className="w-full h-48 relative">
                <MegaImage
                  src={course.imageUrl}
                  alt={course.title}
                  className="object-cover"
                  isRounded={false}
                />
              </div>
            )}

            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>

              {course.description && <p className="text-gray-600 mb-4">{course.description}</p>}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Преподаватель:</span>
                  <span>{course.teacher.user.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Длительность:</span>
                  <span>{course.duration} минут</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Цена:</span>
                  <span className="font-semibold">₽ {course.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Свободных мест:</span>
                  <span
                    className={getAvailableSlots(course) > 0 ? 'text-green-600' : 'text-red-600'}
                  >
                    {getAvailableSlots(course)} / {course.maxStudents}
                  </span>
                </div>
              </div>

              {isEnrolled(course.id) ? (
                <Button disabled className="w-full bg-gray-400">
                  Уже записаны
                </Button>
              ) : getAvailableSlots(course) > 0 ? (
                <Button
                  onClick={() => handleEnroll(course)}
                  className="w-full bg-blue-800 hover:bg-blue-900"
                >
                  Записаться
                </Button>
              ) : (
                <Button disabled className="w-full">
                  Нет мест
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center mb-20 mt-20">
          <p className="text-gray-500">Курсы временно недоступны.</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Мои записи</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Курс
                </th>
                <th className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата и время
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myBookings.map(booking => (
                <tr key={booking.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{booking.course.title}</div>
                    <div className="text-sm text-gray-500">{booking.course.teacher.user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(booking.scheduledAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {booking.status === 'CONFIRMED'
                        ? 'Подтверждено'
                        : booking.status === 'PENDING'
                          ? 'В ожидании'
                          : booking.status === 'CANCELLED'
                            ? 'Отменено'
                            : booking.status === 'COMPLETED'
                              ? 'Завершено'
                              : booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => cancelBooking(booking)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Отменить
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {myBookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Записей пока нет. <br /> Запишитесь на курс, чтобы начать!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
