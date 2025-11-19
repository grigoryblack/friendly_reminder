import { DesktopNavigation } from './desktop-nav'
import { MobileNavigation } from './mobile-nav'

export function Navigation() {
  return (
    <>
      <DesktopNavigation />
      <MobileNavigation />
    </>
  )
}

export { DesktopNavigation, MobileNavigation }
