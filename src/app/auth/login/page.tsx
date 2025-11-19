'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, BookOpen, Users, GraduationCap, Shield } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Неверные учетные данные')
      } else {
        router.push('/schedule')
      }
    } catch (error) {
      setError('Произошла ошибка. Попробуйте еще раз.')
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = async (role: string, email: string, password: string) => {
    setEmail(email)
    setPassword(password)
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Неверные учетные данные')
      } else {
        router.push('/schedule')
      }
    } catch (error) {
      setError('Произошла ошибка. Попробуйте еще раз.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-primary">Friendly Reminder</h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Ваша комплексная платформа для обучения
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Для преподавателей</h3>
                  <p className="text-sm text-muted-foreground">Создавайте курсы и отслеживайте прогресс студентов</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Для студентов</h3>
                  <p className="text-sm text-muted-foreground">Записывайтесь на курсы и управляйте расписанием</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Для администраторов</h3>
                  <p className="text-sm text-muted-foreground">Полное управление платформой и контроль</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto space-y-6">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Добро пожаловать</CardTitle>
                <CardDescription className="text-center">
                  Войдите в свой аккаунт для продолжения
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Электронная почта</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Введите ваш email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Введите ваш пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="default"
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

                  <div className="flex items-center justify-between">
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                    >
                      Забыли пароль?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? 'Вход...' : 'Войти'}
                  </Button>

                  <div className="text-center">
                    <span className="text-sm text-muted-foreground">
                      Нет аккаунта?{' '}
                      <Link
                        href="/auth/register"
                        className="text-primary hover:text-primary/80 underline-offset-4 hover:underline font-medium"
                      >
                        Зарегистрироваться
                      </Link>
                    </span>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Quick Login Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Тестовые аккаунты</CardTitle>
                <CardDescription>
                  Быстрый вход для тестирования ролей
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="default"
                  className="w-full justify-start"
                  onClick={() => quickLogin('admin', 'admin@friendly-reminder.com', 'admin123')}
                  disabled={isLoading}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Войти как администратор
                </Button>
                <Button
                  variant="default"
                  className="w-full justify-start"
                  onClick={() => quickLogin('teacher', 'teacher@friendly-reminder.com', 'teacher123')}
                  disabled={isLoading}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Войти как преподаватель
                </Button>
                <Button
                  variant="default"
                  className="w-full justify-start"
                  onClick={() => quickLogin('student', 'student@friendly-reminder.com', 'student123')}
                  disabled={isLoading}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Войти как студент
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
