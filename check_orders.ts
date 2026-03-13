import prisma from './src/utils/prisma.js';

async function main() {
    const orders = await prisma.order.findMany({
        include: {
            user: { select: { email: true } },
            course: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log('--- Latest Orders ---');
    console.log(JSON.stringify(orders, null, 2));
    console.log('---------------------');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
