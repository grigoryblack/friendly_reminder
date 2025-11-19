import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/shared/config/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    // Если пользователь авторизован, перенаправляем на расписание
    redirect('/schedule')
  } else {
    // Если не авторизован, перенаправляем на страницу входа
    redirect('/auth/login')
  }
}
