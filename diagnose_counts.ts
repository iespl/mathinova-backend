
import prisma from './src/utils/prisma.js';
import { AdminService } from './src/services/adminService.js';

async function diagnose() {
    console.log('--- Diagnostic: Admin getCourseById ---');
    
    // Find a course with modules and lessons
    const course = await prisma.course.findFirst({
        include: {
            modules: {
                include: {
                    lessons: {
                        include: {
                            videos: true,
                            pyqs: true
                        }
                    }
                }
            }
        }
    });

    if (!course) {
        console.log('No courses found in local DB.');
        return;
    }

    console.log(`Course Found: ${course.title} (${course.id})`);
    
    const adminCourse = await AdminService.getCourseById(course.id);
    
    adminCourse.modules.forEach(m => {
        console.log(`Module: ${m.title}`);
        m.lessons.forEach(l => {
            console.log(`  Lesson: ${l.title}`);
            console.log(`    _count: ${JSON.stringify(l._count)}`);
            
            // Check if actual videos exist in DB for this lesson
            const actualVideos = course.modules.find(mod => mod.id === m.id)
                ?.lessons.find(lesson => lesson.id === l.id)?.videos || [];
            
            console.log(`    Actual Video Array Length in DB: ${actualVideos.length}`);
            
            if (l._count.videos !== actualVideos.length) {
                console.error(`!!!! DISCREPANCY DETECTED for Lesson ${l.id} !!!!`);
            }
        });
    });
}

diagnose()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
