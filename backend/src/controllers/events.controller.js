import { query } from '../config/db.js';
import QRCode from 'qrcode';
import { randomUUID } from 'crypto';

// GET /events/upcoming
export async function listUpcomingEvents(req, res) {
  const { rows } = await query(
    `SELECT id, title, event_date, location, requires_paid_membership
     FROM events WHERE event_date >= now() ORDER BY event_date ASC`
  );
  res.json({ events: rows });
}

// GET /events/public/:id  (tanpa requireAuth - buat halaman promosi yang bisa dishare ke luar)
export async function getPublicEvent(req, res) {
  const { id } = req.params;
  const { rows } = await query(
    `SELECT id, title, description, event_date, location FROM events
     WHERE id = $1 AND is_public = true`,
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Event tidak ditemukan atau bukan event publik.' });
  }

  res.json({ event: rows[0] });
}

// POST /events/:id/register
// Inti dari gating: cek SEMUA unit usaha milik owner ini lunas dulu, baru generate QR.
export async function registerForEvent(req, res) {
  const { id: eventId } = req.params;
  const ownerId = req.ownerId;

  const { rows: unpaidUnits } = await query(
    `SELECT bu.business_name, mp.amount_due,
            COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'verified'), 0) AS paid
     FROM business_units bu
     CROSS JOIN membership_periods mp
     LEFT JOIN payments p ON p.business_unit_id = bu.id AND p.period_id = mp.id
     WHERE bu.owner_id = $1 AND mp.end_date >= now()
     GROUP BY bu.id, bu.business_name, mp.amount_due
     HAVING COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'verified'), 0) < mp.amount_due`,
    [ownerId]
  );

  if (unpaidUnits.length > 0) {
    return res.status(402).json({
      error: 'Masih ada unit usaha yang belum lunas iuran.',
      unpaidUnits,
    });
  }

  const qrToken = randomUUID();
  await query(
    `INSERT INTO event_registrations (event_id, owner_id, qr_code)
     VALUES ($1, $2, $3)
     ON CONFLICT (event_id, owner_id) DO NOTHING`,
    [eventId, ownerId, qrToken]
  );

  const qrImage = await QRCode.toDataURL(qrToken);
  res.json({ message: 'Berhasil daftar event.', qrImage });
}

// POST /events/checkin  { qrCode }  (dipakai panitia)
export async function checkinByQr(req, res) {
  const { qrCode } = req.body;

  const { rows } = await query(
    `SELECT er.id, o.full_name FROM event_registrations er
     JOIN owners o ON o.id = er.owner_id
     WHERE er.qr_code = $1 AND er.status != 'checked_in'`,
    [qrCode]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'QR tidak valid atau sudah check-in sebelumnya.' });
  }

  await query(`UPDATE event_registrations SET status = 'checked_in' WHERE id = $1`, [rows[0].id]);
  await query(`INSERT INTO event_checkins (registration_id, checked_in_by) VALUES ($1, $2)`, [
    rows[0].id,
    req.ownerId,
  ]);

  res.json({ message: `Check-in berhasil untuk ${rows[0].full_name}.` });
}

// POST /events/:id/feedback  { rating, comment }
export async function submitFeedback(req, res) {
  const { id: eventId } = req.params;
  const { rating, comment } = req.body;

  const { rows } = await query(
    `SELECT id FROM event_registrations WHERE event_id = $1 AND owner_id = $2`,
    [eventId, req.ownerId]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Kamu belum terdaftar di event ini.' });

  await query(
    `INSERT INTO event_feedback (registration_id, rating, comment) VALUES ($1, $2, $3)`,
    [rows[0].id, rating, comment]
  );

  res.json({ message: 'Terima kasih atas feedback-nya.' });
}
