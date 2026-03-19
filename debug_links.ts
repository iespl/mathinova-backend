import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Full Course Structure Dump ---');
    
    const courses = await prisma.course.findMany({
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

    for (const c of courses) {
        console.log(`[COURSE ID: ${c.id}] ${c.title}`);
        c.modules.forEach(m => {
            console.log(`  [MODULE ID: ${m.id}] ${m.title}`);
            m.lessons.forEach(l => {
                console.log(`    [LESSON ID: ${l.id}] ${l.title} (V: ${l._count.videos}, P: ${l._count.pyqs})`);
            });
        });
        console.log('---');
    }

    console.log('\n-----------------------------');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
