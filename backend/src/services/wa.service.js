import axios from 'axios';

// Wrapper tipis di atas provider WA (Fonnte/Wablas). Ganti isi fungsi ini
// kalau pindah provider - bagian lain aplikasi tidak perlu tau detailnya.
export async function sendWhatsApp(phone, message) {
  // Belum ada token WA API disetting (misal pas development lokal) - tampilkan
  // pesannya di terminal aja, jangan gagal diam-diam. Ini yang bikin kamu bisa
  // lihat kode OTP pas testing tanpa perlu akun Fonnte/Wablas dulu.
  if (!process.env.WA_API_TOKEN) {
    console.log(`\n[WA SIMULASI - ke ${phone}]\n${message}\n`);
    return true;
  }

  try {
    const params = new URLSearchParams();
    params.append('target', phone);
    params.append('message', message);
    params.append('countryCode', '62');

    const res = await axios.post(process.env.WA_API_URL, params, {
      headers: { Authorization: process.env.WA_API_TOKEN },
    });

    if (res.data && res.data.status === false) {
      console.error('Fonnte menolak pesan ke', phone, res.data);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Gagal kirim WA ke', phone, err.response?.data || err.message);
    return false;
  }
}

// Buat fitur blast: kirim ke banyak nomor sekaligus, hitung berapa sukses/gagal
export async function sendBulkWhatsApp(phones, message) {
  let sent = 0;
  let failed = 0;
  for (const phone of phones) {
    const ok = await sendWhatsApp(phone, message);
    ok ? sent++ : failed++;
  }
  return { sent, failed };
}
