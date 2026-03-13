import prisma from '../utils/prisma.js';
import { OrderStatus } from '@prisma/client';
export class CheckoutService {
    static async createOrder(data) {
        const course = await prisma.course.findUnique({ where: { id: data.courseId } });
        if (!course)
            throw new Error('Course not found');
        let subtotal = Number(course.basePrice);
        let discount = 0;
        let couponId;
        if (data.couponCode) {
            const coupon = await prisma.coupon.findUnique({ where: { code: data.couponCode } });
            if (coupon && coupon.active && coupon.usedCount < coupon.usageLimit && new Date() < coupon.expiryDate) {
                couponId = coupon.id;
                if (coupon.discountType === 'percent') {
                    discount = (subtotal * Number(coupon.value)) / 100;
                }
                else {
                    discount = Number(coupon.value);
                }
            }
        }
        const total = subtotal - discount;
        return prisma.order.create({
            data: {
                userId: data.userId,
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
//# sourceMappingURL=checkoutService_utf8.js.map