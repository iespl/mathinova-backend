import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { Role } from '@prisma/client';
import { TokenUtils } from '../utils/tokenUtils.js';
import { EmailService } from './emailService.js';
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
                role,
                emailVerified: false
            }
        });
        // 1. Generate Verification Token
        const rawToken = TokenUtils.generateToken();
        const tokenHash = TokenUtils.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await prisma.verificationToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt
            }
        });
        // 2. Send Verification Email
        await EmailService.sendVerificationEmail(user.email, rawToken);
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
        // Return a message instead of generating a token immediately for registration
        return {
            message: 'Registration successful. Please check your email to verify your account.',
            requiresVerification: true
        };
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
        if (!user.emailVerified) {
            throw new Error('Please verify your email to continue');
        }
        return this.generateToken(user);
    }
    static async verifyEmail(rawToken) {
        const tokenHash = TokenUtils.hashToken(rawToken);
        const storedToken = await prisma.verificationToken.findUnique({
            where: { tokenHash }
        });
        if (!storedToken) {
            throw new Error('Invalid or expired verification link');
        }
        if (storedToken.expiresAt < new Date()) {
            await prisma.verificationToken.delete({ where: { id: storedToken.id } });
            throw new Error('Verification link has expired. Please request a new one.');
        }
        // Success: Mark user as verified and delete token
        await prisma.$transaction([
            prisma.user.update({
                where: { id: storedToken.userId },
                data: { emailVerified: true }
            }),
            prisma.verificationToken.deleteMany({
                where: { id: storedToken.id }
            })
        ]);
        return { message: 'Email verified successfully. You can now log in.' };
    }
    static async resendVerification(email) {
        const user = await prisma.user.findUnique({ where: { email } });
        // Requirement: Do NOT reveal whether the email exists
        if (!user || user.emailVerified) {
            return { message: 'If an account exists and is unverified, a new verification link has been sent.' };
        }
        // Invalidate previous tokens
        await prisma.verificationToken.deleteMany({
            where: { userId: user.id }
        });
        // Generate new token
        const rawToken = TokenUtils.generateToken();
        const tokenHash = TokenUtils.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await prisma.verificationToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt
            }
        });
        await EmailService.sendVerificationEmail(user.email, rawToken);
        return { message: 'If an account exists and is unverified, a new verification link has been sent.' };
    }
    static async forgotPassword(email) {
        const user = await prisma.user.findUnique({ where: { email } });
        // Always return success — don't reveal whether email exists
        if (!user) {
            return { message: 'If an account with that email exists, a password reset link has been sent.' };
        }
        // Delete any existing reset tokens for this user
        await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
        // Generate new token (30 min expiry)
        const rawToken = TokenUtils.generateToken();
        const tokenHash = TokenUtils.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await prisma.passwordReset.create({
            data: { userId: user.id, tokenHash, expiresAt }
        });
        await EmailService.sendResetPasswordEmail(user.email, rawToken);
        return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }
    static async resetPassword(rawToken, newPassword) {
        const tokenHash = TokenUtils.hashToken(rawToken);
        const storedToken = await prisma.passwordReset.findUnique({
            where: { tokenHash }
        });
        if (!storedToken) {
            throw new Error('Invalid or expired password reset link.');
        }
        if (storedToken.expiresAt < new Date()) {
            await prisma.passwordReset.delete({ where: { id: storedToken.id } });
            throw new Error('Password reset link has expired. Please request a new one.');
        }
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await prisma.$transaction([
            prisma.user.update({
                where: { id: storedToken.userId },
                data: { passwordHash }
            }),
            prisma.passwordReset.deleteMany({
                where: { id: storedToken.id }
            })
        ]);
        return { message: 'Password reset successfully. You can now log in with your new password.' };
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
//# sourceMappingURL=authService.js.map