import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const lessonId = 'b1b9af4f-ac6c-46d2-8383-c08467837a6b';
    const pyqCount = await prisma.pYQ.count({ where: { lessonId: lessonId } });
    const pyqs = await prisma.pYQ.findMany({ where: { lessonId: lessonId }, select: { id: true } });
    const occCount = await prisma.pYQOccurrence.count({ where: { pyqId: { in: pyqs.map(p => p.id) } } });
    
    console.log('PYQ count in target lesson:', pyqCount);
    console.log('Occurrence count in target lesson:', occCount);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
