import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    // Source Module 5: 1face24b-9ef1-4336-9f3c-0fef1b91200e
    // Target Module 5 (newly created): Let's find it by title and target course
    const targetCourseId = '2f23669d-9113-48d1-887c-c843bea57725';
    const targetModule = await prisma.module.findFirst({
        where: { courseId: targetCourseId, title: 'Module 5: Numerical Methods - 2' },
        include: { lessons: true }
    });

    if (!targetModule) { console.log('Target module not found'); return; }
    console.log(`Target Module: ${targetModule.title} (${targetModule.id})`);

    for (const lesson of targetModule.lessons) {
        const videoCount = await prisma.video.count({ where: { lessonId: lesson.id } });
        const pyqCount = await prisma.pYQ.count({ where: { lessonId: lesson.id } });
        console.log(`  Lesson: ${lesson.title} (${lesson.id})`);
        console.log(`    Videos: ${videoCount}, PYQs: ${pyqCount}`);
    }
    
    // Source Lessons for comparison
    const sourceLessons = [
        { id: 'fa2aa39c-b85b-4f47-bcb9-de12987a3bda', title: 'L1: ODEs' }, // Actually Lesson 1
        { id: '5e24f515-7e6a-489b-9ac8-0c2cfccc4131', title: 'L2: PYQs' }  // Actually Lesson 2
    ];
    
    console.log('\nSource Lessons:');
    for (const sl of sourceLessons) {
        const videoCount = await prisma.video.count({ where: { lessonId: sl.id } });
        const pyqCount = await prisma.pYQ.count({ where: { lessonId: sl.id } });
        console.log(`  ${sl.title} (${sl.id}): Videos: ${videoCount}, PYQs: ${pyqCount}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
