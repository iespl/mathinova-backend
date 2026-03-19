import { CourseService } from './src/services/courseService';
import prisma from './src/utils/prisma';

async function verify() {
    const slug = 'vtu---mathkit-bmats101';
    console.log(`Testing getPublicCourse for slug: ${slug}`);
    
    const start = Date.now();
    try {
        const course = await CourseService.getPublicCourse(slug);
        const duration = Date.now() - start;
        
        if (!course) {
            console.error('Course not found!');
            process.exit(1);
        }

        console.log(`Success! Fetch took ${duration}ms`);
        console.log('Title:', course.title);
        console.log('Counts:', JSON.stringify(course._counts, null, 2));
        
        // Verify modules and lessons
        console.log('Modules count:', course.modules.length);
        const firstMod = course.modules[0];
        if (firstMod) {
            console.log(`First module: ${firstMod.title} (${firstMod.lessons.length} lessons)`);
            const firstLesson = firstMod.lessons[0];
            if (firstLesson) {
                console.log(`  First lesson: ${firstLesson.title}`);
                console.log(`  Videos (samples): ${firstLesson.videos.length}`);
                console.log(`  Total Videos count (from _count): ${(firstLesson as any)._count.videos}`);
                console.log(`  PYQs (samples): ${firstLesson.pyqs.length}`);
                console.log(`  Total PYQs count (from _count): ${(firstLesson as any)._count.pyqs}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
