import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// Source lesson
const SOURCE_LESSON_ID = '9cb15f35-6711-4962-8958-204963d404a5';
// Existing "copy" lesson in target 
const EXISTING_COPY_LESSON_ID = '2a7a8f0e-f788-4a57-862b-757f8781fd75';

async function main() {
    const [src, copy] = await Promise.all([
        prisma.pYQ.findMany({
            where: { lessonId: SOURCE_LESSON_ID },
            include: { occurrences: true },
            orderBy: { order: 'asc' }
        }),
        prisma.pYQ.findMany({
            where: { lessonId: EXISTING_COPY_LESSON_ID },
            include: { occurrences: true },
            orderBy: { order: 'asc' }
        })
    ]);

    console.log(`Source lesson PYQs: ${src.length}`);
    console.log(`Existing copy lesson PYQs: ${copy.length}`);

    let srcOccurrences = 0;
    let copyOccurrences = 0;
    for (const p of src) srcOccurrences += p.occurrences.length;
    for (const p of copy) copyOccurrences += p.occurrences.length;

    console.log(`Source total occurrences: ${srcOccurrences}`);
    console.log(`Copy total occurrences: ${copyOccurrences}`);

    // Sample a few PYQs from each for comparison
    console.log('\nSource first 3 PYQs:');
    for (const p of src.slice(0, 3)) {
        console.log(`  [${p.id}] order:${p.order} occs:${p.occurrences.length} "${p.questionText?.slice(0, 60)}"`);
    }

    console.log('\nCopy first 3 PYQs:');
    for (const p of copy.slice(0, 3)) {
        console.log(`  [${p.id}] order:${p.order} occs:${p.occurrences.length} "${p.questionText?.slice(0, 60)}"`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
