import prisma from './src/utils/prisma.js';

async function enrollInPaidCourse() {
    const user = await prisma.user.findUnique({
        where: { email: 'rajan@innoventengg.com' }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    // Get the paid course
    const paidCourse = await prisma.course.findUnique({
        where: { id: 'course-struct-eng-v1' }
    });

    if (!paidCourse) {
        console.log('Paid course not found');
        return;
    }

    console.log(`\n📚 Enrolling ${user.email} in "${paidCourse.title}"...\n`);

    // Delete existing enrollment if any
    await prisma.enrollment.deleteMany({
        where: {
            userId: user.id,
            courseId: paidCourse.id
        }
    });

    // Create expired enrollment
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const enrollment = await prisma.enrollment.create({
        data: {
            userId: user.id,
            courseId: paidCourse.id,
            status: 'expired',
            enrollmentSource: 'paid',
            activatedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // 400 days ago
            expiresAt: yesterday
        }
    });

    console.log(`✅ Created EXPIRED enrollment`);
    console.log(`   Course: ${paidCourse.title}`);
    console.log(`   Activated: 400 days ago`);
    console.log(`   Expired: ${yesterday}`);
    console.log(`   Status: ${enrollment.status}`);
    console.log(`\n🔄 Please REFRESH your dashboard to see the changes!`);

    await prisma.$disconnect();
}

enrollInPaidCourse();
