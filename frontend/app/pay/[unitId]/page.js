'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch, apiUpload } from '../../../lib/api';
import { useAuthGuard } from '../../../lib/useAuthGuard';
import Header from '../../../components/Header';

const METHODS = [
  { key: 'qris', label: 'QRIS' },
  { key: 'bank_transfer', label: 'Virtual account' },
  { key: 'manual', label: 'Transfer manual' },
];

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
      setUnit(data.units.find((u) => u.businessUnitId === unitId) || null);
    });
  }, [ready, unitId]);

  async function handleCharge() {
    setError('');
    try {
      const data = await apiFetch('/payments/charge', {
        method: 'POST',
        body: JSON.stringify({ businessUnitId: unit.businessUnitId, periodId: unit.periodId, amount: unit.shortfall, paymentType: method }),
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
        body: JSON.stringify({ businessUnitId: unit.businessUnitId, periodId: unit.periodId, amount: unit.shortfall, proofUrl: uploaded.url }),
      });
      alert('Bukti transfer terkirim, menunggu verifikasi admin.');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  if (!ready) return null;
  if (!unit) return <div className="page text-muted">Memuat...</div>;

  return (
    <div className="page">
      <Header />
      <h1 className="page-title">Bayar iuran</h1>
      <p className="page-subtitle">{unit.businessName} · {unit.period}</p>

      <div className="alert alert-danger" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, marginBottom: 2 }}>Kurang bayar</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Rp{unit.shortfall.toLocaleString('id-ID')}</div>
      </div>

      <div className="row" style={{ marginBottom: 20 }}>
        {METHODS.map((m) => (
          <button key={m.key} onClick={() => { setMethod(m.key); setCharge(null); }}
            className={`btn btn-sm ${method === m.key ? 'btn-selected' : 'btn-secondary'}`} style={{ flex: 1 }}>
            {m.label}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {method !== 'manual' && !charge && (
        <button onClick={handleCharge} className="btn btn-primary btn-full">Buat kode pembayaran</button>
      )}

      {charge && (
        <div className="card text-center">
          <p className="text-secondary" style={{ fontSize: 13.5, marginBottom: 10 }}>
            Kode pembayaran dibuat. Selesaikan lewat aplikasi bank/e-wallet kamu.
          </p>
          <pre style={{ fontSize: 11, whiteSpace: 'pre-wrap', textAlign: 'left', color: 'var(--text-muted)' }}>
            {JSON.stringify(charge, null, 2)}
          </pre>
        </div>
      )}

      {method === 'manual' && (
        <div>
          <div className="field">
            <label className="label" htmlFor="proof">Foto/scan bukti transfer</label>
            <input id="proof" className="input" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ padding: 10 }} />
          </div>
          <button disabled={uploading} onClick={handleManualSubmit} className="btn btn-primary btn-full">
            {uploading ? 'Mengupload...' : 'Kirim bukti transfer'}
          </button>
        </div>
      )}
    </div>
  );
}
