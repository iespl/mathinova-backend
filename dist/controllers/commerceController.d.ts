import { Request, Response } from 'express';
export declare class CommerceController {
    static checkout(req: Request, res: Response): Promise<void>;
    static paymentWebhook(req: Request, res: Response): Promise<void>;
}
