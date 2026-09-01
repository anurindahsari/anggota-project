import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { sendWhatsApp } from './wa.service.js';

const MAX_ATTEMPTS = 3;
const WINDOW_MINUTES = 15;

function generateSixDigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Cek berapa kali nomor ini minta OTP dalam beberapa menit terakhir. Tanpa ini,
// siapapun yang tau nomor WA anggota bisa spam kirim kode ke nomor itu berkali-kali.
export async function isRateLimited(phone, purpose = 'login') {
  const { rows } = await query(
    `SELECT COUNT(*) FROM otp_codes
     WHERE phone = $1 AND purpose = $2 AND created_at > now() - interval '${WINDOW_MINUTES} minutes'`,
    [phone, purpose]
  );
  return Number(rows[0].count) >= MAX_ATTEMPTS;
}

// Buat kode OTP baru, simpan hash-nya, kirim via WA. Dipanggil pas orang minta login.
export async function requestOtp(phone, purpose = 'login') {
  const code = generateSixDigitCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

  await query(
    `INSERT INTO otp_codes (phone, code_hash, purpose, expires_at) VALUES ($1, $2, $3, $4)`,
    [phone, codeHash, purpose, expiresAt]
  );

  await sendWhatsApp(phone, `Kode masuk kamu: ${code}. Berlaku 5 menit, jangan kasih ke siapa pun.`);
}

// Cek kode yang diinput user, tandai sebagai sudah dipakai kalau cocok.
export async function verifyOtp(phone, code, purpose = 'login') {
  const { rows } = await query(
    `SELECT * FROM otp_codes
     WHERE phone = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > now()
     ORDER BY created_at DESC LIMIT 1`,
    [phone, purpose]
  );

  if (rows.length === 0) return false;

  const match = await bcrypt.compare(code, rows[0].code_hash);
  if (!match) return false;

  await query(`UPDATE otp_codes SET used_at = now() WHERE id = $1`, [rows[0].id]);
  return true;
}
