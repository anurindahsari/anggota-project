import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getMySummary,
  getMe,
  updateMe,
  requestPhoneChange,
  confirmPhoneChange,
} from '../controllers/owners.controller.js';

const router = Router();
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);
router.post('/me/change-phone/request', requireAuth, requestPhoneChange);
router.post('/me/change-phone/confirm', requireAuth, confirmPhoneChange);
router.get('/me/summary', requireAuth, getMySummary);

export default router;
