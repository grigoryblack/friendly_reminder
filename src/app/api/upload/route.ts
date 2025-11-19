import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/shared/lib/auth-helpers'
import { MegaUploader } from '@/shared/lib/mega'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`

    // Upload to MEGA
    const megaUploader = new MegaUploader()
    const url = await megaUploader.uploadFile(buffer, filename)

    return NextResponse.json({
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type,
    })

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Upload error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Upload failed. Please try again.' 
      },
      { status: 500 }
    )
  }
}
