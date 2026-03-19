import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const targetId = '3c914d53-40fd-49e7-9353-129b7cd39857';
    console.log(`--- Diagnosing Lesson ${targetId} ---`);
    
    // 1. Direct from Lesson
    const lesson = await prisma.lesson.findUnique({
        where: { id: targetId },
        include: {
            _count: { select: { videos: true, pyqs: true } }
        }
    });

    if (lesson) {
        console.log('Lesson found:');
        console.log(` - ID: "${lesson.id}"`);
        console.log(` - Title: "${lesson.title}"`);
        console.log(` - Prisma _count.videos: ${lesson._count.videos}`);
    } else {
        console.log('Lesson NOT FOUND by ID');
    }

    // 2. Direct from Video
    const videoCount = await prisma.video.count({
        where: { lessonId: targetId }
    });
    console.log(`Direct Video count by lessonId: ${videoCount}`);

    // 3. Inspect the link
    if (videoCount > 0) {
        const sampleVideo = await prisma.video.findFirst({
            where: { lessonId: targetId }
        });
        console.log('Sample Video linked:');
        console.log(` - Video ID: ${sampleVideo?.id}`);
        console.log(` - exact lessonId in Video: "${sampleVideo?.lessonId}"`);
        
        // Check if IDs are truly identical
        if (lesson) {
            console.log(`Are IDs identical? ${lesson.id === sampleVideo?.lessonId}`);
            console.log(`Lesson ID length: ${lesson.id.length}`);
            console.log(`Video lessonId length: ${sampleVideo?.lessonId.length}`);
        }
    }

    console.log('\n-----------------------------');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
