'use client';

import { useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuthGuard } from '../../lib/useAuthGuard';
import Header from '../../components/Header';

export default function CheckinPage() {
  const ready = useAuthGuard();
  const [qrCode, setQrCode] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCheckin(e) {
    e.preventDefault();
    setError(''); setResult('');
    if (!qrCode.trim()) return setError('Kode QR wajib diisi.');
    setLoading(true);
    try {
      const data = await apiFetch('/events/checkin', { method: 'POST', body: JSON.stringify({ qrCode }) });
      setResult(data.message);
      setQrCode('');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (!ready) return null;

  return (
    <div className="page text-center" style={{ paddingTop: 48 }}>
      <div style={{ display: 'inline-block' }}><Header /></div>
      <h1 className="page-title">Check-in peserta</h1>
      <p className="page-subtitle">Scan atau ketik kode QR tiket anggota.</p>

      <form onSubmit={handleCheckin}>
        <input autoFocus className="input" type="text" placeholder="Scan atau ketik kode QR"
          value={qrCode} onChange={(e) => setQrCode(e.target.value)} style={{ fontSize: 16, marginBottom: 12 }} />
        <button disabled={loading} type="submit" className="btn btn-primary btn-full">
          {loading ? 'Memproses...' : 'Check-in'}
        </button>
      </form>

      {result && <div className="alert alert-success mt-24">{result}</div>}
      {error && <div className="alert alert-danger mt-24">{error}</div>}
    </div>
  );
}
