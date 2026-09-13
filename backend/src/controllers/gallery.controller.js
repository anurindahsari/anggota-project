import { query } from '../config/db.js';

// GET /gallery - daftar postingan, publik, urut terbaru dulu
export async function listGalleryPosts(req, res) {
  const { rows } = await query(
    `SELECT gp.id, gp.title, gp.caption, gp.event_date,
            (SELECT gi.image_url FROM gallery_images gi WHERE gi.post_id = gp.id ORDER BY gi.sort_order ASC LIMIT 1) AS cover_image_url
     FROM gallery_posts gp
     ORDER BY gp.event_date DESC NULLS LAST, gp.created_at DESC`
  );
  res.json({ posts: rows });
}

// GET /gallery/:id - detail satu postingan + semua foto, publik
export async function getGalleryPost(req, res) {
  const { id } = req.params;
  const { rows: postRows } = await query(
    `SELECT id, title, caption, event_date FROM gallery_posts WHERE id = $1`,
    [id]
  );
  if (postRows.length === 0) return res.status(404).json({ error: 'Postingan tidak ditemukan.' });

  const { rows: images } = await query(
    `SELECT image_url FROM gallery_images WHERE post_id = $1 ORDER BY sort_order ASC`,
    [id]
  );

  res.json({ post: { ...postRows[0], images: images.map((i) => i.image_url) } });
}

// POST /gallery  (admin only)  { title, caption, eventDate, imageUrls: [...] }
export async function createGalleryPost(req, res) {
  const { title, caption, eventDate, imageUrls } = req.body;
  if (!title) return res.status(400).json({ error: 'Judul wajib diisi.' });
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return res.status(400).json({ error: 'Minimal 1 foto wajib diupload.' });
  }

  const { rows } = await query(
    `INSERT INTO gallery_posts (title, caption, event_date, created_by) VALUES ($1, $2, $3, $4) RETURNING id`,
    [title, caption || null, eventDate || null, req.ownerId]
  );
  const postId = rows[0].id;

  for (let i = 0; i < imageUrls.length; i++) {
    await query(
      `INSERT INTO gallery_images (post_id, image_url, sort_order) VALUES ($1, $2, $3)`,
      [postId, imageUrls[i], i]
    );
  }

  res.json({ message: 'Postingan galeri berhasil dibuat.', postId });
}
