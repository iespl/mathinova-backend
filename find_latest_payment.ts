
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function findLatestPayment() {
    // 1. Find ANY user to act as admin (temporary fix for manual op)
    const admin = await prisma.user.findFirst({
        where: { role: 'admin' }
    }) || await prisma.user.findFirst();

    console.log('ACTOR_USER_ID:', admin?.id);
    console.log('ACTOR_EMAIL:', admin?.email);

    // 2. Find latest payment
    const payment = await prisma.payment.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { order: { include: { user: true } } }
    });

    if (payment) {
        console.log('PAYMENT_ID:', payment.id);
        console.log('PAYMENT_AMOUNT:', payment.amount);
        console.log('PAYMENT_STATUS:', payment.status);
        console.log('USER_EMAIL:', payment.order.email);
    } else {
        console.log('No payments found.');
    }
}

findLatestPayment()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
