import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { requestOtp, verifyOtp, isRateLimited } from '../services/otp.service.js';
import { normalizePhone } from '../utils/phone.js';

// POST /auth/request-otp  { phone }
export async function requestOtpHandler(req, res) {
  const phone = normalizePhone(req.body.phone);
  if (!phone) return res.status(400).json({ error: 'Nomor WhatsApp tidak valid.' });

  const { rows } = await query('SELECT id FROM owners WHERE phone = $1', [phone]);
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Nomor tidak terdaftar sebagai anggota.' });
  }

  if (await isRateLimited(phone, 'login')) {
    return res.status(429).json({ error: 'Terlalu sering minta kode. Coba lagi dalam beberapa menit.' });
  }

  await requestOtp(phone, 'login');
  res.json({ message: 'Kode OTP terkirim via WhatsApp.' });
}

// POST /auth/verify-otp  { phone, code }
export async function verifyOtpHandler(req, res) {
  const phone = normalizePhone(req.body.phone);
  const { code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Nomor dan kode wajib diisi.' });

  const valid = await verifyOtp(phone, code, 'login');
  if (!valid) return res.status(400).json({ error: 'Kode salah atau sudah kedaluwarsa.' });

  const { rows } = await query('SELECT id, full_name, role FROM owners WHERE phone = $1', [phone]);
  const owner = rows[0];

  const token = jwt.sign({ ownerId: owner.id, role: owner.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.json({ token, owner: { id: owner.id, name: owner.full_name, role: owner.role } });
}
