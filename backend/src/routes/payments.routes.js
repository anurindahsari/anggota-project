import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  createChargeHandler,
  submitManualProofHandler,
  midtransWebhookHandler,
  approveManualPaymentHandler,
} from '../controllers/payments.controller.js';

const router = Router();
router.post('/charge', requireAuth, createChargeHandler);
router.post('/manual', requireAuth, submitManualProofHandler);
router.post('/webhook/midtrans', midtransWebhookHandler); // tanpa requireAuth, dipanggil server Midtrans
router.post('/:id/approve', requireAuth, requireAdmin, approveManualPaymentHandler);

export default router;
