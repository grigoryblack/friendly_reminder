'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'

interface Booking {
  id: string
  scheduledAt: string
  status: string
  notes?: string
  course: {
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
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Loading...</div>
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
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <div className="space-x-2">
            <Link href="/courses">
              <Button variant="default">Просмотр курсов</Button>
            </Link>
            <Link href="/">
              <Button variant="default">На главную</Button>
            </Link>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-4">You haven't booked any courses yet.</p>
            <Link href="/courses">
              <Button>Browse Available Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration & Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.course.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.course.description}
                        </div>
                        {booking.notes && (
                          <div className="text-xs text-blue-600 mt-1">
                            Note: {booking.notes}
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
                        {new Date(booking.scheduledAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.course.duration} min</div>
                        <div className="text-sm text-gray-500">${booking.course.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            View Details
                          </button>
                          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                            <button className="text-red-600 hover:text-red-900">
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
