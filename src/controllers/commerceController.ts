import { Request, Response } from 'express';
import { CheckoutService } from '../services/checkoutService.js';
import { PaymentService } from '../services/paymentService.js';

export class CommerceController {
    static async checkout(req: Request, res: Response) {
        try {
            // userId is optional (guest checkout)
            const { courseId, email, tempUserId, couponCode } = req.body;
            const order = await CheckoutService.createOrder({
                userId: (req as any).user?.id,
                email,
                tempUserId,
                courseId,
                couponCode
            });
            res.status(201).json(order);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async paymentWebhook(req: Request, res: Response) {
        try {
            // Mock gateway webhook behavior
            const { orderId, gatewayReference, amount, method } = req.body;
            const payment = await PaymentService.processPaymentSuccess(orderId, gatewayReference, amount, method);
            res.json({ message: 'Payment processed and enrollment activated', payment });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
