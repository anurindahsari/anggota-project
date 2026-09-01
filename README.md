# Sistem anggota, iuran & event

## Struktur
- `backend/` — Node.js + Express + PostgreSQL. Semua endpoint API ada di sini.
- `frontend/` — Next.js. Skeleton halaman sesuai mockup yang sudah disetujui.

## Coba jalanin di lokal (tanpa perlu akun Midtrans/WA dulu)
```
cd backend
cp .env.example .env              # DATABASE_URL wajib diisi, sisanya boleh dikosongkan dulu
npm install
psql $DATABASE_URL -f src/db/schema.sql
node scripts/seed-test-data.js    # bikin 1 owner + 2 unit usaha + 1 event contoh
npm run dev
```
Buka terminal baru:
```
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```
Buka `http://localhost:3000`, login pakai nomor `628123456789` (atau nomor apa aja yang kamu
ganti di `seed-test-data.js`). Karena `WA_API_TOKEN` belum diisi di `.env`, kode OTP-nya **muncul
di terminal backend**, bukan beneran ke WhatsApp — cukup buat coba alurnya dulu.

Charge QRIS/VA (`/payments/charge`) akan gagal kalau `MIDTRANS_SERVER_KEY` belum diisi - itu
wajar, tinggal daftar akun sandbox Midtrans dulu kalau mau coba jalur itu. Jalur "transfer
manual" tetap bisa dicoba penuh tanpa akun apapun.

## Cara jalanin backend (setup lengkap/production)
```
cd backend
cp .env.example .env      # isi DATABASE_URL, JWT_SECRET, kunci Midtrans/Xendit, token WA
npm install
psql $DATABASE_URL -f src/db/schema.sql   # bikin semua tabel
npm run dev
```

## Cara jalanin frontend
```
cd frontend
cp .env.local.example .env.local   # isi NEXT_PUBLIC_API_URL sesuai alamat backend
npm install
npm run dev
```

## Endpoint yang sudah ada
| Method | Path | Fungsi |
|---|---|---|
| POST | /auth/request-otp | Kirim kode OTP ke WA |
| POST | /auth/verify-otp | Verifikasi kode, dapat token login |
| GET | /owners/me | Lihat profil sendiri |
| PATCH | /owners/me | Update nama |
| POST | /owners/me/change-phone/request | Minta OTP ke nomor lama buat ganti nomor |
| POST | /owners/me/change-phone/confirm | Konfirmasi ganti nomor dengan OTP |
| GET | /owners/me/summary | Status bayar semua unit usaha milik sendiri |
| POST | /payments/charge | Bikin transaksi QRIS/VA baru |
| POST | /payments/manual | Submit bukti transfer manual |
| POST | /payments/webhook/midtrans | Dipanggil Midtrans saat pembayaran sukses (dengan verifikasi signature) |
| POST | /payments/:id/approve | Admin approve transfer manual |
| GET | /events/upcoming | List event terdekat |
| POST | /events/:id/register | Daftar event (gating iuran di sini) |
| POST | /events/checkin | Panitia scan QR peserta |
| POST | /events/:id/feedback | Kirim rating setelah event |
| POST | /blast | Admin kirim blast WA ke anggota |
| GET | /admin/summary | Ringkasan dashboard admin |
| GET | /admin/flagged | Daftar data tidak lengkap dari import |
| GET | /admin/export/payments | Export CSV rekap pembayaran |
| POST | /uploads-api/proof | Upload file bukti transfer (multipart), balikin URL |
| GET | /events/public/:id | Detail event publik, tanpa perlu login |

## Status frontend
Halaman yang sudah tersambung ke backend beneran:
`/`, `/login`, `/dashboard`, `/events`, `/events/[id]`, `/events/[id]/feedback`, `/e/[id]` (publik,
tanpa login), `/pay/[unitId]`, `/profile`, `/admin`, `/admin/blast`, `/checkin`.

Semua halaman yang butuh login otomatis redirect ke `/login` kalau belum ada token, lewat
`lib/useAuthGuard.js`. Halaman `/e/[id]` sengaja TIDAK pakai guard ini karena memang buat
dishare bebas ke luar (medsos, WA grup umum) - begitu orang klik "daftar", baru diarahkan ke
`/events/[id]` yang minta login.

Upload bukti transfer manual sudah pakai file beneran (foto/PDF, maks 5MB), disimpan ke folder
lokal `backend/uploads/` dan disajikan lewat `/uploads/...`. Untuk production, ganti storage-nya
ke S3/Cloudinary/GCS biar tidak hilang kalau server di-redeploy - folder lokal ini cuma cocok
untuk development.

Request OTP (login maupun ganti nomor) dibatasi maksimal 3x per 15 menit per nomor, lewat
`isRateLimited()` di `otp.service.js`.

Yang masih perlu dikerjakan
1. Halaman check-in masih input manual kode QR (bisa ditempel scanner HP), belum scan kamera native
2. Storage upload masih lokal, perlu dipindah ke cloud storage sebelum production
3. Grafik pemasukan per bulan (`revenueByMonth` dari /admin/summary) sudah ada datanya tapi belum ditampilkan di UI dashboard admin
4. Belum ada halaman buat admin approve pembayaran manual satu-satu (endpoint `/payments/:id/approve` sudah ada)
5. Belum ada halaman kelola periode iuran & event baru (create/edit) dari sisi admin - saat ini masih lewat query database langsung

## Reminder otomatis
`scripts/send-reminders.js` — jalankan terjadwal via cron (bukan proses yang nyala terus), sekali
sehari sudah cukup. Kirim 2 jenis WA: iuran mendekati jatuh tempo (H-7) dan event dalam 3 hari untuk
yang sudah terdaftar. Contoh crontab:
```
0 8 * * * cd /path/to/backend && node scripts/send-reminders.js >> logs/reminders.log 2>&1
```

## Catatan struktur data
Baca `backend/src/db/schema.sql` untuk detail tabel. Poin penting: satu **owner** (pemilik/pengurus,
yang login) bisa punya banyak **business_unit** (SPBU, yang bayar iuran masing-masing). Status lunas
selalu dihitung on-the-fly dari `payments`, tidak pernah disimpan sebagai kolom terpisah.
