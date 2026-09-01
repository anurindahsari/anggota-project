// Skrip import data anggota dari file Excel (format seperti DATA_BAHAN_REGISTRASI_MUSCAB_KE_11.xlsx)
// ke tabel owners + business_units.
//
// Prinsip: SEMUA baris yang punya nama usaha diimport, tanpa dibuang. Kalau ada data yang
// kurang lengkap (nama pemilik kosong, HP kosong, dll), baris tetap masuk tapi ditandai
// lewat kolom data_issues, supaya admin bisa lihat & lengkapi belakangan dari dashboard.
//
// Cara pakai:
//   npm install xlsx        (belum ada di package.json utama, khusus dipakai skrip ini)
//   node scripts/import-members.js path/ke/file.xlsx

import xlsx from 'xlsx';
import { pool } from '../src/config/db.js';
import { normalizePhone } from '../src/utils/phone.js';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Pakai: node scripts/import-members.js path/ke/file.xlsx');
  process.exit(1);
}

// Excel sumbernya punya 3 baris header, data beneran mulai baris ke-4.
// Urutan kolom: No, Nama, Usaha, Bidang usaha, Nomor unit, Inisial, Alamat, Kota, No HP, Email.
const HEADER_ROWS_TO_SKIP = 3;

// Owner tanpa HP tidak bisa dideteksi duplikatnya (kunci dedup kita adalah HP),
// jadi setiap baris tanpa HP selalu jadi owner baru - dan ditandai supaya admin
// tau perlu dicek manual apa ini sebenarnya orang yang sama dengan owner lain.
async function findOrCreateOwner(client, fullName, phone, issues) {
  if (phone) {
    const existing = await client.query('SELECT id FROM owners WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) return { id: existing.rows[0].id, isNew: false };
  }

  const inserted = await client.query(
    `INSERT INTO owners (full_name, phone, data_issues) VALUES ($1, $2, $3) RETURNING id`,
    [fullName, phone, issues]
  );
  return { id: inserted.rows[0].id, isNew: true };
}

async function run() {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
  const dataRows = rows.slice(HEADER_ROWS_TO_SKIP);

  const client = await pool.connect();
  let ownersCreated = 0;
  let unitsCreated = 0;
  let flaggedOwners = 0;
  let flaggedUnits = 0;
  let rowsSkippedEmpty = 0; // hanya baris yang BENAR-BENAR kosong total, bukan sekadar kurang lengkap

  try {
    await client.query('BEGIN');

    for (const row of dataRows) {
      const [, fullNameRaw, businessName, businessType, unitNumber, , address, city, phoneRaw, email] = row;

      if (!businessName) {
        rowsSkippedEmpty++; // baris kosong total (bukan data anggota, misal baris pemisah)
        continue;
      }

      const ownerIssues = [];
      const unitIssues = [];

      const phone = normalizePhone(phoneRaw);
      if (!phone) ownerIssues.push('missing_phone');

      let ownerName = fullNameRaw;
      if (!ownerName) {
        ownerName = `${businessName} (nama PIC belum diisi)`;
        ownerIssues.push('name_from_business_fallback');
      }

      if (!unitNumber) unitIssues.push('missing_unit_number');
      if (!address) unitIssues.push('missing_address');
      if (!city) unitIssues.push('missing_city');
      if (!email) unitIssues.push('missing_email');
      if (!businessType) unitIssues.push('missing_business_type');

      const { id: ownerId, isNew } = await findOrCreateOwner(client, ownerName, phone, ownerIssues);
      if (isNew) {
        ownersCreated++;
        if (ownerIssues.length > 0) flaggedOwners++;
      }

      await client.query(
        `INSERT INTO business_units
           (owner_id, business_name, business_type, unit_number, address, city, contact_email, data_issues)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [ownerId, businessName, businessType || 'Belum diketahui', unitNumber, address, city, email, unitIssues]
      );
      unitsCreated++;
      if (unitIssues.length > 0) flaggedUnits++;
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  console.log(`Selesai.`);
  console.log(`Owner baru: ${ownersCreated} (${flaggedOwners} ditandai data kurang lengkap)`);
  console.log(`Unit usaha baru: ${unitsCreated} (${flaggedUnits} ditandai data kurang lengkap)`);
  console.log(`Baris kosong total yang dilewati (bukan data anggota): ${rowsSkippedEmpty}`);
  console.log(`\nCek data yang ditandai lewat query:`);
  console.log(`  SELECT * FROM owners WHERE data_issues != '{}';`);
  console.log(`  SELECT * FROM business_units WHERE data_issues != '{}';`);

  await pool.end();
}

run().catch((err) => {
  console.error('Import gagal:', err);
  process.exit(1);
});
