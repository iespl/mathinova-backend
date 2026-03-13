import prisma from './src/utils/prisma.js';

async function main() {
    const enrollments = await prisma.enrollment.findMany({
        include: {
            user: { select: { email: true, name: true } },
            course: { select: { title: true } }
        }
    });
    console.log('--- Current Enrollments ---');
    console.log(JSON.stringify(enrollments, null, 2));
    console.log('---------------------------');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
