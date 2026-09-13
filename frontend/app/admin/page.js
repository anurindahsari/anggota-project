'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, getToken } from '../../lib/api';
import { useAuthGuard } from '../../lib/useAuthGuard';
import PublicNav from '../../components/PublicNav';

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
    <div>
      <PublicNav />
      <div className="page-wide">
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

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
          Data & Keuangan
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
          <Link href="/admin/anggota">
            <div className="card" style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>Kelola data anggota</div>
              <div className="text-secondary" style={{ fontSize: 13 }}>Edit data pemilik & unit usaha</div>
            </div>
          </Link>
          <Link href="/admin/pembayaran">
            <div className="card" style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>Approve pembayaran</div>
              <div className="text-secondary" style={{ fontSize: 13 }}>Verifikasi bukti transfer manual</div>
            </div>
          </Link>
          <div className="card" style={{ cursor: 'pointer' }} onClick={handleExport}>
            <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>Export rekap CSV</div>
            <div className="text-secondary" style={{ fontSize: 13 }}>Unduh laporan pembayaran</div>
          </div>
        </div>

        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
          Konten
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
          <Link href="/admin/acara/tambah">
            <div className="card" style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>Tambah acara</div>
              <div className="text-secondary" style={{ fontSize: 13 }}>Buat acara baru untuk anggota</div>
            </div>
          </Link>
          <Link href="/galeri/tambah">
            <div className="card" style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>Tambah postingan Galeri</div>
              <div className="text-secondary" style={{ fontSize: 13 }}>Upload dokumentasi kegiatan</div>
            </div>
          </Link>
        </div>

        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
          Komunikasi
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          <Link href="/admin/blast">
            <div className="card" style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>Kirim blast WA</div>
              <div className="text-secondary" style={{ fontSize: 13 }}>Info massal ke anggota terpilih</div>
            </div>
          </Link>
        </div>
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
    </div>
  );
}
