import prisma from './src/utils/prisma.js';

async function main() {
    const courseId = '20243bb8-524c-4fba-81bd-585e1a35b271';
    const modules = await prisma.module.findMany({
        where: { courseId },
        include: { lessons: true }
    });
    console.log(JSON.stringify(modules, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
