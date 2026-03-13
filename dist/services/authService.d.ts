import { Role } from '@prisma/client';
export declare class AuthService {
    static register(name: string, email: string, password: string, role?: Role): Promise<{
        message: string;
        requiresVerification: boolean;
    }>;
    static login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
    }>;
    static verifyEmail(rawToken: string): Promise<{
        message: string;
    }>;
    static resendVerification(email: string): Promise<{
        message: string;
    }>;
    static forgotPassword(email: string): Promise<{
        message: string;
    }>;
    static resetPassword(rawToken: string, newPassword: string): Promise<{
        message: string;
    }>;
    private static generateToken;
}
