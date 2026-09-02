'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { useAuthGuard } from '../../../lib/useAuthGuard';
import Header from '../../../components/Header';

function OwnerEditForm({ owner, onSaved, onCancel }) {
  const [fullName, setFullName] = useState(owner.full_name);
  const [phone, setPhone] = useState(owner.phone || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/admin/owners/${owner.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ fullName, phone }),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div className="field" style={{ marginBottom: 10 }}>
        <label className="label">Nama pemilik</label>
        <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="field" style={{ marginBottom: 10 }}>
        <label className="label">Nomor WhatsApp</label>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        <button disabled={saving} onClick={handleSave} className="btn btn-primary btn-sm">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button onClick={onCancel} className="btn btn-secondary btn-sm">Batal</button>
      </div>
    </div>
  );
}

function UnitEditForm({ unit, onSaved, onCancel }) {
  const [form, setForm] = useState({
    businessName: unit.business_name || '',
    businessType: unit.business_type || '',
    unitNumber: unit.unit_number || '',
    address: unit.address || '',
    city: unit.city || '',
    contactEmail: unit.contact_email || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/admin/business-units/${unit.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div className="field" style={{ marginBottom: 10 }}>
        <label className="label">Nama usaha</label>
        <input className="input" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} />
      </div>
      <div className="field" style={{ marginBottom: 10 }}>
        <label className="label">Bidang usaha</label>
        <input className="input" value={form.businessType} onChange={(e) => update('businessType', e.target.value)} />
      </div>
      <div className="field" style={{ marginBottom: 10 }}>
        <label className="label">Nomor unit</label>
        <input className="input" value={form.unitNumber} onChange={(e) => update('unitNumber', e.target.value)} />
      </div>
      <div className="field" style={{ marginBottom: 10 }}>
        <label className="label">Alamat</label>
        <input className="input" value={form.address} onChange={(e) => update('address', e.target.value)} />
      </div>
      <div className="field" style={{ marginBottom: 10 }}>
        <label className="label">Kota</label>
        <input className="input" value={form.city} onChange={(e) => update('city', e.target.value)} />
      </div>
      <div className="field" style={{ marginBottom: 10 }}>
        <label className="label">Email</label>
        <input className="input" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        <button disabled={saving} onClick={handleSave} className="btn btn-primary btn-sm">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button onClick={onCancel} className="btn btn-secondary btn-sm">Batal</button>
      </div>
    </div>
  );
}

export default function KelolaAnggotaPage() {
  const ready = useAuthGuard();
  const [search, setSearch] = useState('');
  const [owners, setOwners] = useState(null);
  const [error, setError] = useState('');
  const [editingOwner, setEditingOwner] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);

  async function load() {
    try {
      const data = await apiFetch(`/admin/owners?search=${encodeURIComponent(search)}`);
      setOwners(data.owners);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (!ready) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    load();
  }

  if (!ready) return null;

  return (
    <div className="page-wide">
      <Header />
      <h1 className="page-title">Kelola data anggota</h1>
      <p className="page-subtitle">Edit data pemilik dan unit usaha langsung dari sini — tidak perlu import ulang Excel.</p>

      <form onSubmit={handleSearchSubmit} className="row" style={{ marginBottom: 24 }}>
        <input
          className="input"
          placeholder="Cari nama atau nomor HP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary btn-sm">Cari</button>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}
      {!owners && <div className="text-muted">Memuat...</div>}

      <div className="stack">
        {owners && owners.map((owner) => (
          <div className="card" key={owner.id}>
            {editingOwner === owner.id ? (
              <OwnerEditForm
                owner={owner}
                onCancel={() => setEditingOwner(null)}
                onSaved={() => { setEditingOwner(null); load(); }}
              />
            ) : (
              <div className="row-between" style={{ marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{owner.full_name}</div>
                  <div className="text-secondary" style={{ fontSize: 13 }}>{owner.phone || '(belum ada nomor)'}</div>
                </div>
                <button onClick={() => setEditingOwner(owner.id)} className="btn btn-secondary btn-sm">Edit</button>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              {owner.business_units.map((unit) => (
                <div key={unit.id} style={{ marginBottom: 8 }}>
                  {editingUnit === unit.id ? (
                    <UnitEditForm
                      unit={unit}
                      onCancel={() => setEditingUnit(null)}
                      onSaved={() => { setEditingUnit(null); load(); }}
                    />
                  ) : (
                    <div className="row-between">
                      <div>
                        <div style={{ fontSize: 13.5 }}>{unit.business_name}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>{unit.business_type} · {unit.unit_number || '-'} · {unit.city || '-'}</div>
                      </div>
                      <button onClick={() => setEditingUnit(unit.id)} className="btn btn-secondary btn-sm">Edit</button>
                    </div>
                  )}
                </div>
              ))}
              {owner.business_units.length === 0 && (
                <div className="text-muted" style={{ fontSize: 13 }}>Belum ada unit usaha.</div>
              )}
            </div>
          </div>
        ))}
        {owners && owners.length === 0 && <div className="text-muted">Tidak ada hasil.</div>}
      </div>
    </div>
  );
}
