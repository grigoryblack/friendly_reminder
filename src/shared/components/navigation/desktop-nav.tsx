'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Calendar, BookOpen, User, Settings, GraduationCap, Users, LogOut } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { MegaImage } from '@/shared/components/mega-image'

const navigationItems = [
  {
    name: 'Расписание',
    href: '/schedule',
    icon: Calendar,
    roles: ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN'],
  },
  {
    name: 'Курсы',
    href: '/courses',
    icon: BookOpen,
    roles: ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN'],
  },
  {
    name: 'Запись на курсы',
    href: '/courses/enroll',
    icon: GraduationCap,
    roles: ['STUDENT', 'PARENT'],
  },
  {
    name: 'Управление курсами',
    href: '/courses/manage',
    icon: Users,
    roles: ['TEACHER', 'ADMIN'],
  },
]

export function DesktopNavigation() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  const userRole = session.user.role
  const filteredItems = navigationItems.filter(item => item.roles.includes(userRole))

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center bg-blue-800">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <Link href="/schedule" className="font-bold text-lg text-primary">
              Friendly Reminder
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {filteredItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {userRole === 'STUDENT' && 'Студент'}
                  {userRole === 'PARENT' && 'Родитель'}
                  {userRole === 'TEACHER' && 'Преподаватель'}
                  {userRole === 'ADMIN' && 'Администратор'}
                </p>
              </div>
              <Link href="/profile" className="block">
                {session.user.image ? (
                  <div className="w-8 h-8 relative">
                    <MegaImage
                      src={session.user.image}
                      alt={session.user.name || 'Профиль'}
                      className="object-cover hover:opacity-80 transition-opacity cursor-pointer"
                      isRounded={true}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
              </Link>
            </div>

            {/* Sign Out */}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:ml-2 sm:inline">Выйти</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
