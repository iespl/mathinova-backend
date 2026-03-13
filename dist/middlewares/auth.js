import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token missing or invalid' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Hardening: Verify user still exists in DB (Development Resilience)
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists. Please login again.' });
        }
        req.user = {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email
        };
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
export const optionalAuthenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Verify user exists
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (user) {
            req.user = {
                id: decoded.id,
                role: decoded.role,
                email: decoded.email
            };
        }
    }
    catch (err) {
        // Ignore invalid token for optional auth
    }
    next();
};
export const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
//# sourceMappingURL=auth.js.map