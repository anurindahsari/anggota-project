import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  getDashboardSummary,
  getFlaggedData,
  exportPaymentsCsv,
  listOwnersAdmin,
  updateOwnerAdmin,
  updateBusinessUnitAdmin,
  getBusinessUnitBreakdown,
} from '../controllers/admin.controller.js';

const router = Router();
router.get('/summary', requireAuth, requireAdmin, getDashboardSummary);
router.get('/flagged', requireAuth, requireAdmin, getFlaggedData);
router.get('/business-units/breakdown', requireAuth, requireAdmin, getBusinessUnitBreakdown);
router.get('/export/payments', requireAuth, requireAdmin, exportPaymentsCsv);
router.get('/owners', requireAuth, requireAdmin, listOwnersAdmin);
router.patch('/owners/:id', requireAuth, requireAdmin, updateOwnerAdmin);
router.patch('/business-units/:id', requireAuth, requireAdmin, updateBusinessUnitAdmin);

export default router;
