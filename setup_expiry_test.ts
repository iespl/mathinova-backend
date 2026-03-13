import prisma from './src/utils/prisma.js';

async function setupExpiryTest() {
    // Find rajan's enrollments
    const user = await prisma.user.findUnique({
        where: { email: 'rajan@innoventengg.com' },
        include: {
            enrollments: {
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true,
                            pricingType: true,
                            validityDays: true
                        }
                    }
                }
            }
        }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log(`\n📋 Current enrollments for ${user.email}:\n`);
    user.enrollments.forEach((enrollment, index) => {
        console.log(`${index + 1}. ${enrollment.course.title}`);
        console.log(`   - Pricing: ${enrollment.course.pricingType}`);
        console.log(`   - Validity Days: ${enrollment.course.validityDays || 'N/A'}`);
        console.log(`   - Current Expiry: ${enrollment.expiresAt || 'Never'}`);
        console.log(`   - Status: ${enrollment.status}\n`);
    });

    // Set the first paid course to expired
    const paidEnrollment = user.enrollments.find(e => e.course.pricingType === 'paid');

    if (paidEnrollment) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        await prisma.enrollment.update({
            where: { id: paidEnrollment.id },
            data: {
                expiresAt: yesterday,
                status: 'expired'
            }
        });

        console.log(`✅ Set "${paidEnrollment.course.title}" to EXPIRED`);
        console.log(`   Expiry date: ${yesterday}`);
    } else {
        console.log('❌ No paid enrollments found');
    }

    await prisma.$disconnect();
}

setupExpiryTest();
