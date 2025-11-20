'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, BookOpen, Users, GraduationCap, Heart, CheckCircle } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'PARENT' | 'TEACHER',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Аккаунт успешно создан! Теперь вы можете войти.')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        setError(data.error || 'Ошибка регистрации')
      }
    } catch (error) {
      setError('Произошла ошибка. Попробуйте снова.')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return <GraduationCap className="w-5 h-5" />
      case 'PARENT':
        return <Heart className="w-5 h-5" />
      case 'TEACHER':
        return <Users className="w-5 h-5" />
      default:
        return <GraduationCap className="w-5 h-5" />
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return 'Доступ к курсам и расписанию обучения'
      case 'PARENT':
        return 'Отслеживайте прогресс и занятия ребёнка'
      case 'TEACHER':
        return 'Создавайте курсы, управляйте учениками, отслеживайте результаты'
      default:
        return 'Выберите роль, чтобы начать'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Левая сторона - Брендинг */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center bg-blue-800">
                  <BookOpen className="w-6 h-6 text-primary-foreground bg-blue-800" />
                </div>
                <h1 className="text-3xl font-bold text-primary">Friendly Reminder</h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Присоединяйтесь к нашему обучающему сообществу
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Лёгкая регистрация</h3>
                  <p className="text-sm text-muted-foreground">
                    Быстрый процесс с доступом согласно роли
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-800" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Сообщество</h3>
                  <p className="text-sm text-muted-foreground">
                    Общайтесь с учителями и учениками по всему миру
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Богатый опыт обучения</h3>
                  <p className="text-sm text-muted-foreground">
                    Интерактивные курсы и персональное расписание
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Правая сторона - Форма регистрации */}
          <div className="w-full max-w-md mx-auto space-y-6">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Создать аккаунт</CardTitle>
                <CardDescription className="text-center">
                  Выберите роль и начните работу
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>{success}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Полное имя</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Введите ваше имя"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Введите ваш email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Создайте пароль (мин. 6 символов)"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Роль</Label>
                    <Select
                      id="role"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    >
                      <option value="STUDENT">Ученик</option>
                      <option value="PARENT">Родитель</option>
                      <option value="TEACHER">Учитель</option>
                    </Select>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
                      {getRoleIcon(formData.role)}
                      <span>{getRoleDescription(formData.role)}</span>
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                    {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
                  </Button>

                  <div className="text-center">
                    <span className="text-sm text-muted-foreground">
                      Уже есть аккаунт?{' '}
                      <Link
                        href="/auth/login"
                        className="text-primary hover:text-primary/80 underline-offset-4 hover:underline font-medium"
                      >
                        Войти
                      </Link>
                    </span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
