'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import { useAuthGuard } from '../../lib/useAuthGuard';

export default function DashboardPage() {
  const ready = useAuthGuard();
  const [units, setUnits] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    apiFetch('/owners/me/summary')
      .then((data) => setUnits(data.units))
      .catch((err) => setError(err.message));
  }, [ready]);

  if (!ready) return null;
  if (error) return <p style={{ padding: 24, color: 'crimson' }}>{error}</p>;
  if (!units) return <p style={{ padding: 24 }}>Memuat...</p>;

  const totalLunas = units.filter((u) => u.status === 'lunas').length;
  const totalKurang = units.length - totalLunas;

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total unit" value={units.length} />
        <StatCard label="Lunas" value={totalLunas} />
        <StatCard label="Kurang bayar" value={totalKurang} />
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Status per unit</h2>
      <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
        {units.map((u) => (
          <div
            key={u.businessUnitId}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              borderBottom: '1px solid #eee',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 14 }}>{u.businessName}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#888' }}>
                {u.unitNumber || '-'} &middot; {u.period}
              </p>
            </div>
            {u.status === 'lunas' ? (
              <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: '#e6f4ea', color: '#1e7e34' }}>
                Lunas
              </span>
            ) : (
              <Link href={`/pay/${u.businessUnitId}`}>
                <button style={{ fontSize: 12, padding: '6px 12px' }}>
                  Bayar Rp{u.shortfall.toLocaleString('id-ID')}
                </button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ flex: 1, background: '#f7f7f5', borderRadius: 8, padding: 16 }}>
      <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{value}</p>
    </div>
  );
}
