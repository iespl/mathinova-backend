import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const pyqId = '212e1626-941e-48da-98ee-3a1fc6c5890e'; // Replace with the exact ID if truncated

    // Actually, let's just find the one that matches the string and update it
    const pyqs = await prisma.pYQ.findMany();
    for (const pyq of pyqs) {
        if (pyq.questionText && pyq.questionText.includes('e^{-3t}(2\\:cos\\:5t\\:-\\:3\\:sin\\:5t)')) {
            const newText = pyq.questionText.replace(
                'e^{-3t}(2\\:cos\\:5t\\:-\\:3\\:sin\\:5t)',
                '$e^{-3t}(2\\:cos\\:5t\\:-\\:3\\:sin\\:5t)$'
            );

            await prisma.pYQ.update({
                where: { id: pyq.id },
                data: { questionText: newText }
            });

            console.log(`Updated PYQ ${pyq.id} successfully.`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
