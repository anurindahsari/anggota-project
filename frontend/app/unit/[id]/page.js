'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { useAuthGuard } from '../../../lib/useAuthGuard';
import PublicNav from '../../../components/PublicNav';

export default function UnitDetailPage() {
  const ready = useAuthGuard();
  const { id } = useParams();
  const [unit, setUnit] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [activeWhatsapp, setActiveWhatsapp] = useState('');

  useEffect(() => {
    if (!ready) return;
    apiFetch(`/owners/me/units/${id}`)
      .then((data) => {
        setUnit(data.unit);
        setAddress(data.unit.address || '');
        setCity(data.unit.city || '');
        setContactEmail(data.unit.contact_email || '');
        setActiveWhatsapp(data.unit.active_whatsapp || '');
      })
      .catch((err) => setError(err.message));
  }, [ready, id]);

  async function handleSave(e) {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await apiFetch(`/owners/me/units/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ address, city, contactEmail, activeWhatsapp }),
      });
      setMessage('Data tersimpan.');
      setEditing(false);
      setUnit({ ...unit, address, city, contact_email: contactEmail, active_whatsapp: activeWhatsapp });
    } catch (err) {
      setError(err.message);
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

        {error && <div className="alert alert-danger mt-24">{error}</div>}
        {!unit && !error && <div className="text-muted mt-24">Memuat...</div>}

        {unit && (
          <>
            <h1 className="page-title" style={{ marginTop: 16 }}>{unit.business_name}</h1>
            <p className="page-subtitle">{unit.business_type}{unit.unit_number ? ` · ${unit.unit_number}` : ''}</p>

            <div className="card" style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, marginBottom: 10 }}>
                <strong>Total dibayar:</strong> Rp{Number(unit.total_dibayar).toLocaleString('id-ID')}
              </p>
              <p style={{ fontSize: 14, marginBottom: 0 }}>
                <strong>Status:</strong> {unit.status}
              </p>
            </div>

            <div className="card">
              {!editing ? (
                <>
                  <p style={{ fontSize: 14, marginBottom: 8 }}><strong>Alamat:</strong> {unit.address || '(belum diisi)'}</p>
                  <p style={{ fontSize: 14, marginBottom: 8 }}><strong>Kota/Kabupaten:</strong> {unit.city || '(belum diisi)'}</p>
                  <p style={{ fontSize: 14, marginBottom: 8 }}><strong>Email:</strong> {unit.contact_email || '(belum diisi)'}</p>
                  <p style={{ fontSize: 14, marginBottom: 14 }}><strong>No WhatsApp Aktif:</strong> {unit.active_whatsapp || '(belum diisi)'}</p>
                  <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm">Ubah data</button>
                </>
              ) : (
                <form onSubmit={handleSave}>
                  <div className="field" style={{ marginBottom: 10 }}>
                    <label className="label" htmlFor="address">Alamat</label>
                    <input id="address" className="input" type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div className="field" style={{ marginBottom: 10 }}>
                    <label className="label" htmlFor="city">Kota/Kabupaten</label>
                    <input id="city" className="input" type="text" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="field" style={{ marginBottom: 10 }}>
                    <label className="label" htmlFor="contactEmail">Email</label>
                    <input id="contactEmail" className="input" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                  </div>
                  <div className="field" style={{ marginBottom: 14 }}>
                    <label className="label" htmlFor="activeWhatsapp">No WhatsApp Aktif</label>
                    <input id="activeWhatsapp" className="input" type="text" placeholder="0812xxxxxxx" value={activeWhatsapp} onChange={(e) => setActiveWhatsapp(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ marginRight: 8 }}>Simpan</button>
                  <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary btn-sm">Batal</button>
                </form>
              )}
            </div>

            {message && <div className="alert alert-success mt-24">{message}</div>}
          </>
        )}
      </div>
    </div>
  );
}
