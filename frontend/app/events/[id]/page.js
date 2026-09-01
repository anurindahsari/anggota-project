'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { useAuthGuard } from '../../../lib/useAuthGuard';
import Header from '../../../components/Header';

export default function EventDetailPage() {
  const ready = useAuthGuard();
  const { id } = useParams();
  const [qrImage, setQrImage] = useState(null);
  const [unpaidUnits, setUnpaidUnits] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError('');
    setUnpaidUnits(null);
    setLoading(true);
    try {
      const data = await apiFetch(`/events/${id}/register`, { method: 'POST' });
      setQrImage(data.qrImage);
    } catch (err) {
      if (err.status === 402) setUnpaidUnits(err.payload.unpaidUnits);
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="page">
      <Header />
      <h1 className="page-title">Daftar event</h1>
      <p className="page-subtitle">Semua unit usaha kamu harus lunas dulu untuk mendapat tiket.</p>

      {!qrImage && !unpaidUnits && (
        <button disabled={loading} onClick={handleRegister} className="btn btn-primary btn-full">
          {loading ? 'Memproses...' : 'Daftar sekarang'}
        </button>
      )}

      {error && <div className="alert alert-danger mt-24">{error}</div>}

      {qrImage && (
        <div className="card text-center">
          <p className="text-secondary" style={{ marginBottom: 14, fontSize: 13.5 }}>Berhasil daftar, ini tiket kamu</p>
          <img src={qrImage} alt="QR tiket event" style={{ width: 180, height: 180, borderRadius: 12 }} />
        </div>
      )}

      {unpaidUnits && (
        <div className="mt-24">
          <div className="alert alert-danger">Masih ada unit usaha yang belum lunas iuran. Lunasi dulu sebelum bisa daftar.</div>
          <div className="list">
            {unpaidUnits.map((u, i) => (
              <div className="list-item" key={i}>
                <div className="list-item-title">{u.business_name}</div>
                <span className="badge badge-danger">Kurang Rp{(u.amount_due - u.paid).toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
