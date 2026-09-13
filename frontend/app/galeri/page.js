'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import PublicNav from '../../components/PublicNav';

export default function GaleriPage() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    apiFetch('/gallery').then((data) => setPosts(data.posts));
  }, []);

  return (
    <div>
      <PublicNav />
      <div className="page-wide" style={{ paddingTop: 24 }}>
        <h1 className="page-title">Galeri</h1>
        <p className="page-subtitle">Dokumentasi kegiatan Hiswana Migas DPC Surabaya.</p>

        {!posts && <div className="text-muted">Memuat...</div>}
        {posts && posts.length === 0 && <div className="text-muted">Belum ada dokumentasi.</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {posts && posts.map((p) => (
            <Link href={`/galeri/${p.id}`} key={p.id}>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {p.cover_image_url ? (
                  <img src={p.cover_image_url} alt={p.title} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: 160, background: 'var(--surface-1)' }} />
                )}
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>{p.title}</div>
                  {p.event_date && (
                    <div className="text-secondary" style={{ fontSize: 12.5 }}>
                      {new Date(p.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
