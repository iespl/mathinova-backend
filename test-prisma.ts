import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    try {
        console.log('Connecting with Prisma Client...');
        await prisma.$connect();
        console.log('Connected successfully!');
        const count = await prisma.course.count();
        console.log('Course count:', count);
    } catch (e) {
        console.error('Prisma connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
