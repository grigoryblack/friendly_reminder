'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'

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
    id: string
    user: {
      name: string
      email: string
    }
  }
  _count: {
    bookings: number
  }
}

export default function CoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    fetchCourses()
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

  const isTeacher = session?.user.role === 'TEACHER' || session?.user.role === 'ADMIN'
  const isStudent = session?.user.role === 'STUDENT' || session?.user.role === 'PARENT'

  const canEditCourse = (course: Course) => {
    if (session?.user.role === 'ADMIN') return true
    if (session?.user.role === 'TEACHER') {
      return true
    }
    return false
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Курсы</h1>

        <div className="flex gap-4">
          {isTeacher && (
            <Link href="/courses/manage">
              <Button className="bg-blue-600 hover:bg-blue-700">Управлять курсами</Button>
            </Link>
          )}

          {isStudent && (
            <Link href="/courses/enroll">
              <Button className="bg-green-600 hover:bg-green-700">Записаться на курсы</Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Карточки курсов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white shadow rounded-lg overflow-hidden">
            {course.imageUrl && (
              <img src={course.imageUrl} alt={course.title} className="w-full h-48 object-cover" />
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
                  <span className="font-semibold">${course.price}</span>
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

              <div className="flex gap-2">
                {isStudent && (
                  <Link href="/courses/enroll" className="flex-1">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={getAvailableSlots(course) === 0}
                    >
                      {getAvailableSlots(course) > 0 ? 'Записаться' : 'Мест нет'}
                    </Button>
                  </Link>
                )}

                {isTeacher && canEditCourse(course) && (
                  <Link href="/courses/manage" className="flex-1">
                    <Button variant="default" className="w-full">
                      Редактировать курс
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Курсы отсутствуют</h3>
            <p className="text-gray-500 mb-4">
              {isTeacher
                ? 'Вы еще не создали ни одного курса. Начните с создания первого курса!'
                : 'В настоящее время нет доступных курсов для записи.'}
            </p>
            {isTeacher && (
              <Link href="/courses/manage">
                <Button>Создать первый курс</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Информация для ролей */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          {isTeacher ? 'Для преподавателей' : 'Для студентов'}
        </h2>
        <p className="text-blue-700 mb-4">
          {isTeacher
            ? 'Создавайте и управляйте своими курсами, отслеживайте записи студентов и обновляйте информацию о курсах.'
            : 'Просматривайте доступные курсы, записывайтесь на интересующие занятия и управляйте своим расписанием.'}
        </p>
        <div className="flex gap-2">
          {isTeacher ? (
            <>
              <Link href="/courses/manage">
                <Button variant="default">Управление курсами</Button>
              </Link>
              <Link href="/schedule">
                <Button variant="default">Посмотреть расписание</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/courses/enroll">
                <Button variant="default">Записаться на курсы</Button>
              </Link>
              <Link href="/schedule">
                <Button variant="default">Мое расписание</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
