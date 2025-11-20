'use client'

import { useState } from 'react'
import Image from 'next/image'

interface MegaImageProps {
  src: string
  alt: string
  className?: string
  isRounded?: boolean
}

export function MegaImage({
  src,
  alt,
  className = '',
  isRounded = true,
}: MegaImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if it's a MEGA URL
  const isMegaUrl = src.includes('mega.nz')

  // Create proxy URL for MEGA images
  const imageUrl = isMegaUrl ? `/api/image-proxy?url=${encodeURIComponent(src)}` : src

  console.log('MegaImage render:', { src, isMegaUrl, imageUrl })

  const handleError = (e: any) => {
    console.error('Image load error:', e, 'URL:', imageUrl)
    setError(true)
    setLoading(false)
  }

  const handleLoad = () => {
    console.log('Image loaded successfully:', imageUrl)
    setLoading(false)
  }

  // For regular URLs, use normal image handling
  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 text-gray-400 ${isRounded ? 'rounded-full' : ''} ${className}`}
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full ${isRounded ? 'rounded-full' : ''} overflow-hidden`}>
      {loading && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse ${isRounded ? 'rounded-full' : ''}`}
        >
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200 ${className}`}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={true}
      />
    </div>
  )
}
