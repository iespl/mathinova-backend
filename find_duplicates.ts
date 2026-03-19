import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Course Duplicate Search ---');
    
    const courses = await prisma.course.findMany({
        include: {
            _count: { select: { modules: true, enrollments: true } }
        }
    });

    for (const c of courses) {
        console.log(`[${c.id}] Title: "${c.title}" | Slug: "${c.slug}" | Modules: ${c._count.modules}`);
        
        // Count total videos/pyqs for this specific course ID
        const modSummary = await prisma.module.findMany({
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
        modSummary.forEach(m => {
            m.lessons.forEach(l => {
                vTotal += l._count.videos;
                pTotal += l._count.pyqs;
            });
        });

        console.log(`  -> TOTALS: Videos=${vTotal}, PYQs=${pTotal}`);
    }

    console.log('\n--- Checking specific slug "vtu---mathkit-bmatc101" ---');
    const slugMatch = await prisma.course.findUnique({
        where: { slug: 'vtu---mathkit-bmatc101' }
    });
    if (slugMatch) {
        console.log(`Course with slug found: [${slugMatch.id}] ${slugMatch.title}`);
    } else {
        console.log('No course with that exact slug.');
    }

    console.log('\n-----------------------------');
}

main().finally(() => prisma.$disconnect());
