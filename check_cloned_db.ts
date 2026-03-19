import prisma from './src/utils/prisma.js';

async function check() {
    const courseId = '9f92d3f5-650a-4a88-9e9b-1dd321ab9a1b';
    console.log(`Checking modules for Course: ${courseId}`);

    const modules = await prisma.module.findMany({
        where: { courseId: courseId },
        include: {
            lessons: true
        }
    });

    console.log(`Found ${modules.length} modules.`);
    modules.forEach((m, i) => {
        console.log(`${i+1}. ${m.title} (ID: ${m.id}) - ${m.lessons.length} lessons`);
    });

    await prisma.$disconnect();
}

check();
