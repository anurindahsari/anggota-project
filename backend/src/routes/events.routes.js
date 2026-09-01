import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listUpcomingEvents,
  getPublicEvent,
  registerForEvent,
  checkinByQr,
  submitFeedback,
} from '../controllers/events.controller.js';

const router = Router();
router.get('/upcoming', listUpcomingEvents);
router.get('/public/:id', getPublicEvent); // tanpa requireAuth, sengaja bisa diakses siapa saja
router.post('/:id/register', requireAuth, registerForEvent);
router.post('/checkin', requireAuth, checkinByQr);
router.post('/:id/feedback', requireAuth, submitFeedback);

export default router;
