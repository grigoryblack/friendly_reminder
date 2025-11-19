import { NextRequest, NextResponse } from 'next/server'
import { File } from 'megajs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const megaUrl = searchParams.get('url')
    
    if (!megaUrl) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    console.log('Proxying MEGA URL:', megaUrl)

    // Create a File object from the MEGA URL
    const file = File.fromURL(megaUrl)
    
    // Download the file as buffer
    const buffer = await (file as any).downloadBuffer()
    
    console.log('Downloaded file, size:', buffer.length)
    
    // Determine content type based on file name or buffer content
    const filename = (file as any).name || 'image'
    const extension = filename.split('.').pop()?.toLowerCase()
    let contentType = 'image/jpeg' // Default to JPEG for images
    
    // Try to determine content type from extension
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      default:
        // Try to detect content type from buffer header
        if (buffer.length > 4) {
          const header = buffer.subarray(0, 4)
          if (header[0] === 0xFF && header[1] === 0xD8) {
            contentType = 'image/jpeg'
          } else if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
            contentType = 'image/png'
          } else if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
            contentType = 'image/gif'
          } else if (buffer.subarray(8, 12).toString() === 'WEBP') {
            contentType = 'image/webp'
          }
        }
        break
    }

    console.log('Returning image with content type:', contentType)

    // Return the image with appropriate headers
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json(
      { error: `Failed to fetch image: ${error}` },
      { status: 500 }
    )
  }
}
