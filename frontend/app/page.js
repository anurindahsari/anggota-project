import Link from 'next/link';
import PublicNav from '../components/PublicNav';

export default function HomePage() {
  return (
    <div>
      <PublicNav />

      <div className="hero">
        <div className="hero-text">
        <p className="hero-eyebrow">Portal anggota</p>
        <h1>Hiswana Migas DPC Surabaya</h1>
        <p>
          Satu tempat untuk cek status iuran, bayar, dan ikut acara organisasi — untuk seluruh anggota SPBU, agen LPG (PSO dan non-PSO), SP(P)BE, transportir BBM/elpiji/avtur, retester, dan pelumas se-DPC Surabaya (Surabaya, Sidoarjo, Gresik, Mojokerto, Lamongan, Bojonegoro, Tuban, dan Jombang).
        </p>
        </div>
        <div className="hero-photo">
          <img
            src="/hero-refinery.jpg"
            alt="Kilang minyak dan gas dari udara"
            className="hero-photo-img"
          />
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 6, marginBottom: 0 }}>
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
      </div>

      <div className="feature-section" style={{ marginTop: 20 }}>
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

      <div className="site-footer">
        Hiswana Migas DPC Surabaya
      </div>
    </div>
  );
}
