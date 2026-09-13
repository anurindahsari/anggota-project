import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  listUpcomingEvents,
  getPublicEvent,
  registerForEvent,
  checkinByQr,
  submitFeedback,
  createEventAdmin,
} from '../controllers/events.controller.js';

const router = Router();
router.get('/upcoming', requireAuth, listUpcomingEvents); // privat - anggota saja
router.post('/', requireAuth, requireAdmin, createEventAdmin);
router.get('/public/:id', getPublicEvent); // tanpa requireAuth, sengaja bisa diakses siapa saja
router.post('/:id/register', requireAuth, registerForEvent);
router.post('/checkin', requireAuth, checkinByQr);
router.post('/:id/feedback', requireAuth, submitFeedback);

export default router;
