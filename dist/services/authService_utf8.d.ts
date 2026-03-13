import { Role } from '@prisma/client';
export declare class AuthService {
    static register(name: string, email: string, password: string, role?: Role): Promise<{
        token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
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
    private static generateToken;
}
