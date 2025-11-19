'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export default function ResetPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const token = searchParams.get('token')
  
  // Определяем режим: сброс по токену или смена пароля авторизованным пользователем
  const isTokenReset = !!token
  const isLoggedInUser = !isTokenReset && session?.user

  useEffect(() => {
    // Если нет токена и пользователь не авторизован, перенаправляем на логин
    if (!isTokenReset && status !== 'loading' && !session) {
      router.push('/auth/login')
    }
  }, [isTokenReset, session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Для авторизованных пользователей требуется текущий пароль
    if (isLoggedInUser && !currentPassword) {
      setError('Current password is required')
      setIsLoading(false)
      return
    }

    try {
      let response
      
      if (isTokenReset) {
        // Сброс пароля по токену
        response = await fetch('/api/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            password: newPassword,
          }),
        })
      } else {
        // Смена пароля авторизованным пользователем
        response = await fetch('/api/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        })
      }

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          if (isLoggedInUser) {
            router.push('/profile')
          } else {
            router.push('/auth/login')
          }
        }, 2000)
      } else {
        setError(data.error || 'Failed to update password')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md text-center">
          <div className="text-green-600">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Password Reset Successful!</h2>
          <p className="text-gray-600">Your password has been updated. Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center">
            {isTokenReset ? 'Reset Password' : 'Change Password'}
          </h2>
          <p className="mt-2 text-center text-gray-600">
            {isTokenReset 
              ? 'Enter your new password below' 
              : 'Enter your current password and new password'
            }
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {isLoggedInUser && (
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter current password"
              />
            </div>
          )}

          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1"
              placeholder="Confirm new password"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading 
              ? (isTokenReset ? 'Resetting...' : 'Changing...') 
              : (isTokenReset ? 'Reset Password' : 'Change Password')
            }
          </Button>

          <div className="text-center">
            <Link
              href={isLoggedInUser ? "/profile" : "/auth/login"}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isLoggedInUser ? 'Back to Profile' : 'Back to Login'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
