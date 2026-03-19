import prisma from './src/utils/prisma.js';

async function find() {
    const courses = await prisma.course.findMany({
        where: { title: { contains: 'BMATM101' } }
    });

    console.log(`Found ${courses.length} courses matching BMATM101:`);
    courses.forEach(c => console.log(`- ${c.title} (ID: ${c.id})`));

    await prisma.$disconnect();
}

find();
