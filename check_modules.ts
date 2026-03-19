import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Course 68d50fc2 Modules Check ---');
    
    const modules = await prisma.module.findMany({
        where: { courseId: '68d50fc2-fdf3-4d4f-8524-9e674b85ab20' },
        include: {
            _count: { select: { lessons: true } }
        }
    });

    console.log(`Found ${modules.length} modules:`);
    for (const m of modules) {
        const lessons = await prisma.lesson.findMany({
            where: { moduleId: m.id },
            include: { _count: { select: { videos: true, pyqs: true } } }
        });
        
        let vCount = 0;
        lessons.forEach(l => vCount += l._count.videos);
        
        console.log(`[${m.id}] ${m.title} | Lessons: ${m._count.lessons} | Total Videos in Mod: ${vCount}`);
        lessons.forEach(l => {
            console.log(`  - L: [${l.id}] ${l.title} (V: ${l._count.videos})`);
        });
    }

    console.log('\n-----------------------------');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
