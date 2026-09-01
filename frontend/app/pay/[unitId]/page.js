'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch, apiUpload } from '../../../lib/api';
import { useAuthGuard } from '../../../lib/useAuthGuard';

export default function PayPage() {
  const ready = useAuthGuard();
  const { unitId } = useParams();
  const [unit, setUnit] = useState(null);
  const [method, setMethod] = useState('qris');
  const [charge, setCharge] = useState(null);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    apiFetch('/owners/me/summary').then((data) => {
      const found = data.units.find((u) => u.businessUnitId === unitId);
      setUnit(found || null);
    });
  }, [ready, unitId]);

  async function handleCharge() {
    setError('');
    try {
      const data = await apiFetch('/payments/charge', {
        method: 'POST',
        body: JSON.stringify({
          businessUnitId: unit.businessUnitId,
          periodId: unit.periodId,
          amount: unit.shortfall,
          paymentType: method,
        }),
      });
      setCharge(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleManualSubmit() {
    setError('');
    if (!file) return setError('Pilih dulu foto/file bukti transfer.');
    setUploading(true);
    try {
      const uploaded = await apiUpload('/uploads-api/proof', file);
      await apiFetch('/payments/manual', {
        method: 'POST',
        body: JSON.stringify({
          businessUnitId: unit.businessUnitId,
          periodId: unit.periodId,
          amount: unit.shortfall,
          proofUrl: uploaded.url,
        }),
      });
      alert('Bukti transfer terkirim, menunggu verifikasi admin.');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  if (!ready) return null;
  if (!unit) return <p style={{ padding: 24 }}>Memuat...</p>;

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 18, fontWeight: 500 }}>Bayar iuran</h1>
      <p style={{ color: '#888', fontSize: 13 }}>{unit.businessName} &middot; {unit.period}</p>
      <div style={{ background: '#fdecea', borderRadius: 8, padding: 14, margin: '12px 0' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#c0392b' }}>Kurang bayar</p>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 500, color: '#c0392b' }}>
          Rp{unit.shortfall.toLocaleString('id-ID')}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['qris', 'bank_transfer', 'manual'].map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            style={{ flex: 1, padding: 8, fontWeight: method === m ? 500 : 400 }}
          >
            {m === 'qris' ? 'QRIS' : m === 'bank_transfer' ? 'Virtual account' : 'Transfer manual'}
          </button>
        ))}
      </div>

      {error && <p style={{ color: 'crimson', fontSize: 13 }}>{error}</p>}

      {method !== 'manual' && !charge && (
        <button onClick={handleCharge} style={{ width: '100%', padding: 10 }}>
          Buat kode pembayaran
        </button>
      )}

      {charge && (
        <div style={{ textAlign: 'center', padding: 16, background: '#f7f7f5', borderRadius: 8 }}>
          <p style={{ fontSize: 13 }}>Kode pembayaran dibuat. Selesaikan lewat aplikasi bank/e-wallet kamu.</p>
          <pre style={{ fontSize: 11, whiteSpace: 'pre-wrap', textAlign: 'left' }}>{JSON.stringify(charge, null, 2)}</pre>
        </div>
      )}

      {method === 'manual' && (
        <div>
          <label style={{ fontSize: 13, color: '#666' }}>Foto/scan bukti transfer</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ display: 'block', margin: '6px 0 12px' }}
          />
          <button disabled={uploading} onClick={handleManualSubmit} style={{ width: '100%', padding: 10 }}>
            {uploading ? 'Mengupload...' : 'Kirim bukti transfer'}
          </button>
        </div>
      )}
    </div>
  );
}
