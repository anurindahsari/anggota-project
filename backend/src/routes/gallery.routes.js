import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { listGalleryPosts, getGalleryPost, createGalleryPost } from '../controllers/gallery.controller.js';

const router = Router();
router.get('/', listGalleryPosts);
router.get('/:id', getGalleryPost);
router.post('/', requireAuth, requireAdmin, createGalleryPost);

export default router;
