'use client'

import { useState } from 'react'
import Image from 'next/image'

interface MegaImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export function MegaImage({ src, alt, width = 100, height = 100, className = "" }: MegaImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if it's a MEGA URL
  const isMegaUrl = src.includes('mega.nz')
  
  // Create proxy URL for MEGA images
  const imageUrl = isMegaUrl 
    ? `/api/image-proxy?url=${encodeURIComponent(src)}`
    : src

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
        className={`flex items-center justify-center bg-gray-200 text-gray-400 rounded-full ${className}`}
        style={{ width, height }}
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {loading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse rounded-full"
          style={{ width, height }}
        >
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {isMegaUrl ? (
        // Use regular img tag for MEGA images to avoid Next.js Image issues
        <img
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200 rounded-full object-cover`}
          onError={handleError}
          onLoad={handleLoad}
        />
      ) : (
        // Use Next.js Image for regular images
        <Image
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200 rounded-full object-cover`}
          onError={handleError}
          onLoad={handleLoad}
          unoptimized={false}
        />
      )}
    </div>
  )
}
