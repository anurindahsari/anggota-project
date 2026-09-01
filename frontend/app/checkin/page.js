'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuthGuard } from '../../lib/useAuthGuard';

// Catatan: ini pakai input manual kode QR, bukan scan kamera langsung.
// Paling praktis dipasangkan dengan aplikasi scanner QR bawaan HP panitia,
// yang otomatis ngisi field ini (banyak scanner HP bisa "kirim ke aplikasi lain").
// Kalau mau scan kamera native di browser, bisa tambah library seperti html5-qrcode.
export default function CheckinPage() {
  const ready = useAuthGuard();
  const [qrCode, setQrCode] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCheckin(e) {
    e.preventDefault();
    setError('');
    setResult('');
    if (!qrCode.trim()) return setError('Kode QR wajib diisi.');

    setLoading(true);
    try {
      const data = await apiFetch('/events/checkin', {
        method: 'POST',
        body: JSON.stringify({ qrCode }),
      });
      setResult(data.message);
      setQrCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: '0 1rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: 18, fontWeight: 500 }}>Check-in peserta</h1>

      <form onSubmit={handleCheckin} style={{ marginTop: 16 }}>
        <input
          autoFocus
          type="text"
          placeholder="Scan atau ketik kode QR"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          style={{ width: '100%', padding: 10, boxSizing: 'border-box', fontSize: 16 }}
        />
        <button disabled={loading} type="submit" style={{ width: '100%', padding: 10, marginTop: 10 }}>
          {loading ? 'Memproses...' : 'Check-in'}
        </button>
      </form>

      {result && (
        <p style={{ marginTop: 16, padding: 12, background: '#e6f4ea', color: '#1e7e34', borderRadius: 8 }}>
          {result}
        </p>
      )}
      {error && (
        <p style={{ marginTop: 16, padding: 12, background: '#fdecea', color: '#c0392b', borderRadius: 8 }}>
          {error}
        </p>
      )}
    </div>
  );
}
