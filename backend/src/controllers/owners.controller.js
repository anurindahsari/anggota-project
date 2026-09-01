import { query } from '../config/db.js';
import { requestOtp, verifyOtp, isRateLimited } from '../services/otp.service.js';

// GET /owners/me
export async function getMe(req, res) {
  const { rows } = await query(
    `SELECT id, full_name, phone, role FROM owners WHERE id = $1`,
    [req.ownerId]
  );
  res.json({ owner: rows[0] });
}

// PATCH /owners/me  { fullName }
// Sengaja cuma nama yang bisa diedit langsung di sini - alamat itu milik tiap unit usaha
// (satu owner bisa punya banyak unit dengan alamat beda-beda), jadi diedit dari halaman unit.
export async function updateMe(req, res) {
  const { fullName } = req.body;
  if (!fullName) return res.status(400).json({ error: 'Nama wajib diisi.' });

  await query(`UPDATE owners SET full_name = $1, updated_at = now() WHERE id = $2`, [
    fullName,
    req.ownerId,
  ]);
  res.json({ message: 'Profil diperbarui.' });
}

// POST /owners/me/change-phone/request
// Kirim OTP ke nomor LAMA dulu, buat buktiin yang minta ganti nomor beneran pemilik akun ini.
export async function requestPhoneChange(req, res) {
  const { rows } = await query(`SELECT phone FROM owners WHERE id = $1`, [req.ownerId]);
  const currentPhone = rows[0]?.phone;
  if (!currentPhone) {
    return res.status(400).json({ error: 'Akun ini belum punya nomor HP terdaftar, hubungi admin.' });
  }

  if (await isRateLimited(currentPhone, 'change_phone')) {
    return res.status(429).json({ error: 'Terlalu sering minta kode. Coba lagi dalam beberapa menit.' });
  }

  await requestOtp(currentPhone, 'change_phone');
  res.json({ message: 'Kode verifikasi dikirim ke nomor WhatsApp yang lama.' });
}

// POST /owners/me/change-phone/confirm  { code, newPhone }
export async function confirmPhoneChange(req, res) {
  const { code, newPhone } = req.body;
  const { rows } = await query(`SELECT phone FROM owners WHERE id = $1`, [req.ownerId]);
  const currentPhone = rows[0]?.phone;

  const valid = await verifyOtp(currentPhone, code, 'change_phone');
  if (!valid) return res.status(400).json({ error: 'Kode salah atau kedaluwarsa.' });

  const clash = await query(`SELECT id FROM owners WHERE phone = $1 AND id != $2`, [newPhone, req.ownerId]);
  if (clash.rows.length > 0) {
    return res.status(409).json({ error: 'Nomor itu sudah dipakai akun lain.' });
  }

  await query(`UPDATE owners SET phone = $1, updated_at = now() WHERE id = $2`, [newPhone, req.ownerId]);
  await query(
    `INSERT INTO audit_logs (actor_id, action, entity, entity_id, old_value, new_value)
     VALUES ($1, 'phone_changed', 'owners', $1, $2, $3)`,
    [req.ownerId, JSON.stringify({ phone: currentPhone }), JSON.stringify({ phone: newPhone })]
  );

  res.json({ message: 'Nomor WhatsApp berhasil diganti.' });
}

// GET /owners/me/summary
// Status bayar SELALU dihitung on-the-fly dari payments vs membership_periods,
// tidak pernah disimpan sebagai kolom terpisah - biar tidak pernah out of sync.
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
