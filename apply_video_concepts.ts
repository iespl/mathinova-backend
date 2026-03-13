import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const slug = 'advanced-structural-dynamics';
    const promoUrl = 'https://www.youtube.com/embed/SqzgFRY75kg';
    const sampleHlsUrl = 'https://vz-f8a1efcc-689.b-cdn.net/cdbfb4a3-93cd-457f-9e4d-17ebd0895482/playlist.m3u8';

    console.log(`Updating course: ${slug}`);

    // Update course-level promo
    const course = await prisma.course.update({
        where: { slug },
        data: {
            promoVideoUrl: promoUrl
        }
    });
    console.log(`✅ Updated Course promoVideoUrl to: ${promoUrl}`);

    // Update lesson video samples
    // We'll look for the first video in the first module/lesson and set it as sample
    const fullCourse = await prisma.course.findUnique({
        where: { slug },
        include: {
            modules: {
                orderBy: { order: 'asc' },
                include: {
                    lessons: {
                        orderBy: { order: 'asc' },
                        include: { videos: true }
                    }
                }
            }
        }
    });

    if (fullCourse && fullCourse.modules[0]?.lessons[0]?.videos[0]) {
        const video = fullCourse.modules[0].lessons[0].videos[0];
        await prisma.video.update({
            where: { id: video.id },
            data: {
                videoUrl: sampleHlsUrl,
                isSample: true,
                title: 'Introduction & Subspaces (Sample)'
            }
        });
        console.log(`✅ Updated Video ${video.id} to be Sample with HLS URL: ${sampleHlsUrl}`);
    } else {
        console.warn("⚠️ Could not find a video to mark as sample.");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
