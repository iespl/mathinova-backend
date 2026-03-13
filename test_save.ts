import { AdminService } from './src/services/adminService.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });


async function test() {
    try {
        const course = await prisma.course.findFirst({
            include: {
                modules: {
                    include: {
                        lessons: {
                            include: {
                                pyqs: {
                                    include: {
                                        occurrences: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        let targetLesson = null;
        for (const mod of course!.modules) {
            for (const lesson of mod.lessons) {
                if (lesson.pyqs && lesson.pyqs.length > 0) {
                    targetLesson = lesson;
                    break;
                }
            }
            if (targetLesson) break;
        }

        if (!targetLesson) {
            console.log('No lesson with PYQs found');
            return;
        }

        console.log('Testing save for lesson:', targetLesson.id);
        
        // Pass the pyqs EXACTLY as they would come from the frontend (which just sends back what it got, plus some UI changes)
        // Let's modify one slightly to simulate an update
        const pyqsToSave = targetLesson.pyqs.map(p => ({
            ...p,
            isSample: true 
        }));

        await AdminService.updateLessonContent(targetLesson.id, [], pyqsToSave, null);
        console.log('Save SUCCESS');
    } catch (e) {
        console.error('Save FAILED:', e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
