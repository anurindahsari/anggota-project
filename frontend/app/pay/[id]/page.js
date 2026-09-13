'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, getToken } from '../../../lib/api';
import { useAuthGuard } from '../../../lib/useAuthGuard';
import PublicNav from '../../../components/PublicNav';

export default function PayPage() {
  const ready = useAuthGuard();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const periodId = searchParams.get('periodId');
  const amount = searchParams.get('amount');
  const businessName = searchParams.get('name') || 'unit usaha ini';

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!file) return setError('Pilih file bukti transfer dulu.');

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/proof`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload gagal.');

      await apiFetch('/payments/manual', {
        method: 'POST',
        body: JSON.stringify({
          businessUnitId: id,
          periodId,
          amount: Number(amount),
          proofUrl: uploadData.url,
        }),
      });

      setDone(true);
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
        <Link href="/dashboard" className="text-secondary" style={{ fontSize: 13.5, fontWeight: 500 }}>
          ← Kembali ke Dashboard
        </Link>

        <h1 className="page-title" style={{ marginTop: 16 }}>Bayar iuran</h1>
        <p className="page-subtitle">
          {businessName} · Rp{Number(amount || 0).toLocaleString('id-ID')}
        </p>

        {done ? (
          <div className="alert alert-success">
            Bukti transfer diterima. Status akan berubah jadi <strong>Lunas</strong> setelah diverifikasi admin.
          </div>
        ) : (
          <>
            <div className="card" style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 10 }}>
                Transfer manual ke rekening berikut, lalu upload bukti transfernya di bawah.
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Bank ___ - No. Rek ___</p>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>a.n. Hiswana Migas DPC Surabaya</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
                (Admin: lengkapi nomor rekening asli di halaman ini)
              </p>
            </div>

            <div className="card" style={{ marginBottom: 16, opacity: 0.55 }}>
              <p style={{ fontSize: 13.5, marginBottom: 8 }}>Mau bayar instan pakai QRIS / Virtual Account?</p>
              <button className="btn btn-secondary btn-sm" disabled>QRIS / VA (belum tersedia)</button>
            </div>

            <div className="card">
              <form onSubmit={handleSubmit}>
                <div className="field" style={{ marginBottom: 14 }}>
                  <label className="label" htmlFor="proof">Bukti transfer (foto/screenshot)</label>
                  <input
                    id="proof"
                    className="input"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button disabled={uploading} className="btn btn-primary btn-full" type="submit">
                  {uploading ? 'Mengunggah...' : 'Kirim bukti transfer'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
