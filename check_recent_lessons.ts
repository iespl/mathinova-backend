import prisma from './src/utils/prisma.js';

async function main() {
    const lessons = await prisma.lesson.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(lessons, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
