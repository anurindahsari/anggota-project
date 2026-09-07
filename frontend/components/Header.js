import Link from 'next/link';

export default function Header({ subtitle }) {
  return (
    <div className="public-nav-bar header-breakout">
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.png" alt="Hiswana Migas" className="header-mark" />
        <div>
          <div className="header-word" style={{ fontSize: 17, letterSpacing: 0.2, lineHeight: 1.15 }}>HISWANA MIGAS</div>
          <div className="header-sub" style={{ fontSize: 12.5, letterSpacing: 1.9, lineHeight: 1.3 }}>DPC SURABAYA</div>
          {subtitle && <div style={{ fontSize: 12, color: '#DCE5FD', marginTop: 4 }}>{subtitle}</div>}
        </div>
      </Link>
    </div>
  );
}
