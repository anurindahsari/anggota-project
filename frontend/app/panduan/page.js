import PublicNav from '../../components/PublicNav';

export default function PanduanPage() {
  return (
    <div>
      <PublicNav />
      <div className="content-page">
        <h1 className="page-title" style={{ marginBottom: 8, marginTop: 8 }}>Panduan & FAQ</h1>
        <p style={{ marginBottom: 24 }}>
          Kumpulan pertanyaan yang sering ditanyakan seputar pemakaian portal anggota.
        </p>

        <h2>Bagaimana cara masuk (login)?</h2>
        <p>
          Anggota masuk pakai nomor WhatsApp yang terdaftar, bukan pakai password.
          Ketik nomor kamu di halaman Masuk, sistem akan kirim kode OTP 6 digit lewat
          WhatsApp, lalu masukkan kode itu untuk masuk.
        </p>

        <h2>Bagaimana cara cek status iuran?</h2>
        <p>
          Setelah masuk, halaman Dashboard menampilkan semua unit usaha kamu beserta
          status lunas atau kurang bayar untuk periode iuran yang sedang berjalan.
        </p>

        <h2>Bagaimana cara bayar iuran?</h2>
        <p>
          Dari Dashboard, klik tombol "Bayar" pada unit usaha yang belum lunas. Kamu bisa
          pilih QRIS, virtual account, atau transfer manual (upload bukti transfer, nanti
          diverifikasi oleh admin).
        </p>

        <h2>Bagaimana cara daftar acara?</h2>
        <p>
          Buka menu Acara, pilih acara yang mau diikuti, lalu klik Daftar. Catatan penting:
          semua unit usaha kamu harus lunas iuran dulu sebelum bisa mendapatkan tiket QR
          untuk acara tersebut.
        </p>

        <h2>Bagaimana cara ganti nomor WhatsApp?</h2>
        <p>
          Buka halaman Profil, klik "Ganti nomor". Sistem akan kirim kode verifikasi ke
          nomor lama kamu dulu sebelum nomor baru bisa dipakai — ini untuk menjaga
          keamanan akun kamu.
        </p>

        <h2>Nomor WhatsApp saya belum bisa login, kenapa?</h2>
        <p>
          Kemungkinan nomor kamu belum terdaftar sebagai anggota di sistem. Hubungi
          pengurus DPC Surabaya untuk memastikan data kamu sudah terdaftar dengan benar.
        </p>
      </div>
    </div>
  );
}
