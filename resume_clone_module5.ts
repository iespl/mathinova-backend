import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const SOURCE_LESSON_ID = '5e24f515-7e6a-489b-9ac8-0c2cfccc4131'; // Lesson 2 in Module 5 (the correct one)
const TARGET_LESSON_ID = 'b1b9af4f-ac6c-46d2-8383-c08467837a6b'; // Lesson 2 in target module

async function main() {
    // 1. Fetch source PYQs
    const sourcePyqs = await prisma.pYQ.findMany({
        where: { lessonId: SOURCE_LESSON_ID },
        include: { occurrences: true },
        orderBy: { order: 'asc' }
    });

    console.log(`Total source PYQs: ${sourcePyqs.length}`);

    // 2. Fetch current target PYQs
    const targetPyqs = await prisma.pYQ.findMany({
        where: { lessonId: TARGET_LESSON_ID },
        orderBy: { order: 'asc' }
    });

    console.log(`Currently in target: ${targetPyqs.length}`);

    // Resume from the next one (index 17 onwards)
    const remainingPyqs = sourcePyqs.slice(targetPyqs.length);
    console.log(`Cloning remaining ${remainingPyqs.length} PYQs...`);

    let count = 0;
    for (const pyq of remainingPyqs) {
        const newPYQId = randomUUID();
        await prisma.pYQ.create({
            data: {
                id: newPYQId,
                lessonId: TARGET_LESSON_ID,
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
        }
        count++;
        console.log(`  Cloned remaining PYQ ${count}/${remainingPyqs.length} (Total in target: ${targetPyqs.length + count})`);
    }

    console.log('✅ Resume complete!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
