import prisma from './src/utils/prisma.js';
async function main() {
    const branches = await prisma.branch.findMany();
    console.log(JSON.stringify(branches, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
