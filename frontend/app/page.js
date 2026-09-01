import Link from 'next/link';
import PublicNav from '../components/PublicNav';

export default function HomePage() {
  return (
    <div>
      <PublicNav />

      <div className="hero">
        <div className="hero-text">
          <h1>Portal anggota Hiswana Migas DPC Surabaya</h1>
          <p>
            Satu tempat untuk cek status iuran, bayar, dan ikut acara organisasi —
            untuk seluruh anggota SPBU, agen LPG, dan transportir BBM di Surabaya.
          </p>
          <Link href="/login">
            <button className="btn btn-primary">Masuk sebagai anggota</button>
          </Link>
        </div>
        <div className="hero-illustration">
          <svg viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="Ilustrasi pompa bensin">
            <circle cx="100" cy="100" r="96" fill="var(--brand-soft)" />
            <rect x="62" y="52" width="58" height="94" rx="12" fill="var(--brand)" />
            <rect x="72" y="66" width="38" height="22" rx="4" fill="var(--surface)" />
            <rect x="72" y="96" width="38" height="7" rx="3" fill="var(--surface)" opacity="0.65" />
            <rect x="72" y="110" width="38" height="7" rx="3" fill="var(--surface)" opacity="0.65" />
            <path d="M120 84 Q148 84 148 112 L148 128" stroke="var(--brand)" strokeWidth="7" fill="none" strokeLinecap="round" />
            <circle cx="148" cy="133" r="7" fill="var(--brand)" />
            <rect x="56" y="146" width="72" height="9" rx="4.5" fill="var(--brand)" />
          </svg>
        </div>
      </div>

      <div className="feature-section">
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
