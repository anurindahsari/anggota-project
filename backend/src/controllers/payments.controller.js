import { query } from '../config/db.js';
import { createCharge, verifySignature, isPaymentSuccessful } from '../services/payment-gateway.service.js';
import { sendWhatsApp } from '../services/wa.service.js';

// POST /payments/charge  { businessUnitId, periodId, amount, paymentType }
// Bikin transaksi QRIS/VA baru, catat sebagai "pending" sambil nunggu webhook.
export async function createChargeHandler(req, res) {
  const { businessUnitId, periodId, amount, paymentType } = req.body;
  const orderId = `iuran-${businessUnitId}-${periodId}-${Date.now()}`;

  const charge = await createCharge({ orderId, amount, paymentType });

  await query(
    `INSERT INTO payments (business_unit_id, period_id, amount, method, status, gateway_ref, gateway_payload)
     VALUES ($1, $2, $3, $4, 'pending', $5, $6)`,
    [businessUnitId, periodId, amount, paymentType, orderId, charge]
  );

  res.json(charge); // berisi qr_url / nomor VA yang ditampilkan ke user
}

// POST /payments/manual  { businessUnitId, periodId, amount, proofUrl }
// Bayar transfer manual, tetap "pending" sampai admin approve.
export async function submitManualProofHandler(req, res) {
  const { businessUnitId, periodId, amount, proofUrl } = req.body;

  await query(
    `INSERT INTO payments (business_unit_id, period_id, amount, method, status, proof_url)
     VALUES ($1, $2, $3, 'manual_transfer', 'pending', $4)`,
    [businessUnitId, periodId, amount, proofUrl]
  );

  res.json({ message: 'Bukti transfer diterima, menunggu verifikasi admin.' });
}

// POST /payments/webhook/midtrans
// Endpoint yang didaftarkan ke Midtrans.
export async function midtransWebhookHandler(req, res) {
  const payload = req.body;

  // 1. Verifikasi signature - tolak kalau payloadnya bukan beneran dari Midtrans.
  if (!verifySignature(payload)) {
    console.warn('Webhook Midtrans ditolak: signature tidak valid.', payload.order_id);
    return res.status(403).json({ error: 'Signature tidak valid.' });
  }

  if (!isPaymentSuccessful(payload)) {
    return res.status(200).send('OK'); // status lain (pending/expire/cancel) - tidak perlu diproses
  }

  // 2. Idempotency: Midtrans bisa kirim notifikasi yang sama lebih dari sekali.
  // Cek dulu apakah payment ini sudah pernah ditandai verified sebelumnya.
  const { rows } = await query(
    `SELECT id, status, business_unit_id FROM payments WHERE gateway_ref = $1`,
    [payload.order_id]
  );

  if (rows.length === 0) {
    console.warn('Webhook Midtrans: order_id tidak ditemukan di database.', payload.order_id);
    return res.status(404).json({ error: 'Order tidak ditemukan.' });
  }

  if (rows[0].status === 'verified') {
    return res.status(200).send('OK'); // sudah pernah diproses, jangan diproses ulang / jangan kirim WA dobel
  }

  await query(
    `UPDATE payments SET status = 'verified', verified_at = now(), gateway_payload = $2
     WHERE gateway_ref = $1`,
    [payload.order_id, payload]
  );

  // 3. Konfirmasi otomatis ke pemilik via WA
  const { rows: ownerRows } = await query(
    `SELECT o.phone, o.full_name FROM owners o
     JOIN business_units bu ON bu.owner_id = o.id
     WHERE bu.id = $1`,
    [rows[0].business_unit_id]
  );
  if (ownerRows[0]?.phone) {
    await sendWhatsApp(
      ownerRows[0].phone,
      `Pembayaran iuran kamu sudah tercatat lunas. Terima kasih, ${ownerRows[0].full_name}.`
    );
  }

  res.status(200).send('OK');
}

// POST /payments/:id/approve  (admin only) - buat approve manual transfer
export async function approveManualPaymentHandler(req, res) {
  const { id } = req.params;

  await query(
    `UPDATE payments SET status = 'verified', verified_by = $2, verified_at = now() WHERE id = $1`,
    [id, req.ownerId]
  );

  await query(
    `INSERT INTO audit_logs (actor_id, action, entity, entity_id, new_value)
     VALUES ($1, 'payment_verified', 'payments', $2, '{"status":"verified"}')`,
    [req.ownerId, id]
  );

  res.json({ message: 'Pembayaran dikonfirmasi lunas.' });
}
