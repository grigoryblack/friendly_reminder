import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NextAuthProvider } from '@/shared/providers/session-provider'
import { LayoutContent } from './layout-content'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Friendly Reminder',
  description: 'Course booking and management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </NextAuthProvider>
      </body>
    </html>
  )
}
