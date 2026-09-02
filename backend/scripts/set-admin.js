// Jalankan dari folder backend: node scripts/set-admin.js
// Mendaftarkan (atau menaikkan role) nomor tertentu jadi 'admin' di tabel owners.
import 'dotenv/config';
import { query } from '../src/config/db.js';

const PHONE_RAW = '08195002295';
const FULL_NAME = 'Arinta Nurindahsari'; // ganti kalau namanya beda

function normalizePhone(raw) {
  let digits = String(raw).replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) digits = '62' + digits.slice(1);
  if (!digits.startsWith('62')) digits = '62' + digits;
  return digits;
}

async function main() {
  const phone = normalizePhone(PHONE_RAW);

  const { rows: existing } = await query('SELECT id, role FROM owners WHERE phone = $1', [phone]);

  if (existing.length > 0) {
    await query(
      `UPDATE owners SET role = 'admin', status = 'active', updated_at = now() WHERE phone = $1`,
      [phone]
    );
    console.log(`OK: owner dengan nomor ${phone} sudah ada, role diubah jadi 'admin'.`);
  } else {
    await query(
      `INSERT INTO owners (full_name, phone, role, status) VALUES ($1, $2, 'admin', 'active')`,
      [FULL_NAME, phone]
    );
    console.log(`OK: owner baru dibuat dengan nomor ${phone}, role 'admin'.`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('GAGAL:', err.message);
  process.exit(1);
});
