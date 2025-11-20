'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle, BookOpen } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Не удалось отправить письмо для сброса пароля')
      }
    } catch (error) {
      setError('Произошла ошибка. Пожалуйста, попробуйте снова.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Проверьте почту</CardTitle>
                <CardDescription>
                  Мы отправили ссылку для сброса пароля на <strong>{email}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-sm text-muted-foreground">
                  <p>Не получили письмо? Проверьте папку "Спам" или</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => {
                      setIsSubmitted(false)
                      setEmail('')
                    }}
                  >
                    попробуйте с другим email
                  </Button>
                </div>

                <div className="pt-4">
                  <Link href="/auth/login">
                    <Button variant="default" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Назад к входу
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Левая часть - Брендинг */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-primary">Friendly Reminder</h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Не переживайте, мы поможем вам восстановить доступ
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-800" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Безопасное восстановление</h3>
                  <p className="text-sm text-muted-foreground">
                    Мы отправим вам защищённую ссылку для сброса пароля
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Быстро и удобно</h3>
                  <p className="text-sm text-muted-foreground">
                    Сбросьте пароль всего в несколько кликов
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Правая часть - Форма */}
          <div className="w-full max-w-md mx-auto">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                  Восстановление пароля
                </CardTitle>
                <CardDescription className="text-center">
                  Введите email, и мы отправим ссылку для сброса пароля
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
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Введите ваш email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="pl-10"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                    {isLoading ? 'Отправка...' : 'Отправить ссылку'}
                  </Button>

                  <div className="text-center">
                    <Link
                      href="/auth/login"
                      className="text-sm text-muted-foreground hover:text-primary inline-flex items-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Назад к входу
                    </Link>
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
