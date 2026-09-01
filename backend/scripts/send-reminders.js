// Skrip reminder otomatis. Dijalankan terjadwal lewat cron (bukan proses yang nyala terus),
// misal sekali sehari. Ada 2 jenis reminder:
//   1. Iuran mendekati jatuh tempo (H-7) yang belum lunas
//   2. Event dalam 3 hari, khusus ke yang sudah terdaftar
//
// Cara pakai (contoh crontab, jalan tiap hari jam 8 pagi):
//   0 8 * * * cd /path/to/backend && node scripts/send-reminders.js >> logs/reminders.log 2>&1

import { pool } from '../src/config/db.js';
import { sendWhatsApp } from '../src/services/wa.service.js';

async function remindUnpaidDues() {
  const { rows } = await pool.query(`
    SELECT DISTINCT o.phone, o.full_name, mp.name AS period, mp.end_date,
           bu.business_name, (mp.amount_due - COALESCE(paid.total, 0)) AS shortfall
    FROM business_units bu
    JOIN owners o ON o.id = bu.owner_id
    JOIN membership_periods mp
      ON mp.end_date BETWEEN now() AND now() + interval '7 days'
    LEFT JOIN (
      SELECT business_unit_id, period_id, SUM(amount) AS total
      FROM payments WHERE status = 'verified'
      GROUP BY business_unit_id, period_id
    ) paid ON paid.business_unit_id = bu.id AND paid.period_id = mp.id
    WHERE o.phone IS NOT NULL
      AND COALESCE(paid.total, 0) < mp.amount_due
  `);

  for (const row of rows) {
    const message =
      `Pengingat: iuran ${row.period} untuk ${row.business_name} masih kurang ` +
      `Rp${Number(row.shortfall).toLocaleString('id-ID')}. Jatuh tempo ${new Date(row.end_date).toLocaleDateString('id-ID')}. ` +
      `Segera lunasi lewat aplikasi ya, Pak/Bu ${row.full_name}.`;
    await sendWhatsApp(row.phone, message);
  }

  console.log(`Reminder iuran terkirim ke ${rows.length} pemilik.`);
}

async function remindUpcomingEvents() {
  const { rows } = await pool.query(`
    SELECT DISTINCT o.phone, o.full_name, e.title, e.event_date, e.location
    FROM event_registrations er
    JOIN owners o ON o.id = er.owner_id
    JOIN events e ON e.id = er.event_id
    WHERE e.event_date BETWEEN now() AND now() + interval '3 days'
      AND er.status = 'registered'
      AND o.phone IS NOT NULL
  `);

  for (const row of rows) {
    const message =
      `Pengingat: "${row.title}" akan berlangsung ${new Date(row.event_date).toLocaleDateString('id-ID')} ` +
      `di ${row.location}. Jangan lupa bawa QR tiket kamu, Pak/Bu ${row.full_name}.`;
    await sendWhatsApp(row.phone, message);
  }

  console.log(`Reminder event terkirim ke ${rows.length} pemilik.`);
}

async function run() {
  await remindUnpaidDues();
  await remindUpcomingEvents();
  await pool.end();
}

run().catch((err) => {
  console.error('Reminder gagal jalan:', err);
  process.exit(1);
});
