import axios from 'axios';
import crypto from 'crypto';

const MIDTRANS_BASE_URL = process.env.MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://api.midtrans.com/v2'
  : 'https://api.sandbox.midtrans.com/v2';

// Bikin transaksi QRIS/VA di Midtrans, dapetin qr_url atau nomor VA buat ditampilkan ke user.
// Dokumentasi lengkap: https://docs.midtrans.com/reference/charge-transactions-qris
export async function createCharge({ orderId, amount, paymentType }) {
  const auth = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString('base64');

  const payload = {
    payment_type: paymentType, // "qris" | "bank_transfer"
    transaction_details: { order_id: orderId, gross_amount: amount },
  };

  const { data } = await axios.post(`${MIDTRANS_BASE_URL}/charge`, payload, {
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
  });

  return data;
}

// WAJIB dipanggil sebelum memproses notifikasi apapun dari webhook. Tanpa ini, siapapun
// yang tau URL webhook-nya bisa kirim payload palsu "pembayaran sukses" dan bikin status
// iuran ke-update jadi lunas tanpa ada uang masuk beneran.
// Formula resmi Midtrans: SHA512(order_id + status_code + gross_amount + ServerKey)
// Dokumentasi: https://docs.midtrans.com/reference/http-notification
export function verifySignature(notificationPayload) {
  const { order_id, status_code, gross_amount, signature_key } = notificationPayload;
  if (!order_id || !status_code || !gross_amount || !signature_key) return false;

  const raw = `${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`;
  const expected = crypto.createHash('sha512').update(raw).digest('hex');

  // timingSafeEqual mencegah timing attack - jangan diganti jadi expected === signature_key
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signature_key);
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

// Dipanggil dari webhook Midtrans, SETELAH verifySignature lolos.
export function isPaymentSuccessful(notificationPayload) {
  return (
    notificationPayload.transaction_status === 'settlement' ||
    notificationPayload.transaction_status === 'capture'
  );
}
