const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const pyqs = await prisma.pYQ.findMany();
    console.log(`Total PYQs: ${pyqs.length}`);
    let missingDelimiters = 0;
    for (const pyq of pyqs) {
        if (pyq.questionText && (pyq.questionText.includes('e^{') || pyq.questionText.includes('\\:')) && !pyq.questionText.includes('$') && !pyq.questionText.includes('ql-formula')) {
            console.log(`\nFound malformed LaTeX PYQ (ID: ${pyq.id}):`);
            console.log(pyq.questionText);
            missingDelimiters++;
        }
    }
    console.log(`\nTotal missing delimiters: ${missingDelimiters}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
