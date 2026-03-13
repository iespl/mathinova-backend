export declare class CheckoutService {
    static createOrder(data: {
        userId?: string;
        email: string;
        tempUserId?: string;
        courseId: string;
        couponCode?: string;
    }): Promise<{
        id: string;
        currency: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        email: string;
        userId: string | null;
        tempUserId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        couponId: string | null;
        courseId: string;
    }>;
}
