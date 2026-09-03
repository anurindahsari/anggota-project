import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { normalizePhone } from '../utils/phone.js';

// GET /owners/me
export async function getMe(req, res) {
  const { rows } = await query(
    `SELECT id, full_name, phone, role FROM owners WHERE id = $1`,
    [req.ownerId]
  );
  res.json({ owner: rows[0] });
}

// PATCH /owners/me  { fullName }
export async function updateMe(req, res) {
  const { fullName } = req.body;
  if (!fullName) return res.status(400).json({ error: 'Nama wajib diisi.' });

  await query(`UPDATE owners SET full_name = $1, updated_at = now() WHERE id = $2`, [
    fullName,
    req.ownerId,
  ]);
  res.json({ message: 'Profil diperbarui.' });
}

// POST /owners/me/change-phone  { password, newPhone }
// Verifikasi pakai password (bukan OTP lagi) sebelum ganti nomor.
export async function changePhone(req, res) {
  const { password, newPhone } = req.body;
  if (!password || !newPhone) {
    return res.status(400).json({ error: 'Password dan nomor baru wajib diisi.' });
  }

  const normalizedNew = normalizePhone(newPhone);
  if (!normalizedNew) return res.status(400).json({ error: 'Nomor WhatsApp baru tidak valid.' });

  const { rows } = await query('SELECT phone, password_hash FROM owners WHERE id = $1', [req.ownerId]);
  const current = rows[0];

  const match = await bcrypt.compare(password, current.password_hash);
  if (!match) return res.status(400).json({ error: 'Password salah.' });

  const clash = await query('SELECT id FROM owners WHERE phone = $1 AND id != $2', [normalizedNew, req.ownerId]);
  if (clash.rows.length > 0) {
    return res.status(409).json({ error: 'Nomor itu sudah dipakai akun lain.' });
  }

  await query('UPDATE owners SET phone = $1, updated_at = now() WHERE id = $2', [normalizedNew, req.ownerId]);
  await query(
    `INSERT INTO audit_logs (actor_id, action, entity, entity_id, old_value, new_value)
     VALUES ($1, 'phone_changed', 'owners', $1, $2, $3)`,
    [req.ownerId, JSON.stringify({ phone: current.phone }), JSON.stringify({ phone: normalizedNew })]
  );

  res.json({ message: 'Nomor WhatsApp berhasil diganti.' });
}

// POST /owners/me/change-password  { currentPassword, newPassword }
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Password lama dan baru wajib diisi.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
  }

  const { rows } = await query('SELECT password_hash FROM owners WHERE id = $1', [req.ownerId]);
  const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!match) return res.status(400).json({ error: 'Password lama salah.' });

  const newHash = await bcrypt.hash(newPassword, 10);
  await query('UPDATE owners SET password_hash = $1, updated_at = now() WHERE id = $2', [newHash, req.ownerId]);
  res.json({ message: 'Password berhasil diganti.' });
}

// GET /owners/me/summary
export async function getMySummary(req, res) {
  const { rows: units } = await query(
    `SELECT
       bu.id, bu.business_name, bu.unit_number,
       mp.id AS period_id, mp.name AS period_name, mp.amount_due,
       COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'verified'), 0) AS amount_paid
     FROM business_units bu
     CROSS JOIN membership_periods mp
     LEFT JOIN payments p ON p.business_unit_id = bu.id AND p.period_id = mp.id
     WHERE bu.owner_id = $1
     GROUP BY bu.id, bu.business_name, bu.unit_number, mp.id, mp.name, mp.amount_due
     ORDER BY mp.start_date DESC, bu.business_name`,
    [req.ownerId]
  );

  const result = units.map((u) => ({
    businessUnitId: u.id,
    businessName: u.business_name,
    unitNumber: u.unit_number,
    periodId: u.period_id,
    period: u.period_name,
    amountDue: Number(u.amount_due),
    amountPaid: Number(u.amount_paid),
    shortfall: Math.max(Number(u.amount_due) - Number(u.amount_paid), 0),
    status: Number(u.amount_paid) >= Number(u.amount_due) ? 'lunas' : 'kurang',
  }));

  res.json({ units: result });
}
