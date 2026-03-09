import prisma from './src/utils/prisma.js';

async function addPromoVideo() {
    const youtubeUrl = 'https://www.youtube.com/watch?v=-nOn2saz2j4';
    // Convert to embed URL
    const embedUrl = 'https://www.youtube.com/embed/-nOn2saz2j4';

    const course = await prisma.course.update({
        where: { slug: 'structural-engineering-theory-practice' },
        data: {
            promoVideoUrl: embedUrl
        }
    });

    console.log('\n✅ Promo video added successfully!\n');
    console.log(`Course: ${course.title}`);
    console.log(`Promo Video URL: ${embedUrl}`);
    console.log('\n🔄 Refresh the course page to see the video!');

    await prisma.$disconnect();
}

addPromoVideo();
