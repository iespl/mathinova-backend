import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Video to Lesson Trace ---');
    
    // Get 10 videos (trying to find restored ones)
    const videos = await prisma.video.findMany({
        take: 20,
        include: {
            lesson: {
                include: {
                    module: { include: { course: true } }
                }
            }
        },
        orderBy: { id: 'desc' } // Newest usually restored
    });

    console.log(`Tracing ${videos.length} videos:`);
    videos.forEach(v => {
        console.log(`Video: "${v.title}"`);
        if (v.lesson) {
            console.log(`  Lesson ID: [${v.lesson.id}] "${v.lesson.title}"`);
            console.log(`  Module ID: [${v.lesson.module.id}] "${v.lesson.module.title}"`);
            console.log(`  Course ID: [${v.lesson.module.course.id}] "${v.lesson.module.course.title}"`);
        } else {
            console.log(`  ⚠️  NO LESSON FOUND for ID: ${v.lessonId}`);
        }
        console.log('---');
    });

    console.log('\n-----------------------------');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
