'use client'

import { useSession } from 'next-auth/react'
import { DesktopNavigation } from './desktop-nav'
import { MobileNavigation } from './mobile-nav'

export function Navigation() {
  const { data: session, status } = useSession()

  // Не показываем навигацию если пользователь не авторизован
  if (status === 'loading') {
    return null // Или можно показать skeleton
  }

  if (!session) {
    return null
  }

  return (
    <>
      <DesktopNavigation />
      <MobileNavigation />
    </>
  )
}

export { DesktopNavigation, MobileNavigation }
