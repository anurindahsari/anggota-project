import { query } from '../config/db.js';

// GET /admin/summary
// Angka ringkas buat ditaruh di kartu-kartu dashboard admin.
export async function getDashboardSummary(req, res) {
  const { rows: totals } = await query(`
    SELECT
      (SELECT COUNT(*) FROM owners) AS total_owners,
      (SELECT COUNT(*) FROM business_units) AS total_units,
      (SELECT COUNT(*) FROM owners WHERE data_issues != '{}') AS owners_flagged,
      (SELECT COUNT(*) FROM business_units WHERE data_issues != '{}') AS units_flagged
  `);

  // Status lunas/kurang dihitung untuk periode iuran yang sedang berjalan
  const { rows: periodStatus } = await query(`
    SELECT
      mp.id, mp.name, mp.amount_due,
      COUNT(bu.id) AS total_units,
      COUNT(bu.id) FILTER (
        WHERE COALESCE((
          SELECT SUM(p.amount) FROM payments p
          WHERE p.business_unit_id = bu.id AND p.period_id = mp.id AND p.status = 'verified'
        ), 0) >= mp.amount_due
      ) AS units_lunas
    FROM membership_periods mp
    CROSS JOIN business_units bu
    WHERE mp.end_date >= now()
    GROUP BY mp.id, mp.name, mp.amount_due
    ORDER BY mp.start_date DESC
    LIMIT 1
  `);

  const { rows: revenue } = await query(`
    SELECT date_trunc('month', verified_at) AS month, SUM(amount) AS total
    FROM payments
    WHERE status = 'verified' AND verified_at >= now() - interval '6 months'
    GROUP BY 1 ORDER BY 1
  `);

  res.json({
    totals: totals[0],
    currentPeriod: periodStatus[0] || null,
    revenueByMonth: revenue,
  });
}

// GET /admin/flagged
// Daftar owner & unit usaha yang data_issues-nya tidak kosong, buat halaman "perlu dilengkapi".
export async function getFlaggedData(req, res) {
  const { rows: owners } = await query(
    `SELECT id, full_name, phone, data_issues FROM owners WHERE data_issues != '{}' ORDER BY full_name`
  );
  const { rows: units } = await query(
    `SELECT id, business_name, business_type, owner_id, data_issues
     FROM business_units WHERE data_issues != '{}' ORDER BY business_name`
  );

  res.json({ owners, businessUnits: units });
}

// GET /admin/export/payments?periodId=...
// Export CSV rekap pembayaran untuk laporan pertanggungjawaban.
export async function exportPaymentsCsv(req, res) {
  const { periodId } = req.query;

  const { rows } = await query(
    `SELECT
       o.full_name, bu.business_name, bu.business_type, bu.unit_number,
       mp.name AS period, p.amount, p.method, p.status, p.verified_at
     FROM payments p
     JOIN business_units bu ON bu.id = p.business_unit_id
     JOIN owners o ON o.id = bu.owner_id
     JOIN membership_periods mp ON mp.id = p.period_id
     WHERE ($1::uuid IS NULL OR p.period_id = $1)
     ORDER BY o.full_name`,
    [periodId || null]
  );

  const header = 'nama_pemilik,nama_usaha,bidang_usaha,nomor_unit,periode,jumlah,metode,status,tanggal_verifikasi\n';
  const csvBody = rows
    .map((r) =>
      [r.full_name, r.business_name, r.business_type, r.unit_number, r.period, r.amount, r.method, r.status, r.verified_at]
        .map((v) => `"${v ?? ''}"`)
        .join(',')
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="rekap-pembayaran.csv"');
  res.send(header + csvBody);
}

// GET /admin/owners?search=...
// List semua owner + unit usaha mereka, buat halaman kelola data anggota.
export async function listOwnersAdmin(req, res) {
  const { search } = req.query;
  const params = [];
  let where = '';
  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    where = `WHERE o.full_name ILIKE $1 OR o.phone ILIKE $1`;
  }

  const { rows } = await query(
    `SELECT o.id, o.full_name, o.phone, o.role, o.status,
       COALESCE(
         json_agg(
           json_build_object(
             'id', bu.id, 'business_name', bu.business_name, 'business_type', bu.business_type,
             'unit_number', bu.unit_number, 'address', bu.address, 'city', bu.city,
             'contact_email', bu.contact_email, 'status', bu.status
           ) ORDER BY bu.business_name
         ) FILTER (WHERE bu.id IS NOT NULL), '[]'
       ) AS business_units
     FROM owners o
     LEFT JOIN business_units bu ON bu.owner_id = o.id
     ${where}
     GROUP BY o.id
     ORDER BY o.full_name
     LIMIT 100`,
    params
  );

  res.json({ owners: rows });
}

// PATCH /admin/owners/:id  { fullName, phone, status }
export async function updateOwnerAdmin(req, res) {
  const { id } = req.params;
  const { fullName, phone, status } = req.body;

  await query(
    `UPDATE owners SET
       full_name = COALESCE($2, full_name),
       phone = COALESCE($3, phone),
       status = COALESCE($4, status),
       updated_at = now()
     WHERE id = $1`,
    [id, fullName || null, phone || null, status || null]
  );

  res.json({ message: 'Data pemilik diperbarui.' });
}

// PATCH /admin/business-units/:id
export async function updateBusinessUnitAdmin(req, res) {
  const { id } = req.params;
  const { businessName, businessType, unitNumber, address, city, contactEmail, status } = req.body;

  await query(
    `UPDATE business_units SET
       business_name = COALESCE($2, business_name),
       business_type = COALESCE($3, business_type),
       unit_number = COALESCE($4, unit_number),
       address = COALESCE($5, address),
       city = COALESCE($6, city),
       contact_email = COALESCE($7, contact_email),
       status = COALESCE($8, status)
     WHERE id = $1`,
    [id, businessName || null, businessType || null, unitNumber || null, address || null, city || null, contactEmail || null, status || null]
  );

  res.json({ message: 'Data unit usaha diperbarui.' });
}
