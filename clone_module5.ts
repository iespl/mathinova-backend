import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const SOURCE_MODULE_ID = '1face24b-9ef1-4336-9f3c-0fef1b91200e'; // Module 5: Numerical Methods - 2
const TARGET_COURSE_ID = '2f23669d-9113-48d1-887c-c843bea57725'; // VTU - MATHKIT BMATM201

async function main() {
    // 1. Fetch the full source module with all lessons, videos, PYQs and occurrences
    console.log('📖 Fetching source module...');
    const sourceModule = await prisma.module.findUnique({
        where: { id: SOURCE_MODULE_ID },
        include: {
            lessons: {
                include: {
                    videos: { orderBy: { order: 'asc' } },
                    pyqs: {
                        include: { occurrences: true },
                        orderBy: { order: 'asc' }
                    }
                },
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!sourceModule) { console.error('Source module not found!'); return; }
    console.log(`✅ Source: "${sourceModule.title}" with ${sourceModule.lessons.length} lessons`);

    // 2. Determine the next module order in the target course
    const existingModules = await prisma.module.findMany({
        where: { courseId: TARGET_COURSE_ID },
        orderBy: { order: 'asc' }
    });
    const nextOrder = existingModules.length > 0
        ? Math.max(...existingModules.map(m => m.order)) + 1
        : 1;
    console.log(`📦 Target course has ${existingModules.length} modules. New module order: ${nextOrder}`);

    // 3. Create the new module in the target course
    console.log(`\n🚀 Creating module "${sourceModule.title}" in target course...`);
    const newModule = await prisma.module.create({
        data: {
            id: randomUUID(),
            courseId: TARGET_COURSE_ID,
            title: sourceModule.title,
            order: nextOrder,
        }
    });
    console.log(`✅ Created module: [${newModule.id}] "${newModule.title}"`);

    // 4. Clone each lesson
    for (const lesson of sourceModule.lessons) {
        console.log(`\n  📝 Cloning lesson: "${lesson.title}" (videos:${lesson.videos.length}, pyqs:${lesson.pyqs.length})`);

        const newLessonId = randomUUID();
        const newLesson = await prisma.lesson.create({
            data: {
                id: newLessonId,
                moduleId: newModule.id,
                title: lesson.title,
                order: lesson.order,
                version: lesson.version,
                isDeleted: false,
                isWrapper: lesson.isWrapper,
                completionRule: lesson.completionRule,
            }
        });
        console.log(`  ✅ Created lesson: [${newLesson.id}]`);

        // Clone videos in batches
        if (lesson.videos.length > 0) {
            console.log(`    🎥 Cloning ${lesson.videos.length} videos...`);
            for (const video of lesson.videos) {
                await prisma.video.create({
                    data: {
                        id: randomUUID(),
                        lessonId: newLessonId,
                        videoUrl: video.videoUrl,
                        duration: video.duration,
                        title: video.title,
                        order: video.order,
                        isSample: video.isSample,
                    }
                });
            }
            console.log(`    ✅ ${lesson.videos.length} videos cloned`);
        }

        // Clone PYQs in batches
        if (lesson.pyqs.length > 0) {
            console.log(`    ❓ Cloning ${lesson.pyqs.length} PYQs...`);
            let clonedPYQs = 0;
            let clonedOccurrences = 0;

            for (const pyq of lesson.pyqs) {
                const newPYQId = randomUUID();
                await prisma.pYQ.create({
                    data: {
                        id: newPYQId,
                        lessonId: newLessonId,
                        questionType: pyq.questionType,
                        questionText: pyq.questionText,
                        questionImages: pyq.questionImages ?? [],
                        answerImages: pyq.answerImages ?? [],
                        solutionVideoUrl: pyq.solutionVideoUrl,
                        difficulty: pyq.difficulty,
                        order: pyq.order,
                        isSimilar: pyq.isSimilar,
                        isPublished: pyq.isPublished,
                        isSample: pyq.isSample,
                        description: pyq.description,
                        answerText: pyq.answerText,
                    }
                });
                clonedPYQs++;

                // Clone occurrences for this PYQ
                for (const occ of pyq.occurrences) {
                    await prisma.pYQOccurrence.create({
                        data: {
                            id: randomUUID(),
                            pyqId: newPYQId,
                            year: occ.year,
                            month: occ.month,
                            courseCode: occ.courseCode,
                            part: occ.part,
                        }
                    });
                    clonedOccurrences++;
                }

                if (clonedPYQs % 10 === 0) {
                    console.log(`    ... ${clonedPYQs}/${lesson.pyqs.length} PYQs done`);
                }
            }
            console.log(`    ✅ ${clonedPYQs} PYQs and ${clonedOccurrences} occurrences cloned`);
        }
    }

    console.log('\n✨ Module clone complete!');
    console.log(`   Module: "${newModule.title}" [${newModule.id}]`);
    console.log(`   Lessons: ${sourceModule.lessons.length}`);
}

main()
    .catch(e => {
        console.error('❌ Clone failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
