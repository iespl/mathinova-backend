import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateVideo() {
    console.log('Updating video URL...');
    const result = await prisma.video.updateMany({
        data: {
            videoUrl: "https://vz-f8a1efcc-689.b-cdn.net/cdbfb4a3-93cd-457f-9e4d-17ebd0895482/playlist.m3u8"
        }
    });
    console.log(`Updated ${result.count} video(s) to HLS URL.`);
}

updateVideo()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
