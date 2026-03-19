import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking for Duplicate Lessons ---');
    
    // Find all lessons in Course 68d50fc2-fdf3-4d4f-8524-9e674b85ab20
    const courseId = '68d50fc2-fdf3-4d4f-8524-9e674b85ab20';
    const lessons = await prisma.lesson.findMany({
        where: { module: { courseId } },
        include: {
            module: true,
            _count: { select: { videos: true, pyqs: true } }
        }
    });

    const titleMap = new Map();
    lessons.forEach(l => {
        if (!titleMap.has(l.title)) {
            titleMap.set(l.title, []);
        }
        titleMap.get(l.title).push(l);
    });

    console.log('Duplicate lesson titles found:');
    for (const [title, matches] of titleMap.entries()) {
        if (matches.length > 1) {
            console.log(`\nTitle: "${title}"`);
            matches.forEach((m: any) => {
                console.log(` - ID: [${m.id}] | Module: ${m.module.title} | V: ${m._count.videos} | P: ${m._count.pyqs}`);
            });
        }
    }

    console.log('\n--- Lessons with 0 videos/pyqs in this course ---');
    lessons.filter(l => l._count.videos === 0 && l._count.pyqs === 0).forEach(l => {
        console.log(` - [${l.id}] ${l.title} (Module: ${l.module.title})`);
    });

    console.log('\n-----------------------------');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
