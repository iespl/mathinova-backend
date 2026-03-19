import prisma from './src/utils/prisma.js';
import { AdminService } from './src/services/adminService.js';

async function verify() {
    console.log('--- Starting Clone Verification ---');

    try {
        // 1. Setup - Find an admin and a source lesson
        const admin = await prisma.user.findFirst({
            where: { role: { in: ['admin', 'super_admin'] } }
        });

        if (!admin) {
            console.error('No admin found for testing');
            return;
        }

        const sourceLesson = await prisma.lesson.findFirst({
            include: {
                videos: true,
                pyqs: { include: { occurrences: true } },
                quiz: { include: { questions: { include: { options: true } } } }
            }
        });

        if (!sourceLesson) {
            console.warn('No source lesson found. Skipping lesson clone test.');
        } else {
            console.log(`Cloning Lesson: ${sourceLesson.title} (${sourceLesson.id})...`);
            const clonedLesson = await AdminService.cloneLesson(admin.id, sourceLesson.id, sourceLesson.moduleId);
            console.log(`Cloned Lesson Success: ${clonedLesson.title} (${clonedLesson.id})`);

            // Verify content counts match
            const clonedDetails = await AdminService.getLessonDetails(clonedLesson.id);
            console.log(`- Videos: ${clonedDetails?.videos.length} (Expected: ${sourceLesson.videos.length})`);
            console.log(`- PYQs: ${clonedDetails?.pyqs.length} (Expected: ${sourceLesson.pyqs.length})`);
            console.log(`- Quiz: ${clonedDetails?.quiz ? 'Yes' : 'No'} (Expected: ${sourceLesson.quiz ? 'Yes' : 'No'})`);

            if (clonedLesson.id === sourceLesson.id) {
                console.error('FAIL: Cloned ID matches Source ID!');
            } else {
                console.log('PASS: Lesson IDs are unique.');
            }
        }

        // 2. Clone Module Test
        const sourceModule = await prisma.module.findFirst({
            include: { lessons: true }
        });

        if (!sourceModule) {
            console.warn('No source module found. Skipping module clone test.');
        } else {
            console.log(`Cloning Module: ${sourceModule.title} (${sourceModule.id})...`);
            const clonedModule = await AdminService.cloneModule(admin.id, sourceModule.id, sourceModule.courseId);
            console.log(`Cloned Module Success: ${clonedModule.title} (${clonedModule.id})`);

            const clonedWithLessons = await prisma.module.findUnique({
                where: { id: clonedModule.id },
                include: { lessons: true }
            });

            console.log(`- Lessons: ${clonedWithLessons?.lessons.length} (Expected: ${sourceModule.lessons.length})`);

            if (clonedModule.id === sourceModule.id) {
                console.error('FAIL: Cloned Module ID matches Source ID!');
            } else {
                console.log('PASS: Module IDs are unique.');
            }
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
