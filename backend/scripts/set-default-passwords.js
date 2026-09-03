// Jalankan dari folder backend:
// DATABASE_URL="<connection string Railway>" node scripts/set-default-passwords.js
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { query } from '../src/config/db.js';

const DEFAULT_PASSWORD = 'hiswana123';

async function main() {
  await query(`ALTER TABLE owners ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
  console.log('OK: kolom password_hash siap.');

  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const { rowCount } = await query(
    `UPDATE owners SET password_hash = $1 WHERE password_hash IS NULL`,
    [hash]
  );

  console.log(`OK: password default dipasang ke ${rowCount} akun. Password default: ${DEFAULT_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('GAGAL:', err.message);
  process.exit(1);
});
