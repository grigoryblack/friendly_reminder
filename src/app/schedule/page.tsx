'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Eye, X, Calendar, Clock, User, FileText } from 'lucide-react'

interface Booking {
  id: string
  scheduledAt: string
  status: string
  notes?: string
  user: {
    name?: string
    email?: string
  }
  course: {
    id: string
    title: string
    description?: string
    duration: number
    price: number
    teacher: {
      user: {
        name?: string
        email?: string
      }
    }
  }
}

export default function SchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [cancellingBooking, setCancellingBooking] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    fetchBookings()
  }, [session, status, router])

  const fetchBookings = async () => {
    try {
      const isTeacher = session?.user.role === 'TEACHER' || session?.user.role === 'ADMIN'
      const endpoint = isTeacher ? '/api/bookings/teacher' : '/api/bookings'
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Не удалось загрузить бронирования:', error)
    } finally {
      setLoading(false)
    }
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

  if (!session) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isTeacher = session?.user.role === 'TEACHER' || session?.user.role === 'ADMIN'

  const getTodayBookings = () => {
    const today = new Date()
    const todayStr = today.toDateString()
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledAt)
      return bookingDate.toDateString() === todayStr
    })
  }

  const getSelectedDateBookings = () => {
    const selectedStr = selectedDate.toDateString()
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledAt)
      return bookingDate.toDateString() === selectedStr
    })
  }

  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const openDetailsModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setSelectedBooking(null)
    setShowDetailsModal(false)
  }

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Вы уверены, что хотите отменить эту запись?')) {
      return
    }

    setCancellingBooking(true)

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Обновляем список записей
        await fetchBookings()
        // Закрываем модальное окно
        closeDetailsModal()
        alert('Запись успешно отменена')
      } else {
        const error = await response.json()
        alert(error.message || 'Ошибка при отмене записи')
      }
    } catch (error) {
      console.error('Ошибка при отмене записи:', error)
      alert('Произошла ошибка при отмене записи')
    } finally {
      setCancellingBooking(false)
    }
  }

  const generateCalendar = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const hasBookings = bookings.some(booking => {
        const bookingDate = new Date(booking.scheduledAt)
        return bookingDate.toDateString() === date.toDateString()
      })
      days.push({ day, date, hasBookings, isToday: date.toDateString() === today.toDateString() })
    }

    return days
  }

  if (isTeacher) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
            <h1 className="text-3xl font-bold">Расписание занятий</h1>
            <div className="space-x-2">
              <Link href="/courses/manage">
                <Button variant="default">Управление курсами</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Calendar */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Календарь</h2>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
                  <div key={day} className="font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
                {generateCalendar().map((day, index) => (
                  <div key={index} className="p-2 h-10 flex items-center justify-center">
                    {day && (
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm cursor-pointer transition-colors ${
                          day.date.toDateString() === selectedDate.toDateString()
                            ? 'bg-blue-800 text-white'
                            : day.isToday
                              ? 'bg-blue-100 text-blue-800 border-2 border-blue-800'
                              : day.hasBookings
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedDate(day.date)}
                      >
                        {day.day}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Summary */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Сегодня</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Всего занятий:</span>
                  <span className="font-semibold text-lg">{getTodayBookings().length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Подтверждено:</span>
                  <span className="font-semibold text-green-600">
                    {getTodayBookings().filter(b => b.status === 'CONFIRMED').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">В ожидании:</span>
                  <span className="font-semibold text-yellow-600">
                    {getTodayBookings().filter(b => b.status === 'PENDING').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Date Bookings Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Занятия на {formatSelectedDate()}</h2>
            </div>
            {getSelectedDateBookings().length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">На выбранную дату занятий нет</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Время
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Курс
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Студент
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getSelectedDateBookings().map(booking => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(booking.scheduledAt).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.course.title}
                          </div>
                          <div className="text-sm text-gray-500">{booking.course.duration} мин</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.user.name}
                          </div>
                          <div className="text-sm text-gray-500">{booking.user.email}</div>
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
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {booking.status === 'CONFIRMED' && 'Подтверждено'}
                            {booking.status === 'PENDING' && 'В ожидании'}
                            {booking.status === 'CANCELLED' && 'Отменено'}
                            {booking.status === 'COMPLETED' && 'Завершено'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Student view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-3xl font-bold">Моё расписание</h1>
          {bookings.length !== 0 && (
            <div className="space-x-2">
              <Link href="/courses">
                <Button variant="default">Просмотр курсов</Button>
              </Link>
            </div>
          )}
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Бронирований пока нет</h3>
            <p className="text-gray-500 mb-4">Вы ещё не записались ни на один курс.</p>
            <Link href="/courses">
              <Button>Просмотреть доступные курсы</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Курс
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Преподаватель
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата и время
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Длительность и цена
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
                    {bookings.map(booking => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.course.title}
                          </div>
                          <div className="text-sm text-gray-500">{booking.course.description}</div>
                          {booking.notes && (
                            <div className="text-xs text-blue-600 mt-1">
                              Примечание: {booking.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.course.teacher.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.course.teacher.user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(booking.scheduledAt).toLocaleString('ru-RU')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.course.duration} мин</div>
                          <div className="text-sm text-gray-500">₽{booking.course.price}</div>
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
                                    : booking.status === 'COMPLETED'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
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
                          <div className="flex space-x-3">
                            <button
                              className="text-blue-800 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="Подробнее"
                              onClick={() => openDetailsModal(booking)}
                            >
                              Подробнее
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно с деталями записи */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Заголовок модального окна */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Детали записи</h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Содержимое модального окна */}
            <div className="p-6 space-y-6">
              {/* Информация о курсе */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Информация о курсе</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedBooking.course.title}</p>
                      {selectedBooking.course.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {selectedBooking.course.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.course.teacher.user.name}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {selectedBooking.course.teacher.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Длительность</p>
                        <p className="font-medium text-gray-900">
                          {selectedBooking.course.duration} минут
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 text-blue-600 flex-shrink-0 flex items-center justify-center">
                        <span className="text-sm font-bold">₽</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Стоимость</p>
                        <p className="font-medium text-gray-900">
                          {selectedBooking.course.price} ₽
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Информация о записи */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Детали записи</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Дата и время</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedBooking.scheduledAt).toLocaleString('ru-RU', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Статус записи</p>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        selectedBooking.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : selectedBooking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : selectedBooking.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : selectedBooking.status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedBooking.status === 'CONFIRMED'
                        ? 'Подтверждено'
                        : selectedBooking.status === 'PENDING'
                          ? 'В ожидании'
                          : selectedBooking.status === 'CANCELLED'
                            ? 'Отменено'
                            : selectedBooking.status === 'COMPLETED'
                              ? 'Завершено'
                              : selectedBooking.status}
                    </span>
                  </div>

                  {selectedBooking.notes && (
                    <div className="bg-blue-50 rounded p-3 border-l-4 border-blue-800">
                      <p className="text-sm text-gray-500 mb-1">Ваши примечания:</p>
                      <p className="text-gray-900">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button variant="outline" onClick={closeDetailsModal}>
                Закрыть
              </Button>
              {(selectedBooking.status === 'PENDING' || selectedBooking.status === 'CONFIRMED') && (
                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => cancelBooking(selectedBooking.id)}
                  disabled={cancellingBooking}
                >
                  {cancellingBooking ? 'Отменяем...' : 'Отменить запись'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
