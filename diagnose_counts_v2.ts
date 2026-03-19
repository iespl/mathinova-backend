
import prisma from './src/utils/prisma.js';
import { AdminService } from './src/services/adminService.js';

async function diagnose() {
    console.log('--- Diagnostic: Finding Lessons with Videos ---');
    
    // 1. Find ANY lesson that has videos
    const lessonWithVideos = await prisma.lesson.findFirst({
        where: {
            videos: { some: {} }
        },
        include: {
            videos: true,
            module: {
                include: {
                    course: true
                }
            }
        }
    });

    if (!lessonWithVideos) {
        console.log('No lessons with videos found in local DB.');
        return;
    }

    const courseId = lessonWithVideos.module.courseId;
    console.log(`Analyzing Course: ${lessonWithVideos.module.course.title} (${courseId})`);
    
    const adminCourse = await AdminService.getCourseById(courseId);
    
    const module = adminCourse.modules.find(m => m.id === lessonWithVideos.moduleId);
    const lesson = module?.lessons.find(l => l.id === lessonWithVideos.id);

    console.log(`Lesson: ${lessonWithVideos.title} (${lessonWithVideos.id})`);
    console.log(`Actual Video Count in DB: ${lessonWithVideos.videos.length}`);
    
    if (lesson) {
        console.log(`Admin API _count: ${JSON.stringify(lesson._count)}`);
        if (lesson._count.videos !== lessonWithVideos.videos.length) {
            console.error('!!!! MATCH FAILURE !!!!');
        } else {
            console.log('SUCCESS: Admin _count matches DB.');
        }
    } else {
        console.log('Lesson not found in adminCourse tree!');
    }
}

diagnose()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
