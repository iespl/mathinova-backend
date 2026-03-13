import prisma from './src/utils/prisma.js';

async function checkCourseValidity() {
    const course = await prisma.course.findUnique({
        where: { slug: 'structural-engineering-theory-practice' },
        select: {
            id: true,
            title: true,
            slug: true,
            pricingType: true,
            basePrice: true,
            validityDays: true
        }
    });

    if (!course) {
        console.log('Course not found');
        return;
    }

    console.log('\n📚 Course Details:\n');
    console.log(`Title: ${course.title}`);
    console.log(`Slug: ${course.slug}`);
    console.log(`Pricing Type: ${course.pricingType}`);
    console.log(`Base Price: ₹${course.basePrice}`);
    console.log(`Validity: ${course.validityDays} days`);

    await prisma.$disconnect();
}

checkCourseValidity();
