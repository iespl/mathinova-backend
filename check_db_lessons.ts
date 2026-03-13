import prisma from './src/utils/prisma.js';

async function checkLessons() {
    const count = await prisma.lesson.count();
    const latest = await prisma.lesson.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
            module: true
        }
    });
    console.log('Total Lessons:', count);
    console.log('Latest 5 Lessons:', JSON.stringify(latest, null, 2));
    process.exit(0);
}

checkLessons();
