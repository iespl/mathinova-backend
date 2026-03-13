
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking DB Content for Verification...');

    const courseSlug = 'advanced-structural-dynamics';
    const course = await prisma.course.findUnique({
        where: { slug: courseSlug },
        include: {
            modules: {
                include: {
                    lessons: {
                        include: { videos: true }
                    }
                }
            }
        }
    });

    if (!course) {
        console.log('Course not found');
        return;
    }

    course.modules.forEach(m => {
        console.log(`\nModule: "${m.title}" (${m.id})`);
        m.lessons.forEach(l => {
            console.log(`  Lesson: "${l.title}" (${l.id}) | isWrapper: ${l.isWrapper} | Videos: ${l.videos.length}`);
            l.videos.forEach(v => console.log(`    - Video: "${v.title}" (${v.id})`));
        });
    });

    const lastLog = await prisma.contentIngestionLog.findFirst({
        orderBy: { executedAt: 'desc' }
    });
    console.log(`\nLast Ingestion Log: v${lastLog?.manifestVersion} | Status: ${lastLog?.status}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
