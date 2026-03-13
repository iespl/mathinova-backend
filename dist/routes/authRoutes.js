import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { rateLimit } from 'express-rate-limit';
const router = Router();
const resendVerificationLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1,
    message: { message: 'Too many requests. Please wait 60 seconds.' },
    standardHeaders: true,
    legacyHeaders: false,
});
const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    message: { message: 'Too many reset requests. Please wait 60 seconds.' },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', resendVerificationLimiter, AuthController.resendVerification);
router.post('/forgot-password', forgotPasswordLimiter, AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
export default router;
//# sourceMappingURL=authRoutes.js.map