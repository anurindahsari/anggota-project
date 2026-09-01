import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { uploadProof } from '../middleware/upload.js';

const router = Router();

// POST /uploads/proof  (multipart/form-data, field name: "file")
// Dipanggil terpisah dari POST /payments/manual - upload dulu, baru kirim proofUrl
// yang dibalikin ke endpoint payments/manual.
router.post('/proof', requireAuth, uploadProof.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diupload.' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

export default router;
