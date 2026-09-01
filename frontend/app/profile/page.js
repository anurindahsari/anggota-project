'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuthGuard } from '../../lib/useAuthGuard';
import Header from '../../components/Header';

export default function ProfilePage() {
  const ready = useAuthGuard();
  const [owner, setOwner] = useState(null);
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [changingPhone, setChangingPhone] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!ready) return;
    apiFetch('/owners/me').then((data) => {
      setOwner(data.owner);
      setFullName(data.owner.full_name);
    });
  }, [ready]);

  async function handleSaveName(e) {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await apiFetch('/owners/me', { method: 'PATCH', body: JSON.stringify({ fullName }) });
      setMessage('Nama tersimpan.');
    } catch (err) { setError(err.message); }
  }

  async function handleRequestPhoneOtp() {
    setError('');
    try {
      await apiFetch('/owners/me/change-phone/request', { method: 'POST' });
      setOtpSent(true);
    } catch (err) { setError(err.message); }
  }

  async function handleConfirmPhoneChange(e) {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/owners/me/change-phone/confirm', { method: 'POST', body: JSON.stringify({ code, newPhone }) });
      setMessage('Nomor WhatsApp berhasil diganti.');
      setChangingPhone(false);
      setOtpSent(false);
    } catch (err) { setError(err.message); }
  }

  if (!ready) return null;
  if (!owner) return <div className="page text-muted">Memuat...</div>;

  return (
    <div className="page">
      <Header />
      <h1 className="page-title">Edit profil</h1>
      <p className="page-subtitle">Kelola data pribadi kamu.</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <form onSubmit={handleSaveName}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="fullName">Nama lengkap</label>
            <input id="fullName" className="input" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">Simpan nama</button>
        </form>
      </div>

      <div className="card">
        <p className="text-muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
          Nomor WhatsApp dipakai untuk login, jadi butuh verifikasi kode dulu sebelum diganti.
        </p>
        <p style={{ fontSize: 14, marginBottom: 12 }}>Nomor saat ini: <strong>{owner.phone || '(belum ada)'}</strong></p>

        {!changingPhone && (
          <button onClick={() => setChangingPhone(true)} className="btn btn-secondary btn-sm">Ganti nomor</button>
        )}
        {changingPhone && !otpSent && (
          <button onClick={handleRequestPhoneOtp} className="btn btn-secondary btn-sm">Kirim kode verifikasi ke nomor lama</button>
        )}
        {changingPhone && otpSent && (
          <form onSubmit={handleConfirmPhoneChange}>
            <div className="field" style={{ marginBottom: 10 }}>
              <label className="label" htmlFor="otpCode">Kode verifikasi</label>
              <input id="otpCode" className="input" type="text" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label className="label" htmlFor="newPhone">Nomor WhatsApp baru</label>
              <input id="newPhone" className="input" type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Konfirmasi ganti nomor</button>
          </form>
        )}
      </div>

      {message && <div className="alert alert-success mt-24">{message}</div>}
      {error && <div className="alert alert-danger mt-24">{error}</div>}
    </div>
  );
}
