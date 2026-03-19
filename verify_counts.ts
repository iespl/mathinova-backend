import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Verification ---');
    console.log('Users:', await prisma.user.count());
    console.log('Courses:', await prisma.course.count());
    console.log('Modules:', await prisma.module.count());
    console.log('Lessons:', await prisma.lesson.count());
    console.log('Videos:', await prisma.video.count());
    console.log('PYQs:', await prisma.pYQ.count());
    console.log('Occurrences:', await prisma.pYQOccurrence.count());
    console.log('Enrollments:', await prisma.enrollment.count());
    console.log('-----------------------------');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
