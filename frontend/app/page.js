import Link from 'next/link';
import PublicNav from '../components/PublicNav';

export default function HomePage() {
  return (
    <div>
      <PublicNav />

      <div className="hero">
        <h1>Portal anggota Hiswana Migas DPC Surabaya</h1>
        <p>
          Satu tempat untuk cek status iuran, bayar, dan ikut acara organisasi —
          untuk seluruh anggota SPBU, agen LPG, dan transportir BBM di Surabaya.
        </p>
        <Link href="/login">
          <button className="btn btn-primary">Masuk sebagai anggota</button>
        </Link>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">1</div>
          <div className="feature-title">Cek status iuran</div>
          <div className="feature-desc">Lihat unit usaha mana yang sudah lunas dan mana yang masih kurang.</div>
        </div>
        <div className="feature-card">
          <div className="feature-icon">2</div>
          <div className="feature-title">Bayar langsung</div>
          <div className="feature-desc">QRIS, virtual account, atau transfer manual dengan upload bukti.</div>
        </div>
        <div className="feature-card">
          <div className="feature-icon">3</div>
          <div className="feature-title">Ikut acara</div>
          <div className="feature-desc">Daftar acara organisasi dan dapat tiket QR begitu iuran lunas.</div>
        </div>
      </div>
    </div>
  );
}
