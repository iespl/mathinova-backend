import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const l1Id = '68816e14-2fe7-4a93-a8f5-cd7b04b7a002'; // Target Lesson 1 (ODEs)
    const l2Id = 'b1b9af4f-ac6c-46d2-8383-c08467837a6b'; // Target Lesson 2 (PYQs)

    const v1Count = await prisma.video.count({ where: { lessonId: l1Id } });
    const p2Count = await prisma.pYQ.count({ where: { lessonId: l2Id } });
    const o2Count = await prisma.pYQOccurrence.count({ where: { pyq: { lessonId: l2Id } } });

    console.log('Final Verification for Target Module 5:');
    console.log(`  Lesson 1 (ODEs) [${l1Id}]:`);
    console.log(`    Videos: ${v1Count} (Expected: 17)`);
    console.log(`  Lesson 2 (PYQs) [${l2Id}]:`);
    console.log(`    PYQs: ${p2Count} (Expected: 44)`);
    console.log(`    PYQ Occurrences: ${o2Count} (Summary: 44 for L2)`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
