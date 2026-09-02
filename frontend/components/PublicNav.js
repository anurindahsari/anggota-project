'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/dashboard', label: 'Keanggotaan' },
  { href: '/events', label: 'Acara' },
  { href: '/panduan', label: 'Panduan' },
];

export default function PublicNav() {
  const pathname = usePathname();

  return (
    <div className="public-nav">
      <Link href="/" className="public-nav-brand">
        <img src="/logo.png" alt="Hiswana Migas" className="header-mark" />
        <div>
          <div className="header-word" style={{ fontSize: 17, letterSpacing: 0.2, lineHeight: 1.15 }}>HISWANA MIGAS</div>
          <div className="header-sub" style={{ fontSize: 10, letterSpacing: 2.1, lineHeight: 1.3 }}>DPC SURABAYA</div>
        </div>
      </Link>

      <nav className="public-nav-links">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`public-nav-link ${pathname === link.href ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Link href="/login">
        <button className="btn btn-primary btn-sm">Masuk</button>
      </Link>
    </div>
  );
}
