const { PrismaClient, Role } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Pre-hashed passwords (bcrypt hash of 'admin123', 'teacher123', 'student123')
  const adminPassword = '$2a$12$bFZr3ld/UwWHf5V.Swt1NOFZABL4d7Y5WWBRLM3Y1.Q8rlPEG8Smy'; // admin123
  const teacherPassword = '$2a$12$aI1sn9JgDcFpp/ecA1UcLuFnTdraYMwYDVKjR0Y8fA0FH/VMIxIjK'; // teacher123  
  const studentPassword = '$2a$12$KxQjEBA3x4/EcpE00blW5uONriNjEmuUmFOm4LEXWIyCyZerX5qp.'; // student123
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@friendly-reminder.com' },
    update: {},
    create: {
      email: 'admin@friendly-reminder.com',
      name: 'Admin User',
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create teacher user
  
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@friendly-reminder.com' },
    update: {},
    create: {
      email: 'teacher@friendly-reminder.com',
      name: 'Teacher User',
      password: teacherPassword,
      role: Role.TEACHER,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created teacher user:', teacher.email);

  // Create student user
  const student = await prisma.user.upsert({
    where: { email: 'student@friendly-reminder.com' },
    update: {},
    create: {
      email: 'student@friendly-reminder.com',
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
