'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, clearToken } from '../../lib/api';
import { useAuthGuard } from '../../lib/useAuthGuard';
import PublicNav from '../../components/PublicNav';

export default function DashboardPage() {
  const ready = useAuthGuard();
  const router = useRouter();
  const [units, setUnits] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    apiFetch('/owners/me/summary')
      .then((data) => setUnits(data.units))
      .catch((err) => setError(err.message));
  }, [ready]);

  function handleLogout() {
    clearToken();
    router.push('/');
  }

  if (!ready) return null;
  if (error) return (
    <div>
      <PublicNav />
      <div className="page"><div className="alert alert-danger">{error}</div></div>
    </div>
  );
  if (!units) return (
    <div>
      <PublicNav />
      <div className="page text-muted">Memuat...</div>
    </div>
  );

  const totalLunas = units.filter((u) => u.status === 'lunas').length;
  const totalKurang = units.length - totalLunas;

  return (
    <div>
      <PublicNav />
      <div className="page-wide">
        <div className="row-between" style={{ marginBottom: 16 }}>
          <Link href="/events" className="text-secondary" style={{ fontSize: 13.5, fontWeight: 500 }}>
            Event terdekat →
          </Link>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">Keluar</button>
        </div>

        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Status iuran seluruh badan usaha kamu. Klik salah satu untuk lihat detail & ubah data.</p>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Jumlah badan usaha</div>
            <div className="stat-value">{units.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Lunas</div>
            <div className="stat-value success">{totalLunas}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Kurang bayar</div>
            <div className="stat-value danger">{totalKurang}</div>
          </div>
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Status per badan usaha</h2>
        <div className="list">
          {units.map((u) => (
            <div className="list-item" key={u.businessUnitId}>
              <Link href={`/unit/${u.businessUnitId}`} style={{ flex: 1, minWidth: 0 }}>
                <div className="list-item-title">{u.businessName}</div>
                <div className="list-item-meta">{u.unitNumber || '-'} · {u.period}</div>
              </Link>
              {u.status === 'lunas' ? (
                <span className="badge badge-success">Lunas</span>
              ) : (
                <Link href={`/pay/${u.businessUnitId}?periodId=${u.periodId}&amount=${u.shortfall}&name=${encodeURIComponent(u.businessName)}`}>
                  <button className="btn btn-primary btn-sm">Bayar Rp{u.shortfall.toLocaleString('id-ID')}</button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
