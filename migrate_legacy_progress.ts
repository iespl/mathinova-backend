
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateLegacyProgress() {
    console.log('--- Starting Progress Migration ---');

    const legacyRecords = await prisma.progress.findMany({});

    console.log(`Analyzing ${legacyRecords.length} progress records.`);

    for (const record of legacyRecords) {
        // Since we removed quizAttempted and lessonCompleted from the MODEL,
        // we can no longer query them via Prisma directly if the client is updated.
        // However, this script is intended to be run ONCE after the schema change.
        // If they are already gone, this script should just ensure attempts exist where 'completed' is true.

        if (record.completed) {
            const quiz = await prisma.quiz.findUnique({
                where: { lessonId: record.lessonId }
            });

            if (quiz) {
                const existingAttempt = await prisma.quizAttempt.findFirst({
                    where: { userId: record.userId, quizId: quiz.id }
                });

                if (!existingAttempt) {
                    await prisma.quizAttempt.create({
                        data: {
                            userId: record.userId,
                            quizId: quiz.id,
                            submittedAt: new Date(),
                            score: 100
                        }
                    });
                    console.log(`✅ Created synthetic quiz attempt for completed lesson for user ${record.userId}`);
                }
            }
        }
    }

    console.log('--- Migration Completed ---');
}

migrateLegacyProgress()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
