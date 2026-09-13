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
            <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden' }}>
              <img
                src={current.cover_image_url}
                alt={current.title}
                className="hero-photo-img"
              />
              {posts.length > 1 && (
                <>
                  <button
                    onClick={() => setIndex((i) => (i - 1 + posts.length) % posts.length)}
                    aria-label="Sebelumnya"
                    style={{
                      position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                      width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: 'rgba(0, 0, 0, 0.35)', color: '#ffffff', fontSize: 15,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >‹</button>
                  <button
                    onClick={() => setIndex((i) => (i + 1) % posts.length)}
                    aria-label="Selanjutnya"
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: 'rgba(0, 0, 0, 0.35)', color: '#ffffff', fontSize: 15,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >›</button>
                </>
              )}
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 22,
                background: 'rgba(255, 255, 255, 0.82)',
                padding: '6px 14px',
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 1 }}>{current.title}</div>
                {current.caption && (
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {current.caption.length > 70 ? current.caption.slice(0, 70) + '…' : current.caption}
                  </div>
                )}
              </div>
            </div>
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
