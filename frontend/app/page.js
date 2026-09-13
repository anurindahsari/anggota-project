'use client';

import { useEffect, useState } from 'react';
import PublicNav from '../components/PublicNav';
import { apiFetch } from '../lib/api';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    apiFetch('/gallery')
      .then((data) => setPosts((data.posts || []).filter((p) => p.cover_image_url).slice(0, 8)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (posts.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % posts.length), 4000);
    return () => clearInterval(timer);
  }, [posts]);

  const current = posts[index];

  return (
    <div>
      <PublicNav />
      <div className="hero">
        <div className="hero-text">
        <p className="hero-eyebrow">Portal anggota</p>
        <h1>Hiswana Migas<br />DPC Surabaya</h1>
        <p>
          Satu tempat untuk cek status iuran, bayar, dan ikut acara organisasi — untuk seluruh anggota SPBU, agen LPG (PSO dan non-PSO), SP(P)BE, transportir BBM/elpiji/avtur, retester, dan pelumas se-DPC Surabaya (Surabaya, Sidoarjo, Gresik, Mojokerto, Lamongan, Bojonegoro, Tuban, dan Jombang).
        </p>
        </div>
        <div className="hero-photo">
          {current ? (
            <>
              <img
                src={current.cover_image_url}
                alt={current.title}
                className="hero-photo-img"
              />
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{current.title}</div>
                {current.caption && (
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {current.caption.length > 90 ? current.caption.slice(0, 90) + '…' : current.caption}
                  </div>
                )}
              </div>
            </>
          ) : (
            <img
              src="/hero-refinery.jpg"
              alt="Kilang minyak dan gas dari udara"
              className="hero-photo-img"
            />
          )}
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
