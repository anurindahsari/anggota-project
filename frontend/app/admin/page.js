'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, getToken } from '../../lib/api';
import { useAuthGuard } from '../../lib/useAuthGuard';

export default function AdminDashboardPage() {
  const ready = useAuthGuard();
  const [summary, setSummary] = useState(null);
  const [flagged, setFlagged] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    Promise.all([apiFetch('/admin/summary'), apiFetch('/admin/flagged')])
      .then(([s, f]) => {
        setSummary(s);
        setFlagged(f);
      })
      .catch((err) => setError(err.message));
  }, [ready]);

  async function handleExport() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API_URL}/admin/export/payments`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rekap-pembayaran.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!ready) return null;
  if (error) return <p style={{ padding: 24, color: 'crimson' }}>{error}</p>;
  if (!summary) return <p style={{ padding: 24 }}>Memuat...</p>;

  const { totals, currentPeriod } = summary;
  const lunasPct = currentPeriod ? Math.round((currentPeriod.units_lunas / currentPeriod.total_units) * 100) : 0;

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 16 }}>Dashboard admin</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total pemilik" value={totals.total_owners} />
        <StatCard label="Total unit usaha" value={totals.total_units} />
        <StatCard label="Data owner kurang lengkap" value={totals.owners_flagged} />
        <StatCard label="Data unit kurang lengkap" value={totals.units_flagged} />
      </div>

      {currentPeriod && (
        <div style={{ background: '#f7f7f5', borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 500 }}>
            Status "{currentPeriod.name}"
          </p>
          <div style={{ height: 8, background: '#e0e0dc', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${lunasPct}%`, background: '#355FF7' }} />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#888' }}>
            {currentPeriod.units_lunas} dari {currentPeriod.total_units} unit sudah lunas ({lunasPct}%)
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={handleExport} style={{ padding: '8px 16px' }}>Export rekap pembayaran (CSV)</button>
        <Link href="/admin/blast"><button style={{ padding: '8px 16px' }}>Kirim blast WA</button></Link>
      </div>

      {flagged && (flagged.owners.length > 0 || flagged.businessUnits.length > 0) && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Data perlu dilengkapi</h2>
          <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
            {flagged.owners.slice(0, 10).map((o) => (
              <div key={o.id} style={{ padding: '10px 14px', borderBottom: '1px solid #eee', fontSize: 13 }}>
                <strong>{o.full_name}</strong> &middot; {o.data_issues.join(', ')}
              </div>
            ))}
            {flagged.businessUnits.slice(0, 10).map((u) => (
              <div key={u.id} style={{ padding: '10px 14px', borderBottom: '1px solid #eee', fontSize: 13 }}>
                {u.business_name} &middot; {u.data_issues.join(', ')}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
            Menampilkan sebagian. Total {flagged.owners.length} owner dan {flagged.businessUnits.length} unit
            usaha yang perlu dicek.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: '#f7f7f5', borderRadius: 8, padding: 16 }}>
      <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{value}</p>
    </div>
  );
}
