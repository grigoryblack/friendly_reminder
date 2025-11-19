import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/shared/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image || user.avatarUrl, // Prefer image field, fallback to avatarUrl
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.image = user.image
      }
      
      // Handle session updates (when update() is called)
      if (trigger === 'update' && session) {
        if (session.image) {
          token.image = session.image
        }
      }
      
      // Refresh user data from database on each token refresh
      if (token.sub && !user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              avatarUrl: true,
              role: true,
            }
          })
          
          if (dbUser) {
            token.image = dbUser.image || dbUser.avatarUrl
            token.role = dbUser.role
          }
        } catch (error) {
          console.error('Error refreshing user data:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as any
        session.user.image = token.image as string | null
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
