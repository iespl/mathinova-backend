import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
    const updated = await p.course.update({
        where: { slug: 'structural-engineering-theory-practice' },
        data: {
            thumbnail: 'https://mathinova23.b-cdn.net/new%20thumbnails/21mat11-22.webp',
            promoVideoUrl: 'https://www.youtube.com/watch?v=5wfD9i048rQ&t=30s',
        } as any,
    });
    console.log('Updated course:', updated.id, updated.title);
    console.log('Thumbnail:', (updated as any).thumbnail);
    console.log('PromoVideoUrl:', (updated as any).promoVideoUrl);
}

main().catch(console.error).finally(() => p.$disconnect());
