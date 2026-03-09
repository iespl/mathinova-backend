import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { PaymentStatus, EnrollmentStatus } from '@prisma/client';

const router = Router();

// TEMPORARY: Unauthenticated route to force refund last payment
router.post('/force-refund-latest', async (req, res) => {
    try {
        console.log('🔄 Starting manual refund via support route...');

        const lastPayment = await prisma.payment.findFirst({
            where: { status: 'success' },
            orderBy: { createdAt: 'desc' },
            include: { order: true }
        });

        if (!lastPayment) {
            return res.status(404).json({ message: 'No successful payments found' });
        }

        const result = await prisma.$transaction(async (tx) => {
            const paymentUpdated = await tx.payment.update({
                where: { id: lastPayment.id },
                data: { status: PaymentStatus.refunded }
            });

            let enrollmentUpdated = null;
            // Find and Revoke Enrollment
            const enrollment = await tx.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: lastPayment.order.userId!,
                        courseId: lastPayment.order.courseId
                    }
                }
            });

            if (enrollment) {
                enrollmentUpdated = await tx.enrollment.update({
                    where: { id: enrollment.id },
                    data: { status: EnrollmentStatus.refunded }
                });
            }

            return { payment: paymentUpdated, enrollment: enrollmentUpdated };
        });

        console.log('✅ Manual refund completed:', result);
        res.json({ message: 'Refund successful', data: result });

    } catch (error: any) {
        console.error('Refund error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
