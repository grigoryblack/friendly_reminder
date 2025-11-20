'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { ImageUpload } from '@/shared/components/image-upload'
import { MegaImage } from '@/shared/components/mega-image'

interface Course {
  id: string
  title: string
  description?: string
  duration: number
  price: number
  maxStudents: number
  isActive: boolean
  imageUrl?: string
  _count: {
    bookings: number
  }
}

export default function ManageCoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    price: 0,
    maxStudents: 10,
    imageUrl: '',
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      router.push('/courses')
      return
    }

    fetchCourses()
  }, [session, status, router])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses?includeInactive=true')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Ошибка при загрузке курсов:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: 60,
      price: 0,
      maxStudents: 10,
      imageUrl: '',
    })
  }

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses'
      const method = editingCourse ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchCourses()
        setShowCreateForm(false)
        setEditingCourse(null)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при сохранении курса')
      }
    } catch (error) {
      console.error('Ошибка при сохранении курса:', error)
      alert('Ошибка при сохранении курса')
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description || '',
      duration: course.duration,
      price: course.price,
      maxStudents: course.maxStudents,
      imageUrl: course.imageUrl || '',
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот курс?')) return

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchCourses()
      } else {
        alert('Не удалось удалить курс')
      }
    } catch (error) {
      console.error('Ошибка при удалении курса:', error)
      alert('Ошибка при удалении курса')
    }
  }

  const toggleActive = async (course: Course) => {
    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...course,
          isActive: !course.isActive,
        }),
      })

      if (response.ok) {
        await fetchCourses()
      } else {
        alert('Не удалось обновить статус курса')
      }
    } catch (error) {
      console.error('Ошибка при обновлении курса:', error)
      alert('Ошибка при обновлении статуса курса')
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Загрузка...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Управление курсами</h1>
          <Button
            onClick={() => {
              setShowCreateForm(true)
              setEditingCourse(null)
              resetForm()
            }}
          >
            Создать курс
          </Button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingCourse ? 'Редактировать курс' : 'Создать новый курс'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Название курса</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Цена (₽)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Продолжительность (минуты)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxStudents">Максимум студентов</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    min="1"
                    value={formData.maxStudents}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label>Изображение курса (необязательно)</Label>
                <div className="mt-2">
                  <ImageUpload
                    currentImageUrl={formData.imageUrl}
                    onUploadSuccess={handleImageUpload}
                    buttonText="Загрузить изображение"
                    isRounded={false}
                    width={200}
                    height={150}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant={editingCourse ? 'outline' : 'default'} type="submit">
                  {editingCourse ? 'Обновить курс' : 'Создать курс'}
                </Button>
                <Button
                  type="button"
                  variant={!editingCourse ? 'outline' : 'default'}
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingCourse(null)
                    resetForm()
                  }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Courses List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Изображение
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Курс
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена и продолжительность
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Записи
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
                {courses.map(course => (
                  <tr key={course.id}>
                    <td className="px-6 py-4">
                      {course.imageUrl ? (
                        <div className="w-16 h-16 relative">
                          <MegaImage
                            src={course.imageUrl}
                            alt={course.title}
                            className="object-cover"
                            isRounded={false}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Нет фото</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-500">{course.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${course.price}</div>
                      <div className="text-sm text-gray-500">{course.duration} мин</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course._count.bookings} / {course.maxStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          course.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {course.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button variant="default" size="sm" onClick={() => handleEdit(course)}>
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(course)}
                        className={course.isActive ? 'text-red-600' : 'text-green-600'}
                      >
                        {course.isActive ? 'Деактивировать' : 'Активировать'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {courses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Курсы не найдены. Создайте свой первый курс!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
