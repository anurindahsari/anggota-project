import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getDashboardSummary, getFlaggedData, exportPaymentsCsv } from '../controllers/admin.controller.js';

const router = Router();
router.get('/summary', requireAuth, requireAdmin, getDashboardSummary);
router.get('/flagged', requireAuth, requireAdmin, getFlaggedData);
router.get('/export/payments', requireAuth, requireAdmin, exportPaymentsCsv);

export default router;
