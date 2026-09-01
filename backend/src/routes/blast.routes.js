import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { sendBlast } from '../controllers/blast.controller.js';

const router = Router();
router.post('/', requireAuth, requireAdmin, sendBlast);

export default router;
