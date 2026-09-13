'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { useAuthGuard } from '../../../lib/useAuthGuard';
import PublicNav from '../../../components/PublicNav';

export default function ApprovePembayaranPage() {
  const ready = useAuthGuard();
  const [payments, setPayments] = useState(null);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  async function load() {
    try {
      const data = await apiFetch('/payments/pending');
      setPayments(data.payments);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  async function handleApprove(id) {
    setApprovingId(id);
    try {
      await apiFetch(`/payments/${id}/approve`, { method: 'POST' });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setApprovingId(null);
    }
  }

  if (!ready) return null;

  return (
    <div>
      <PublicNav />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 20px 0' }}>
        <Link href="/admin" className="text-secondary" style={{ fontSize: 13.5, fontWeight: 500 }}>
          ← Kembali ke Dashboard Admin
        </Link>
      </div>
      <div className="page-wide">
        <h1 className="page-title">Approve pembayaran</h1>
        <p className="page-subtitle">Transfer manual yang menunggu verifikasi.</p>

        {error && <div className="alert alert-danger mt-24">{error}</div>}
        {!payments && <div className="text-muted">Memuat...</div>}
        {payments && payments.length === 0 && <div className="text-muted">Tidak ada pembayaran yang menunggu verifikasi.</div>}

        <div className="stack">
          {payments && payments.map((p) => (
            <div className="card" key={p.id}>
              <div className="row-between" style={{ marginBottom: 12, alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{p.business_name}</div>
                  <div className="text-secondary" style={{ fontSize: 13 }}>{p.owner_name} · {p.business_type}</div>
                  <div className="text-secondary" style={{ fontSize: 13, marginTop: 4 }}>
                    Rp{Number(p.amount).toLocaleString('id-ID')} · {p.method}
                  </div>
                </div>
                <button
                  disabled={approvingId === p.id}
                  onClick={() => handleApprove(p.id)}
                  className="btn btn-primary btn-sm"
                >
                  {approvingId === p.id ? 'Memproses...' : 'Approve'}
                </button>
              </div>
              {p.proof_url && (
                <a href={p.proof_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={p.proof_url}
                    alt="Bukti transfer"
                    style={{ maxWidth: 280, borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
