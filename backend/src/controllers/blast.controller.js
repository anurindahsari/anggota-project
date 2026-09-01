import { query } from '../config/db.js';
import { sendBulkWhatsApp } from '../services/wa.service.js';

// POST /blast  { targetFilter: 'all' | 'unpaid' | 'registered_event', eventId?, message }
export async function sendBlast(req, res) {
  const { targetFilter, eventId, message } = req.body;

  let phones = [];

  if (targetFilter === 'all') {
    const { rows } = await query(`SELECT phone FROM owners WHERE status = 'active'`);
    phones = rows.map((r) => r.phone);
  } else if (targetFilter === 'unpaid') {
    const { rows } = await query(
      `SELECT DISTINCT o.phone FROM owners o
       JOIN business_units bu ON bu.owner_id = o.id
       JOIN membership_periods mp ON mp.end_date >= now()
       LEFT JOIN payments p ON p.business_unit_id = bu.id AND p.period_id = mp.id AND p.status = 'verified'
       GROUP BY o.phone, bu.id, mp.amount_due
       HAVING COALESCE(SUM(p.amount), 0) < mp.amount_due`
    );
    phones = rows.map((r) => r.phone);
  } else if (targetFilter === 'registered_event' && eventId) {
    const { rows } = await query(
      `SELECT o.phone FROM owners o
       JOIN event_registrations er ON er.owner_id = o.id
       WHERE er.event_id = $1`,
      [eventId]
    );
    phones = rows.map((r) => r.phone);
  }

  const { sent, failed } = await sendBulkWhatsApp(phones, message);

  await query(
    `INSERT INTO wa_blast_logs (event_id, message, target_filter, sent_count, failed_count, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [eventId || null, message, targetFilter, sent, failed, req.ownerId]
  );

  res.json({ message: `Terkirim ke ${sent} nomor, gagal ${failed}.` });
}
