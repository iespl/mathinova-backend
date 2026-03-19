import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Course Enrollment Check ---');
    
    const courses = await prisma.course.findMany({
        include: {
            _count: { select: { enrollments: true, modules: true } }
        }
    });

    console.log(`Found ${courses.length} courses:`);
    for (const c of courses) {
        console.log(`[${c.id}] ${c.title}`);
        console.log(`  Enrollments: ${c._count.enrollments} | Modules: ${c._count.modules}`);
        
        // Let's also see the module names for this course
        const modules = await prisma.module.findMany({
            where: { courseId: c.id },
            select: { id: true, title: true }
        });
        modules.forEach(m => console.log(`    - Mod: [${m.id}] ${m.title}`));
    }

    console.log('\n-----------------------------');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
