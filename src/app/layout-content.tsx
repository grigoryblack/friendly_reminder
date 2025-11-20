'use client'

import { useSession } from 'next-auth/react'
import { Navigation } from '@/shared/components/navigation'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const showNavigation = status !== 'loading' && !!session

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && <Navigation />}
      <main className={showNavigation ? 'pb-16 md:pb-0' : ''}>
        {children}
      </main>
    </div>
  )
}
