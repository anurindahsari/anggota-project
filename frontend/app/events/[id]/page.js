'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { useAuthGuard } from '../../../lib/useAuthGuard';

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
      if (err.status === 402) {
        // Ini inti gating-nya: backend kasih tau persis unit mana yang belum lunas
        setUnpaidUnits(err.payload.unpaidUnits);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 18, fontWeight: 500 }}>Daftar event</h1>

      {!qrImage && !unpaidUnits && (
        <button disabled={loading} onClick={handleRegister} style={{ width: '100%', padding: 10, marginTop: 12 }}>
          {loading ? 'Memproses...' : 'Daftar sekarang'}
        </button>
      )}

      {error && <p style={{ color: 'crimson', fontSize: 13 }}>{error}</p>}

      {qrImage && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <p style={{ fontSize: 13, color: '#888' }}>Berhasil daftar. Ini tiket kamu:</p>
          <img src={qrImage} alt="QR tiket event" style={{ width: 180, height: 180 }} />
        </div>
      )}

      {unpaidUnits && (
        <div style={{ marginTop: 16 }}>
          <div style={{ background: '#fdecea', borderRadius: 8, padding: 14, marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#c0392b' }}>
              Masih ada unit usaha yang belum lunas iuran. Lunasi dulu sebelum bisa daftar:
            </p>
          </div>
          {unpaidUnits.map((u, i) => (
            <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 14 }}>{u.business_name}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#888' }}>
                Kurang Rp{(u.amount_due - u.paid).toLocaleString('id-ID')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
