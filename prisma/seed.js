const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create teacher user
  const teacherPassword = await bcrypt.hash('teacher123', 12);
  
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      name: 'Teacher User',
      password: teacherPassword,
      role: Role.TEACHER,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created teacher user:', teacher.email);

  // Create student user
  const studentPassword = await bcrypt.hash('student123', 12);
  
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'Student User',
      password: studentPassword,
      role: Role.STUDENT,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created student user:', student.email);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
