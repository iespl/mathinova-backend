import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    console.log(`Total users: ${users.length}`);
    users.forEach((u, i) => {
        console.log(`\n[${i + 1}]`);
        console.log(`  ID        : ${u.id}`);
        console.log(`  Name      : ${u.name}`);
        console.log(`  Email     : ${u.email}`);
        console.log(`  Role      : ${u.role}`);
        console.log(`  Created   : ${u.createdAt.toISOString().slice(0, 10)}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
