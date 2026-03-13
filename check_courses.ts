import prisma from './src/utils/prisma.js';

async function main() {
    const courses = await prisma.course.findMany({
        select: { id: true, title: true, slug: true, status: true }
    });
    console.log(JSON.stringify(courses, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
