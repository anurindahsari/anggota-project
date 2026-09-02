import Link from 'next/link';

export default function Header({ subtitle }) {
  return (
    <Link href="/" className="header" style={{ textDecoration: 'none', color: 'inherit' }}>
      <img src="/logo.png" alt="Hiswana Migas" className="header-mark" />
      <div>
        <div className="header-word" style={{ fontSize: 17, letterSpacing: 0.2, lineHeight: 1.15 }}>HISWANA MIGAS</div>
        <div className="header-sub" style={{ fontSize: 12.5, letterSpacing: 'normal', lineHeight: 1.3, width: '100%', textAlign: 'justify', textAlignLast: 'justify' }}>DPC SURABAYA</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</div>}
      </div>
    </Link>
  );
}
