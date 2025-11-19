import { Storage } from 'megajs'

export class MegaUploader {
  private storage: Storage | null = null

  constructor() {
    // Initialize storage lazily to avoid connection issues
  }

  private async initStorage(): Promise<Storage> {
    if (this.storage) {
      return this.storage
    }

    console.log('Initializing MEGA storage...')
    
    const storage = new Storage({
      email: process.env.MEGA_EMAIL!,
      password: process.env.MEGA_PASSWORD!,
    })

    await storage.ready
    console.log('MEGA storage ready')
    this.storage = storage
    return storage
  }

  async uploadFile(buffer: Buffer, filename: string): Promise<string> {
    try {
      console.log(`Starting upload of ${filename} (${buffer.length} bytes)`)
      const storage = await this.initStorage()

      return new Promise((resolve, reject) => {
        // Create upload stream
        const uploadStream = (storage as any).upload({
          name: filename,
          size: buffer.length,
        })

        uploadStream.on('error', (error: Error) => {
          console.error('Upload stream error:', error)
          reject(new Error(`Upload failed: ${error.message}`))
        })

        uploadStream.on('complete', (file: any) => {
          console.log('Upload completed, generating download link...')
          try {
            // Try to get direct download URL
            if (file.downloadUrl) {
              console.log('Direct download URL found:', file.downloadUrl)
              resolve(file.downloadUrl)
            } else {
              // Generate public link and try to get download URL from it
              file.link((error: Error | null, link: string) => {
                if (error) {
                  console.error('Link generation failed:', error)
                  reject(new Error(`Link generation failed: ${error.message}`))
                } else {
                  console.log('Public link generated:', link)
                  // Try to get download URL from the file object
                  this.getDownloadUrl(file).then((downloadUrl) => {
                    console.log('Download URL obtained:', downloadUrl)
                    resolve(downloadUrl)
                  }).catch((downloadError) => {
                    console.error('Failed to get download URL:', downloadError)
                    // Fallback to public link
                    resolve(link)
                  })
                }
              })
            }
          } catch (linkError) {
            console.error('Link generation failed:', linkError)
            reject(new Error(`Link generation failed: ${linkError}`))
          }
        })

        // Write buffer to stream
        try {
          uploadStream.write(buffer)
          uploadStream.end()
        } catch (writeError) {
          console.error('Write error:', writeError)
          reject(new Error(`Write failed: ${writeError}`))
        }
      })
    } catch (error) {
      console.error('MEGA upload error:', error)
      
      // Fallback to mock URL in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: returning mock URL due to error')
        return `https://mega.nz/file/mock-${Date.now()}-${filename}`
      }
      
      throw new Error(`MEGA upload failed: ${error}`)
    }
  }

  async uploadFromBase64(base64Data: string, filename: string): Promise<string> {
    // Remove data URL prefix if present
    const base64String = base64Data.replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(base64String, 'base64')
    return this.uploadFile(buffer, filename)
  }

  private async getDownloadUrl(file: any): Promise<string> {
    try {
      // Try different methods to get download URL
      if (file.downloadUrl) {
        return file.downloadUrl
      }
      
      // Try to get download stream and extract URL
      const downloadStream = file.download()
      if (downloadStream && downloadStream.downloadUrl) {
        return downloadStream.downloadUrl
      }
      
      // If no direct URL available, return the file's public link
      return new Promise((resolve, reject) => {
        file.link((error: Error | null, link: string) => {
          if (error) {
            reject(error)
          } else {
            resolve(link)
          }
        })
      })
    } catch (error) {
      throw new Error(`Failed to get download URL: ${error}`)
    }
  }

  private convertToDirectLink(publicLink: string): string {
    // Convert MEGA public link to direct download link
    // Format: https://mega.nz/file/ID#KEY -> https://mega.nz/#!ID!KEY
    try {
      const url = new URL(publicLink)
      if (url.hostname === 'mega.nz' && url.pathname.startsWith('/file/')) {
        const pathParts = url.pathname.split('/')
        const fileId = pathParts[2]
        const key = url.hash.substring(1) // Remove # from hash
        
        if (fileId && key) {
          // Return the direct download format
          return `https://mega.nz/#!${fileId}!${key}`
        }
      }
    } catch (error) {
      console.error('Error converting MEGA link:', error)
    }
    
    // Return original link if conversion fails
    return publicLink
  }
}
