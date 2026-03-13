import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const slug = 'advanced-structural-dynamics';
    console.log(`Checking database for course: ${slug}`);

    const course = await prisma.course.findUnique({
        where: { slug: slug },
        include: {
            modules: {
                orderBy: { order: 'asc' },
                include: {
                    lessons: {
                        orderBy: { order: 'asc' },
                        include: {
                            videos: true
                        }
                    }
                }
            }
        }
    });

    if (!course) {
        console.log('Course not found in database.');
        return;
    }

    console.log(`Course Title: ${course.title}`);
    console.log(`Modules Count: ${course.modules.length}`);

    course.modules.forEach((mod, modIdx) => {
        console.log(`\nModule ${modIdx + 1}: ${mod.title}`);
        mod.lessons.forEach((lesson, lessonIdx) => {
            console.log(`  Lesson ${lessonIdx + 1}: ${lesson.title} (${lesson.videos.length} videos)`);
            lesson.videos.forEach((vid) => {
                console.log(`    - Video: ${vid.title} | Sample: ${vid.isSample} | URL: ${vid.videoUrl}`);
            });
        });
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
