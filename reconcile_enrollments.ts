import moment from 'moment'; // Just to show imports if needed, but standard Date is fine.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reconcile() {
    console.log('Starting reconciliation...');
    // Find all orders that are PAID but have linked users who lack enrollments
    const paidOrders = await prisma.order.findMany({
        where: {
            status: 'paid',
            userId: { not: null }
        },
        include: { user: true }
    });

    let fixedCount = 0;

    for (const order of paidOrders) {
        if (!order.userId) continue;

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: order.userId,
                    courseId: order.courseId
                }
            }
        });

        if (!enrollment) {
            console.log(`Fixing missing enrollment for User ${order.email} (Order ${order.id})`);

            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 10);

            await prisma.enrollment.create({
                data: {
                    userId: order.userId,
                    courseId: order.courseId,
                    status: 'active',
                    activatedAt: new Date(),
                    expiresAt: expiryDate
                }
            });
            fixedCount++;
        }
    }

    console.log(`Reconciliation complete. Fixed ${fixedCount} missing enrollments.`);
}

reconcile()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
