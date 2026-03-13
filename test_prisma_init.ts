
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

console.log('Init client...');
try {
    const prisma = new PrismaClient();
    console.log('Client initialized.');
    await prisma.$disconnect();
    console.log('Disconnected.');
} catch (e) {
    console.error('Crash:', e);
}
