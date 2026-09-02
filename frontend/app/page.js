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
          untuk seluruh anggota SPBU, agen LPG, transportir BBM, dan pelumas di Surabaya.
        </p>
        <Link href="/login">
          <button className="btn btn-primary">Masuk sebagai anggota</button>
        </Link>
      </div>

      <div className="hero-banner">
        <div className="hero-banner-inner" style={{ padding: 0, overflow: 'hidden' }}>
          <img
            src="/hero-refinery.jpg"
            alt="Kilang minyak dan gas dari udara"
            style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'right', marginTop: 8, marginBottom: 0 }}>
          Foto oleh{' '}
          <a
            href="https://www.magnific.com/free-photo/aerial-view-gas-oil-refinery-oil-industry_23404841.htm"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}
          >
            tawatchai07
          </a>{' '}
          di Freepik
        </p>
      </div>

      <div className="feature-section" style={{ marginTop: 40 }}>
        <div className="feature-grid" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 24 }}>
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

      <div className="site-footer">
        Hiswana Migas DPC Surabaya
      </div>
    </div>
  );
}
