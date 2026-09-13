'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import PublicNav from '../../../components/PublicNav';

export default function GaleriDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    apiFetch(`/gallery/${id}`).then((data) => setPost(data.post)).catch((err) => setError(err.message));
  }, [id]);

  if (error) return (
    <div>
      <PublicNav />
      <div className="page"><div className="alert alert-danger">{error}</div></div>
    </div>
  );
  if (!post) return (
    <div>
      <PublicNav />
      <div className="page text-muted">Memuat...</div>
    </div>
  );

  const images = post.images || [];

  return (
    <div>
      <PublicNav />
      <div className="page">
        <Link href="/galeri" className="text-secondary" style={{ fontSize: 13.5, fontWeight: 500 }}>
          ← Kembali ke Galeri
        </Link>

        <h1 className="page-title" style={{ marginTop: 16 }}>{post.title}</h1>
        {post.event_date && (
          <p className="page-subtitle">
            {new Date(post.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}

        {images.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: 'var(--surface-1)' }}>
              <img src={images[index]} alt={`${post.title} - ${index + 1}`} style={{ width: '100%', maxHeight: 480, objectFit: 'contain', display: 'block' }} />
            </div>
            {images.length > 1 && (
              <div className="row-between" style={{ marginTop: 10 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}>← Sebelumnya</button>
                <span className="text-muted" style={{ fontSize: 12.5 }}>{index + 1} / {images.length}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setIndex((i) => (i + 1) % images.length)}>Selanjutnya →</button>
              </div>
            )}
          </div>
        )}

        {post.caption && <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{post.caption}</p>}
      </div>
    </div>
  );
}
