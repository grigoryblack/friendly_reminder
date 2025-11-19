import { getServerSession } from 'next-auth'
import { authOptions } from '@/shared/config/auth'
import { Role } from '@prisma/client'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth()
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Forbidden')
  }
  return session
}
