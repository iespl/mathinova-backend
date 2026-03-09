import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const { name, email, password, role } = req.body;
            const result = await AuthService.register(name, email, password, role);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            res.json(result);
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }
}
