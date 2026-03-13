import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const slug = 'advanced-structural-dynamics';
    const course = await prisma.course.findUnique({
        where: { slug },
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
        console.log("Course not found");
        return;
    }

    console.log(`Course: ${course.title} (${course.id})`);
    for (const mod of course.modules) {
        console.log(`  Module: ${mod.title}`);
        for (const lesson of mod.lessons) {
            console.log(`    Lesson: ${lesson.title}`);
            for (const video of lesson.videos) {
                console.log(`      Video: ${video.title}`);
                console.log(`        ID: ${video.id}`);
                console.log(`        URL: ${video.videoUrl}`);
                console.log(`        isSample: ${video.isSample}`);
            }
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
