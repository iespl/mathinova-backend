export declare class PaymentService {
    /**
     * Authoritative Webhook Handler (Compliance v1.4.1)
     * Payment success triggers atomic Order update and Enrollment activation.
     */
    static processPaymentSuccess(orderId: string, gatewayRef: string, amount: number, method: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        gatewayReference: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        method: string;
        orderId: string;
    }>;
}
