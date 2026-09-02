'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, getToken } from '../../lib/api';
import { useAuthGuard } from '../../lib/useAuthGuard';
import Header from '../../components/Header';

export default function AdminDashboardPage() {
  const ready = useAuthGuard();
  const [summary, setSummary] = useState(null);
  const [flagged, setFlagged] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    Promise.all([apiFetch('/admin/summary'), apiFetch('/admin/flagged')])
      .then(([s, f]) => { setSummary(s); setFlagged(f); })
      .catch((err) => setError(err.message));
  }, [ready]);

  async function handleExport() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API_URL}/admin/export/payments`, { headers: { Authorization: `Bearer ${getToken()}` } });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rekap-pembayaran.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  if (!ready) return null;
  if (error) return <div className="page-wide"><div className="alert alert-danger">{error}</div></div>;
  if (!summary) return <div className="page-wide text-muted">Memuat...</div>;

  const { totals, currentPeriod } = summary;
  const lunasPct = currentPeriod ? Math.round((currentPeriod.units_lunas / currentPeriod.total_units) * 100) : 0;

  return (
    <div className="page-wide">
      <Header />
      <h1 className="page-title">Dashboard admin</h1>
      <p className="page-subtitle">Ringkasan keanggotaan dan status iuran.</p>

      <div className="stat-grid stat-grid-2">
        <div className="stat-card">
          <div className="stat-label">Total pemilik</div>
          <div className="stat-value">{totals.total_owners}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total unit usaha</div>
          <div className="stat-value">{totals.total_units}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Data owner kurang lengkap</div>
          <div className="stat-value danger">{totals.owners_flagged}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Data unit kurang lengkap</div>
          <div className="stat-value danger">{totals.units_flagged}</div>
        </div>
      </div>

      {currentPeriod && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{currentPeriod.name}</p>
          <div style={{ height: 8, background: 'var(--brand-soft)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${lunasPct}%`, background: 'var(--brand)' }} />
          </div>
          <p className="text-secondary" style={{ fontSize: 13, marginTop: 8 }}>
            {currentPeriod.units_lunas} dari {currentPeriod.total_units} unit sudah lunas ({lunasPct}%)
          </p>
        </div>
      )}

      <div className="row" style={{ marginBottom: 28 }}>
        <button onClick={handleExport} className="btn btn-secondary btn-sm">Export rekap CSV</button>
        <Link href="/admin/anggota"><button className="btn btn-secondary btn-sm">Kelola data anggota</button></Link>
        <Link href="/admin/blast"><button className="btn btn-secondary btn-sm">Kirim blast WA</button></Link>
      </div>

      {flagged && (flagged.owners.length > 0 || flagged.businessUnits.length > 0) && (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Data perlu dilengkapi</h2>
          <div className="list">
            {flagged.owners.slice(0, 8).map((o) => (
              <div className="list-item" key={o.id}>
                <div className="list-item-title">{o.full_name}</div>
                <span className="text-muted" style={{ fontSize: 12.5 }}>{o.data_issues.join(', ')}</span>
              </div>
            ))}
            {flagged.businessUnits.slice(0, 8).map((u) => (
              <div className="list-item" key={u.id}>
                <div className="list-item-title">{u.business_name}</div>
                <span className="text-muted" style={{ fontSize: 12.5 }}>{u.data_issues.join(', ')}</span>
              </div>
            ))}
          </div>
          <p className="text-muted" style={{ fontSize: 12.5, marginTop: 8 }}>
            Menampilkan sebagian. Total {flagged.owners.length} owner dan {flagged.businessUnits.length} unit usaha perlu dicek.
          </p>
        </div>
      )}
    </div>
  );
}
