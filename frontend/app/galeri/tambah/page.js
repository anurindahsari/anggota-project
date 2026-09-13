'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getToken } from '../../../lib/api';
import { useAuthGuard } from '../../../lib/useAuthGuard';
import PublicNav from '../../../components/PublicNav';

export default function TambahGaleriPage() {
  const ready = useAuthGuard();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (files.length === 0) return setError('Pilih minimal 1 foto.');
    setUploading(true);
    try {
      const imageUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads-api/proof`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload foto gagal.');
        imageUrls.push(data.url);
      }

      await apiFetch('/gallery', {
        method: 'POST',
        body: JSON.stringify({ title, caption, eventDate: eventDate || null, imageUrls }),
      });

      router.push('/galeri');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  if (!ready) return null;

  return (
    <div>
      <PublicNav />
      <div className="page">
        <h1 className="page-title">Tambah postingan Galeri</h1>
        <p className="page-subtitle">Khusus admin. Kalau bukan admin, penyimpanan akan ditolak.</p>

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="title">Judul</label>
            <input id="title" className="input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="eventDate">Tanggal kegiatan</label>
            <input id="eventDate" className="input" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="caption">Caption</label>
            <textarea id="caption" className="input" rows={4} value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="files">Foto (bisa pilih beberapa sekaligus)</label>
            <input id="files" className="input" type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button disabled={uploading} className="btn btn-primary btn-full" type="submit">
            {uploading ? 'Mengunggah...' : 'Simpan postingan'}
          </button>
        </form>
      </div>
    </div>
  );
}
