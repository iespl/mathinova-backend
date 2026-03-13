import prisma from './src/utils/prisma.js';

async function main() {
    const courseId = 'course-struct-eng-v1';
    const modules = await prisma.module.findMany({
        where: { courseId },
        include: { lessons: true }
    });
    console.log(JSON.stringify(modules, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
