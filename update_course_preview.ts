import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const slug = 'advanced-structural-dynamics';
    const newVideoUrl = 'https://www.youtube.com/embed/SqzgFRY75kg';

    // Find the course
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
        console.error("Course not found");
        return;
    }

    // Find the first video in the first lesson of the first module
    // Or target by title 'Fundamental Subspaces Explained'
    let targetVideo = null;
    for (const mod of course.modules) {
        for (const lesson of mod.lessons) {
            for (const video of lesson.videos) {
                if (video.title === 'Fundamental Subspaces Explained' || !targetVideo) {
                    targetVideo = video;
                }
            }
        }
    }

    if (targetVideo) {
        const updated = await prisma.video.update({
            where: { id: targetVideo.id },
            data: {
                videoUrl: newVideoUrl,
                isSample: true
            }
        });
        console.log(`✅ Updated video: ${updated.title}`);
        console.log(`   New URL: ${updated.videoUrl}`);
        console.log(`   isSample: ${updated.isSample}`);
    } else {
        console.error("No target video found to update");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
