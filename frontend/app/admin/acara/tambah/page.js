'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';
import { useAuthGuard } from '../../../../lib/useAuthGuard';
import PublicNav from '../../../../components/PublicNav';

export default function TambahAcaraPage() {
  const ready = useAuthGuard();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [requiresPaidMembership, setRequiresPaidMembership] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title || !eventDate) return setError('Judul dan tanggal wajib diisi.');
    setLoading(true);
    try {
      await apiFetch('/events', {
        method: 'POST',
        body: JSON.stringify({ title, description, eventDate, location, requiresPaidMembership, isPublic }),
      });
      router.push('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <div>
      <PublicNav />
      <div className="page">
        <h1 className="page-title">Tambah acara</h1>
        <p className="page-subtitle">Khusus admin.</p>

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="title">Judul acara</label>
            <input id="title" className="input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="eventDate">Tanggal & jam</label>
            <input id="eventDate" className="input" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="location">Lokasi</label>
            <input id="location" className="input" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="description">Deskripsi</label>
            <textarea id="description" className="input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input type="checkbox" checked={requiresPaidMembership} onChange={(e) => setRequiresPaidMembership(e.target.checked)} />
              Wajib lunas iuran dulu untuk daftar
            </label>
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              Bisa dibagikan ke publik (link promosi tanpa login)
            </label>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button disabled={loading} className="btn btn-primary btn-full" type="submit">
            {loading ? 'Menyimpan...' : 'Simpan acara'}
          </button>
        </form>
      </div>
    </div>
  );
}
