'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { MegaImage } from './mega-image'

interface ImageUploadProps {
  onUploadSuccess?: (url: string) => void
  onUploadError?: (error: string) => void
  currentImageUrl?: string
  className?: string
  autoSaveToProfile?: boolean
  buttonText?: string
  isRounded?: boolean
  width?: number
  height?: number
}

export function ImageUpload({ 
  onUploadSuccess, 
  onUploadError, 
  currentImageUrl,
  className = "",
  autoSaveToProfile = false,
  buttonText = "Изменить аватар",
  isRounded = true,
  width = 128,
  height = 128
}: ImageUploadProps) {
  const { update } = useSession()
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // console.log('ImageUpload render:', { currentImageUrl, previewUrl })

  // Update preview URL when currentImageUrl changes
  useEffect(() => {
    // console.log('ImageUpload: currentImageUrl changed to:', currentImageUrl)
    const newPreviewUrl = currentImageUrl || null
    setPreviewUrl(prev => {
      if (prev === newPreviewUrl) {
        return prev // Prevent unnecessary updates
      }
      return newPreviewUrl
    })
  }, [currentImageUrl])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.('Invalid file type. Only images are allowed.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      onUploadError?.('File too large. Maximum size is 5MB.')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        const uploadedUrl = data.url
        
        // If autoSaveToProfile is enabled, save to user profile
        if (autoSaveToProfile) {
          try {
            const profileResponse = await fetch('/api/profile/avatar', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ avatarUrl: uploadedUrl }),
            })

            if (profileResponse.ok) {
              console.log('Avatar saved to profile successfully')
              // Update NextAuth session with new avatar
              await update({ image: uploadedUrl })
              console.log('Session updated with new avatar')
            } else {
              console.error('Failed to save avatar to profile')
            }
          } catch (profileError) {
            console.error('Error saving avatar to profile:', profileError)
          }
        }
        
        onUploadSuccess?.(uploadedUrl)
      } else {
        onUploadError?.(data.error || 'Upload failed')
        setPreviewUrl(currentImageUrl || null) // Reset preview on error
      }
    } catch (error) {
      onUploadError?.('Upload failed. Please try again.')
      setPreviewUrl(currentImageUrl || null) // Reset preview on error
    } finally {
      setUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Image Preview */}
        <div
          className="relative overflow-hidden"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {previewUrl ? (
            <MegaImage
              src={previewUrl}
              alt="Image preview"
              className={`${isRounded ? 'object-cover' : 'object-contain'} border-4 border-gray-200 ${isRounded ? 'rounded-full' : ''}`}
              isRounded={isRounded}
            />
          ) : (
            <div 
              className={`bg-gray-200 flex items-center justify-center border-4 border-gray-200 ${isRounded ? 'rounded-full' : ''}`}
              style={{ width: `${width}px`, height: `${height}px` }}
            >
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {uploading && (
            <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isRounded ? 'rounded-full' : ''}`}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <Button
          type="button"
          onClick={handleButtonClick}
          disabled={uploading}
          variant="outline"
          size="sm"
        >
          {uploading ? 'Загрузка...' : buttonText}
        </Button>

        {/* Hidden File Input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Info */}
      <div className="text-xs text-gray-500 text-center">
        <p>Supported formats: JPEG, PNG, GIF, WebP</p>
        <p>Maximum size: 5MB</p>
      </div>
    </div>
  )
}
