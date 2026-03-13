import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { Role } from '@prisma/client';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export class AuthService {
    static async register(name, email, password, role = Role.student) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role
            }
        });
        // Guest Linker: Find anonymous orders with this email
        const guestOrders = await prisma.order.findMany({
            where: { email, userId: null, status: 'paid' }
        });
        if (guestOrders.length > 0) {
            // 1. Link Orders
            await prisma.order.updateMany({
                where: { email, userId: null },
                data: { userId: user.id }
            });
            // 2. Grant Enrollments Retroactively
            const newEnrollments = guestOrders.map(order => ({
                userId: user.id,
                courseId: order.courseId,
                status: 'active',
                activatedAt: new Date(),
                expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 10))
            }));
            // Usert to avoid duplicates if they somehow exist
            for (const enrollment of newEnrollments) {
                await prisma.enrollment.upsert({
                    where: {
                        userId_courseId: {
                            userId: enrollment.userId,
                            courseId: enrollment.courseId
                        }
                    },
                    update: {},
                    create: enrollment
                });
            }
        }
        return this.generateToken(user);
    }
    static async login(email, password) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        return this.generateToken(user);
    }
    static generateToken(user) {
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }
}
//# sourceMappingURL=authService_utf8.js.map