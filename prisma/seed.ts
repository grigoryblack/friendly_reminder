import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@friendly-reminder.com' },
    update: {},
    create: {
      email: 'admin@friendly-reminder.com',
      name: 'System Administrator',
      password: hashedPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created admin user:', admin.email)

  // Create sample teacher
  const teacherPassword = await bcrypt.hash('teacher123', 12)
  
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@friendly-reminder.com' },
    update: {},
    create: {
      email: 'teacher@friendly-reminder.com',
      name: 'John Teacher',
      password: teacherPassword,
      role: Role.TEACHER,
      emailVerified: new Date(),
    },
  })

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      bio: 'Experienced mathematics teacher with 10+ years of experience',
      experience: '10 years',
      specialties: ['Mathematics', 'Physics', 'Calculus'],
      hourlyRate: 50.0,
    },
  })

  console.log('✅ Created teacher:', teacherUser.email)

  // Create sample course
  const course = await prisma.course.upsert({
    where: { id: 'sample-course-1' },
    update: {},
    create: {
      id: 'sample-course-1',
      title: 'Advanced Mathematics',
      description: 'Learn advanced mathematical concepts including calculus, algebra, and geometry.',
      duration: 60,
      price: 50.0,
      maxStudents: 5,
      teacherId: teacher.id,
    },
  })

  console.log('✅ Created course:', course.title)

  // Create sample student
  const studentPassword = await bcrypt.hash('student123', 12)
  
  const student = await prisma.user.upsert({
    where: { email: 'student@friendly-reminder.com' },
    update: {},
    create: {
      email: 'student@friendly-reminder.com',
      name: 'Jane Student',
      password: studentPassword,
      role: Role.STUDENT,
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created student:', student.email)

  console.log('🎉 Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
