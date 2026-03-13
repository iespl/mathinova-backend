import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupPaidCourseTest() {
  console.log('🔧 Setting up paid course expiry test...\n');

  // 1. Update the paid course to have validityDays
  const paidCourse = await prisma.course.update({
    where: { id: 'course-struct-eng-v1' },
    data: { validityDays: 365 }, // 365 days validity
  });
  console.log(`✅ Updated course "${paidCourse.title}" with validityDays: ${paidCourse.validityDays}`);

  // 2. Find or create a test user
  let testUser = await prisma.user.findUnique({
    where: { email: 'test@mathinova.com' },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: 'test@mathinova.com',
        name: 'Test User',
        passwordHash: 'dummy-hash',
        role: 'student',
      },
    });
    console.log(`✅ Created test user: ${testUser.email}`);
  } else {
    console.log(`✅ Found existing test user: ${testUser.email}`);
  }

  // 3. Delete any existing enrollments for this user and course
  await prisma.enrollment.deleteMany({
    where: {
      userId: testUser.id,
      courseId: paidCourse.id,
    },
  });
  console.log('🗑️  Deleted any existing enrollments');

  // 4. Create an ACTIVE enrollment (expires in future)
  const activeEnrollment = await prisma.enrollment.create({
    data: {
      userId: testUser.id,
      courseId: paidCourse.id,
      status: 'active',
      enrollmentSource: 'paid',
      activatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
    },
  });
  console.log(`✅ Created ACTIVE enrollment (expires: ${activeEnrollment.expiresAt})`);

  // 5. Create a second test user for expired enrollment
  let expiredUser = await prisma.user.findUnique({
    where: { email: 'expired@mathinova.com' },
  });

  if (!expiredUser) {
    expiredUser = await prisma.user.create({
      data: {
        email: 'expired@mathinova.com',
        name: 'Expired User',
        passwordHash: 'dummy-hash',
        role: 'student',
      },
    });
    console.log(`✅ Created expired test user: ${expiredUser.email}`);
  } else {
    console.log(`✅ Found existing expired test user: ${expiredUser.email}`);
  }

  // Delete any existing enrollments for expired user
  await prisma.enrollment.deleteMany({
    where: {
      userId: expiredUser.id,
      courseId: paidCourse.id,
    },
  });

  // 6. Create an EXPIRED enrollment (expired yesterday)
  const expiredEnrollment = await prisma.enrollment.create({
    data: {
      userId: expiredUser.id,
      courseId: paidCourse.id,
      status: 'expired',
      enrollmentSource: 'paid',
      activatedAt: new Date(Date.now() - 366 * 24 * 60 * 60 * 1000), // Activated 366 days ago
      expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Expired yesterday
    },
  });
  console.log(`✅ Created EXPIRED enrollment (expired: ${expiredEnrollment.expiresAt})`);

  console.log('\n📋 Test Setup Summary:');
  console.log(`   Course: ${paidCourse.title}`);
  console.log(`   Validity: ${paidCourse.validityDays} days`);
  console.log(`   Active User: ${testUser.email} (ID: ${testUser.id})`);
  console.log(`   Expired User: ${expiredUser.email} (ID: ${expiredUser.id})`);
  console.log('\n✅ Test setup complete!');
}

setupPaidCourseTest()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
