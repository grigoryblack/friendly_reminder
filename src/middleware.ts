import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Публичные маршруты (доступны только НЕавторизованным)
const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/reset-password',
]

// Защищенные маршруты (доступны только авторизованным)
const protectedRoutes = [
  '/schedule',
  '/courses',
  '/profile',
  '/admin',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Получаем токен пользователя
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuthenticated = !!token

  // Проверяем auth маршруты (login, register, forgot-password)
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Проверяем защищенные маршруты
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Если пользователь авторизован и пытается зайти на auth страницы
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/schedule', request.url))
  }

  // Если пользователь НЕ авторизован и пытается зайти на защищенные страницы
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Настройка matcher для оптимизации
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
