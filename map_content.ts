import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Lesson Content Map ---');
    
    // Find all lessons that have videos
    const lessonsWithVideos = await prisma.lesson.findMany({
        where: { videos: { some: {} } },
        include: {
            module: { include: { course: true } },
            _count: { select: { videos: true } }
        }
    });

    console.log(`Found ${lessonsWithVideos.length} lessons with videos.`);
    
    // Group by Course
    const courseMap = new Map();
    lessonsWithVideos.forEach(l => {
        const cTitle = l.module?.course?.title || 'ORPHAN';
        if (!courseMap.has(cTitle)) {
            courseMap.set(cTitle, []);
        }
        courseMap.get(cTitle).push(l);
    });

    for (const [cTitle, ls] of courseMap.entries()) {
        console.log(`\nCourse: ${cTitle}`);
        ls.forEach((l: any) => {
            console.log(` - [${l._count.videos} v] ${l.title} (Module: ${l.module?.title})`);
        });
    }

    console.log('\n-----------------------------');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
