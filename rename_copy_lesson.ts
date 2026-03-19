import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// The cloned lesson in target course (already has 66 PYQs)
const COPY_LESSON_ID = '2a7a8f0e-f788-4a57-862b-757f8781fd75';

async function main() {
    const lesson = await prisma.lesson.findUnique({ where: { id: COPY_LESSON_ID } });
    if (!lesson) { console.log('Lesson not found'); return; }

    console.log(`Current title: "${lesson.title}"`);

    const newTitle = lesson.title.replace(' (Copy)', '').replace('(Copy)', '').trim();
    console.log(`New title: "${newTitle}"`);

    const updated = await prisma.lesson.update({
        where: { id: COPY_LESSON_ID },
        data: { title: newTitle }
    });

    console.log(`✅ Updated lesson title to: "${updated.title}"`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
