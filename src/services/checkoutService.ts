import prisma from '../utils/prisma.js';
import { OrderStatus } from '@prisma/client';

export class CheckoutService {
    static async createOrder(data: {
        userId?: string;
        email: string;
        tempUserId?: string;
        courseId: string;
        couponCode?: string;
    }) {
        const course = await prisma.course.findUnique({ where: { id: data.courseId } });
        if (!course) throw new Error('Course not found');

        let subtotal = Number(course.basePrice);
        let discount = 0;
        let couponId: string | undefined;

        if (data.couponCode) {
            const coupon = await prisma.coupon.findUnique({ where: { code: data.couponCode } });
            if (coupon && coupon.active && coupon.usedCount < coupon.usageLimit && new Date() < coupon.expiryDate) {
                couponId = coupon.id;
                if (coupon.discountType === 'percent') {
                    discount = (subtotal * Number(coupon.value)) / 100;
                } else {
                    discount = Number(coupon.value);
                }
            }
        }

        const total = subtotal - discount;

        // Verify userId exists if provided (prevent FKEY violation on stale sessions)
        let verifiedUserId = data.userId;
        if (verifiedUserId) {
            const userExists = await prisma.user.findUnique({ where: { id: verifiedUserId } });
            if (!userExists) {
                // Attempt identity recovery via email (common in development resets)
                const recoveredUser = await prisma.user.findUnique({ where: { email: data.email } });
                verifiedUserId = recoveredUser?.id;
            }
        }

        return prisma.order.create({
            data: {
                userId: verifiedUserId,
                email: data.email,
                tempUserId: data.tempUserId,
                courseId: data.courseId,
                subtotal,
                discount,
                total,
                couponId,
                status: OrderStatus.pending
            }
        });
    }
}
