import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const lessonId = '3c914d53-40fd-49e7-9353-129b7cd39857';
    console.log(`--- Checking Videos for Lesson ${lessonId} ---`);
    
    const videos = await prisma.video.findMany({
        where: { lessonId }
    });

    console.log(`Found ${videos.length} videos linked to this lesson.`);
    videos.forEach(v => console.log(` - [${v.id}] ${v.title}`));

    // If 0, let's see if there are ANY videos with similar lessonIds?
    if (videos.length === 0) {
        console.log('No exact match. Searching for videos in the same course...');
        const courseId = '68d50fc2-fdf3-4d4f-8524-9e674b85ab20';
        const courseVideos = await prisma.video.findMany({
            where: { lesson: { module: { courseId } } },
            take: 10,
            select: { id: true, title: true, lessonId: true }
        });
        console.log(`Sample videos in course ${courseId}:`);
        courseVideos.forEach(v => console.log(` - [${v.id}] ${v.title} (Lesson: ${v.lessonId})`));
    }

    console.log('\n-----------------------------');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
