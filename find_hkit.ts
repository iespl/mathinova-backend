import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Searching for HKIT Course ---');
    
    const hkitCourses = await prisma.course.findMany({
        where: { title: { contains: 'HKIT', mode: 'insensitive' } },
        include: {
            modules: {
                include: {
                    lessons: {
                        include: {
                            _count: { select: { videos: true, pyqs: true } }
                        }
                    }
                }
            }
        }
    });

    if (hkitCourses.length === 0) {
        console.log('No courses found with "HKIT" in title.');
        // Try searching for just BMATC101 again
        const allC101 = await prisma.course.findMany({
            where: { title: { contains: 'BMATC101', mode: 'insensitive' } }
        });
        console.log('\nAll BMATC101 courses:');
        allC101.forEach(c => console.log(` - [${c.id}] ${c.title}`));
    } else {
        hkitCourses.forEach(c => {
            console.log(`\n[COURSE ID: ${c.id}] ${c.title}`);
            c.modules.forEach(m => {
                console.log(`  Module: [${m.id}] ${m.title}`);
                m.lessons.forEach(l => {
                    console.log(`    L: [${l.id}] ${l.title} (V: ${l._count.videos}, P: ${l._count.pyqs})`);
                });
            });
        });
    }

    console.log('\n-----------------------------');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
