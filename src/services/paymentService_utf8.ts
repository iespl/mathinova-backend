import prisma from '../utils/prisma.js';
import { PaymentStatus, OrderStatus, EnrollmentStatus } from '@prisma/client';

export class PaymentService {
    /**
     * Authoritative Webhook Handler (Compliance v1.4.1)
     * Payment success triggers atomic Order update and Enrollment activation.
     */
    static async processPaymentSuccess(orderId: string, gatewayRef: string, amount: number, method: string) {
        return prisma.$transaction(async (tx) => {
            // 1. Create Payment record
            const payment = await tx.payment.create({
                data: {
                    orderId,
                    gatewayReference: gatewayRef,
                    amount,
                    method,
                    status: PaymentStatus.success
                }
            });

            // 2. Resolve the Order with Course link
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { user: true }
            });

            if (!order) throw new Error('Order not found');

            // 3. Update Order status
            await tx.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.paid }
            });

            // 4. Atomically update Coupon usage
            if (order.couponId) {
                await tx.coupon.update({
                    where: { id: order.couponId },
                    data: { usedCount: { increment: 1 } }
                });
            }

            // 5. Enrollment Activation (Authoritative logic)
            if (order.userId) {
                // Enforce: One active enrollment per (user_id, course_id)
                const expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + 10); // Standard "Lifetime" or 10-year expiry

                await tx.enrollment.upsert({
                    where: {
                        userId_courseId: {
                            userId: order.userId,
                            courseId: order.courseId
                        }
                    },
                    update: {
                        status: EnrollmentStatus.active,
                        activatedAt: new Date(),
                        expiresAt: expiryDate
                    },
                    create: {
                        userId: order.userId,
                        courseId: order.courseId,
                        status: EnrollmentStatus.active,
                        activatedAt: new Date(),
                        expiresAt: expiryDate
                    }
                });
            }

            return payment;
        }, { isolationLevel: 'Serializable' });
    }
}
