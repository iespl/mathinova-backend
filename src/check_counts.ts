import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const counts = {
        courses: await prisma.course.count(),
        modules: await prisma.module.count(),
        lessons: await prisma.lesson.count(),
        videos: await prisma.video.count(),
        quizzes: await prisma.quiz.count(),
        pyqs: await prisma.pYQ.count(),
        users: await prisma.user.count(),
        enrollments: await prisma.enrollment.count()
    };

    console.log('--- Table Counts ---');
    console.log(JSON.stringify(counts, null, 2));
}

main()
    .catch(console.error)
    .finally(() => process.exit(0));
