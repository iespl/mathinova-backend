import { Router } from 'express';
import { CommerceController } from '../controllers/commerceController.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.js';

const router = Router();

// Guest or Authenticated
router.post('/checkout', optionalAuthenticate, CommerceController.checkout);

// Gateway Webhook (Typically protected by secret/ip check, simplified for MVP)
router.post('/webhook', CommerceController.paymentWebhook);

export default router;
