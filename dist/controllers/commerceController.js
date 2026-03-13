import { CheckoutService } from '../services/checkoutService.js';
import { PaymentService } from '../services/paymentService.js';
export class CommerceController {
    static async checkout(req, res) {
        try {
            // userId is optional (guest checkout)
            const { courseId, email, tempUserId, couponCode } = req.body;
            const order = await CheckoutService.createOrder({
                userId: req.user?.id,
                email,
                tempUserId,
                courseId,
                couponCode
            });
            res.status(201).json(order);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async paymentWebhook(req, res) {
        try {
            // Mock gateway webhook behavior
            const { orderId, gatewayReference, amount, method } = req.body;
            const payment = await PaymentService.processPaymentSuccess(orderId, gatewayReference, amount, method);
            res.json({ message: 'Payment processed and enrollment activated', payment });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
//# sourceMappingURL=commerceController.js.map