import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const branches = await prisma.branch.findMany();
    console.log('Branches in DB:', JSON.stringify(branches, null, 2));
    if (branches.length === 0) {
        console.log('No branches found. Creating default branches...');
        await prisma.branch.createMany({
            data: [
                { name: 'Electronics Engineering (ECE)' },
                { name: 'Mechanical Engineering' }
            ]
        });
        console.log('Default branches created.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
