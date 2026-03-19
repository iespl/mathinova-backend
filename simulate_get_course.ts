import { PrismaClient, EntityStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const slug = 'vtu---mathkit-bmats101';
    console.log(`Searching for slug: "${slug}"`);

    const course = await prisma.course.findFirst({
        where: {
            slug: slug,
            status: EntityStatus.published
        },
        include: {
            modules: {
                include: {
                    lessons: {
                        include: {
                            videos: true
                        }
                    }
                }
            }
        }
    });

    if (!course) {
        console.log("Course NOT found with findFirst and status:published");
        
        const rawCourse = await prisma.course.findFirst({
            where: { slug }
        });
        
        if (rawCourse) {
            console.log(`Course found without status check: status is "${rawCourse.status}"`);
        } else {
            console.log("Course NOT found at all with that slug.");
            
            // Search for similar slugs
            const allCourses = await prisma.course.findMany({
                select: { slug: true }
            });
            console.log("Available slugs:", allCourses.map(c => c.slug));
        }
    } else {
        console.log("Course found successfully!");
        console.log(`Title: ${course.title}`);
        console.log(`Modules count: ${course.modules.length}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
