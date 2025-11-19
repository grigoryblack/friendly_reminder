'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ImageUpload } from '@/shared/components/image-upload'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [sessionUpdateAttempted, setSessionUpdateAttempted] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    setName(session.user.name || '')
    setEmail(session.user.email || '')
    setAvatarUrl(session.user.image || '')
  }, [session, status, router])

  // Update avatar URL when session changes
  useEffect(() => {
    console.log('Profile: session.user.image changed to:', session?.user.image)
    const newAvatarUrl = session?.user.image || ''
    setAvatarUrl(prev => {
      if (prev === newAvatarUrl) {
        return prev // Prevent unnecessary updates
      }
      return newAvatarUrl
    })
  }, [session?.user.image])

  // Check if avatar is missing in session but might exist in database
  useEffect(() => {
    const checkAndUpdateAvatar = async () => {
      if (
        session?.user &&
        !session.user.image &&
        status === 'authenticated' &&
        !sessionUpdateAttempted
      ) {
        try {
          console.log('Attempting to update session for missing avatar...')
          setSessionUpdateAttempted(true)
          // Force refresh the session to get latest data from database
          await update()
        } catch (error) {
          console.error('Error updating session:', error)
        }
      }
    }

    checkAndUpdateAvatar()
  }, [session, status, update, sessionUpdateAttempted])

  if (status === 'loading') {
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

  const handleSave = async () => {
    // TODO: Implement profile update API
    setIsEditing(false)
  }

  const handleAvatarUploadSuccess = (url: string) => {
    setAvatarUrl(url)
    setUploadError('')
    // Avatar is automatically saved to database via autoSaveToProfile
  }

  const handleAvatarUploadError = (error: string) => {
    setUploadError(error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Профиль</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <ImageUpload
                currentImageUrl={avatarUrl}
                onUploadSuccess={handleAvatarUploadSuccess}
                onUploadError={handleAvatarUploadError}
                autoSaveToProfile={true}
              />
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
                  {uploadError}
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Информация</h2>
                <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
                  {isEditing ? 'Отмена' : 'Редактировать'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="role">Роль</Label>
                <Input id="role" value={session.user.role} disabled className="mt-1 bg-gray-50" />
              </div>

              <div>
                <Label htmlFor="id">Персональный ID</Label>
                <Input id="id" value={session.user.id} disabled className="mt-1 bg-gray-50" />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-2">
                <Button onClick={handleSave}>Сохранить изменения</Button>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Доступные действия</h3>
            <div className="space-y-2">
              <Link href="/reset-password">
                <Button variant="default" className="w-full md:w-auto">
                  Изменить пароль
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
