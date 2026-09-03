'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getToken } from '../lib/api';

const LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/dashboard', label: 'Keanggotaan' },
  { href: '/events', label: 'Acara' },
  { href: '/panduan', label: 'Panduan' },
  { href: '/kontak', label: 'Kontak' },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getToken());
  }, [pathname]);

  return (
    <div className="public-nav">
      <Link href="/" className="public-nav-brand">
        <img src="/logo.png" alt="Hiswana Migas" className="header-mark" />
        <div>
          <div className="header-word" style={{ fontSize: 17, letterSpacing: 0.2, lineHeight: 1.15 }}>HISWANA MIGAS</div>
          <div className="header-sub" style={{ fontSize: 12.5, letterSpacing: 1.9, lineHeight: 1.3 }}>DPC SURABAYA</div>
        </div>
      </Link>

      <div className="public-nav-right">
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
    </div>
  );
}
