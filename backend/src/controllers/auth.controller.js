import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { normalizePhone } from '../utils/phone.js';

// POST /auth/login  { phone, password }
export async function loginHandler(req, res) {
  const phone = normalizePhone(req.body.phone);
  const { password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'Nomor WhatsApp dan password wajib diisi.' });
  }

  const { rows } = await query(
    'SELECT id, full_name, role, password_hash FROM owners WHERE phone = $1',
    [phone]
  );
  const owner = rows[0];

  if (!owner || !owner.password_hash) {
    return res.status(404).json({ error: 'Nomor tidak terdaftar sebagai anggota.' });
  }

  const match = await bcrypt.compare(password, owner.password_hash);
  if (!match) {
    return res.status(400).json({ error: 'Nomor atau password salah.' });
  }

  const token = jwt.sign({ ownerId: owner.id, role: owner.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.json({ token, owner: { id: owner.id, name: owner.full_name, role: owner.role } });
}
