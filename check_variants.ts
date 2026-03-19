import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- BMATC101 Variants Check ---');
    
    const courses = await prisma.course.findMany({
        where: { title: { contains: 'BMATC101', mode: 'insensitive' } },
        include: {
            _count: { select: { modules: true, enrollments: true } }
        }
    });

    console.log(`Found ${courses.length} courses:`);
    for (const c of courses) {
        const modules = await prisma.module.findMany({
            where: { courseId: c.id },
            include: {
                lessons: {
                    include: {
                        _count: { select: { videos: true, pyqs: true } }
                    }
                }
            }
        });

        let vTotal = 0;
        let pTotal = 0;
        modules.forEach(m => {
            m.lessons.forEach(l => {
                vTotal += l._count.videos;
                pTotal += l._count.pyqs;
            });
        });

        console.log(`[${c.id}] ${c.title}`);
        console.log(`  Modules: ${c._count.modules} | Videos: ${vTotal} | PYQs: ${pTotal} | Enrollments: ${c._count.enrollments}`);
        
        modules.forEach(m => {
            console.log(`    - Module: [${m.id}] ${m.title} (V: ${m.lessons.reduce((acc, l) => acc + l._count.videos, 0)})`);
        });
    }

    console.log('\n-----------------------------');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
