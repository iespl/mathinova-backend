import prisma from './src/utils/prisma.js';

async function main() {
    const courses = await prisma.course.findMany({
        select: { id: true, title: true, status: true }
    });
    console.log('--- Current Courses ---');
    console.log(JSON.stringify(courses, null, 2));
    console.log('-----------------------');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
