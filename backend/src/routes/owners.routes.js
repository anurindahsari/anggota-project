import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getMySummary,
  getMe,
  updateMe,
  changePhone,
  changePassword,
  getUnitDetail,
  updateUnit,
} from '../controllers/owners.controller.js';

const router = Router();
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);
router.post('/me/change-phone', requireAuth, changePhone);
router.post('/me/change-password', requireAuth, changePassword);
router.get('/me/summary', requireAuth, getMySummary);
router.get('/me/units/:id', requireAuth, getUnitDetail);
router.patch('/me/units/:id', requireAuth, updateUnit);

export default router;
