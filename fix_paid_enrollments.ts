import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPaidEnrollments() {
    console.log("🔍 Checking for paid enrollments with missing expiry...");

    // 1. Find all PAID courses
    const paidCourses = await prisma.course.findMany({
        where: { pricingType: 'paid' }
    });

    console.log(`Found ${paidCourses.length} paid courses.`);

    for (const course of paidCourses) {
        // Cast to any because types might not be regenerated yet
        const vDays = (course as any).validityDays;

        if (!vDays || vDays <= 0) {
            console.error(`❌ CRITICAL: Paid course ${course.title} (${course.id}) has NO validityDays set! Skipping enrollments.`);
            continue;
        }

        console.log(`Processing ${course.title} (Validity: ${vDays} days)...`);

        // 2. Find invalid enrollments (Paid course + NULL expiry)
        const invalidEnrollments = await prisma.enrollment.findMany({
            where: {
                courseId: course.id,
                expiresAt: null,
                status: 'active'
            }
        });

        console.log(`Found ${invalidEnrollments.length} invalid enrollments.`);

        // 3. Fix them
        for (const enrollment of invalidEnrollments) {
            // Calculate expiry based on activatedAt or Now if missing
            const startDate = enrollment.activatedAt || new Date();
            const newExpiry = new Date(startDate);
            newExpiry.setDate(newExpiry.getDate() + (vDays as number));

            await prisma.enrollment.update({
                where: { id: enrollment.id },
                data: { expiresAt: newExpiry }
            });

            console.log(`✅ Fixed Enrollment ${enrollment.id}: Expires set to ${newExpiry.toISOString()}`);
        }
    }

    console.log("🎉 Fix complete.");
}

fixPaidEnrollments()
    .catch(e => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
