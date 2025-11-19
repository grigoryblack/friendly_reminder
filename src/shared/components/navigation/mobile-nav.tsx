'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Calendar, BookOpen, User, Settings, GraduationCap, Users } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const navigationItems = [
  {
    name: 'Расписание',
    href: '/schedule',
    icon: Calendar,
    roles: ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN']
  },
  {
    name: 'Курсы',
    href: '/courses',
    icon: BookOpen,
    roles: ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN']
  },
  {
    name: 'Студенты',
    href: '/courses/enroll',
    icon: GraduationCap,
    roles: ['STUDENT', 'PARENT']
  },
  {
    name: 'Управление',
    href: '/courses/manage',
    icon: Users,
    roles: ['TEACHER', 'ADMIN']
  },
  {
    name: 'Профиль',
    href: '/profile',
    icon: User,
    roles: ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN']
  }
]

export function MobileNavigation() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  const userRole = session.user.role
  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <nav className="flex items-center justify-around py-2">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mb-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
