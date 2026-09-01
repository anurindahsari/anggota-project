// Isi data contoh biar ada yang bisa dicoba login & dites end-to-end tanpa
// perlu import file Excel dulu. Aman dijalankan berkali-kali (pakai ON CONFLICT).
//
// Cara pakai: node scripts/seed-test-data.js

import { pool } from '../src/config/db.js';

const TEST_PHONE = '628123456789'; // ganti ke nomor WA kamu sendiri kalau mau coba beneran

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const owner = await client.query(
      `INSERT INTO owners (full_name, phone)
       VALUES ('Owner Percobaan', $1)
       ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      [TEST_PHONE]
    );
    const ownerId = owner.rows[0].id;

    const period = await client.query(
      `INSERT INTO membership_periods (name, start_date, end_date, amount_due)
       VALUES ('Iuran Q1 2026', '2026-01-01', '2026-12-31', 500000)
       RETURNING id`
    );
    const periodId = period.rows[0].id;

    const unit1 = await client.query(
      `INSERT INTO business_units (owner_id, business_name, business_type, unit_number, address, city)
       VALUES ($1, 'PT Percobaan Satu', 'SPBU', '54.601.99', 'Jl. Contoh No. 1', 'Kota Surabaya')
       RETURNING id`,
      [ownerId]
    );
    const unit2 = await client.query(
      `INSERT INTO business_units (owner_id, business_name, business_type, unit_number, address, city)
       VALUES ($1, 'PT Percobaan Dua', 'AGEN LPG PSO', NULL, 'Jl. Contoh No. 2', 'Kota Surabaya')
       RETURNING id`,
      [ownerId]
    );

    // Unit 1 dibikin sudah lunas, unit 2 sengaja dibiarkan kurang bayar -
    // biar kelihatan dua kondisi berbeda pas login & lihat dashboard.
    await client.query(
      `INSERT INTO payments (business_unit_id, period_id, amount, method, status, verified_at)
       VALUES ($1, $2, 500000, 'manual_transfer', 'verified', now())`,
      [unit1.rows[0].id, periodId]
    );
    await client.query(
      `INSERT INTO payments (business_unit_id, period_id, amount, method, status)
       VALUES ($1, $2, 200000, 'manual_transfer', 'verified')`,
      [unit2.rows[0].id, periodId]
    );

    const event = await client.query(
      `INSERT INTO events (title, description, event_date, location, requires_paid_membership, is_public)
       VALUES ('Muscab ke-11 DPC Surabaya', 'Musyawarah cabang tahunan.', now() + interval '14 days',
               'Hotel Shangri-La Surabaya', true, true)
       RETURNING id`
    );

    await client.query('COMMIT');

    console.log('Seed selesai. Data contoh:');
    console.log(`  Nomor HP buat login: ${TEST_PHONE}`);
    console.log(`  Owner ID: ${ownerId}`);
    console.log(`  Event publik: /e/${event.rows[0].id}`);
    console.log(`  Unit 1 (PT Percobaan Satu): lunas`);
    console.log(`  Unit 2 (PT Percobaan Dua): kurang Rp300.000`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Seed gagal:', err);
  process.exit(1);
});
