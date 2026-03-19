import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Search for Uppercase LessonIDs ---');
    const videos = await prisma.video.findMany();
    
    const uppercaseCount = videos.filter(v => /[A-Z]/.test(v.lessonId)).length;
    console.log(`Total Videos: ${videos.length}`);
    console.log(`Videos with uppercase lessonId: ${uppercaseCount}`);

    if (uppercaseCount > 0) {
        const sample = videos.find(v => /[A-Z]/.test(v.lessonId));
        console.log('Sample Uppercase Video:');
        console.log(` - Video ID: ${sample?.id}`);
        console.log(` - Lesson ID: "${sample?.lessonId}"`);
    }

    const pyqs = await prisma.pYQ.findMany();
    const upPyqCount = pyqs.filter(p => /[A-Z]/.test(p.lessonId)).length;
    console.log(`\nTotal PYQs: ${pyqs.length}`);
    console.log(`PYQs with uppercase lessonId: ${upPyqCount}`);
    
    if (upPyqCount > 0) {
        const sample = pyqs.find(p => /[A-Z]/.test(p.lessonId));
        console.log('Sample Uppercase PYQ:');
        console.log(` - PYQ ID: ${sample?.id}`);
        console.log(` - Lesson ID: "${sample?.lessonId}"`);
    }
}

main().finally(() => prisma.$disconnect());
