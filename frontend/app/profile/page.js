'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuthGuard } from '../../lib/useAuthGuard';

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
    setError('');
    setMessage('');
    try {
      await apiFetch('/owners/me', { method: 'PATCH', body: JSON.stringify({ fullName }) });
      setMessage('Nama tersimpan.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRequestPhoneOtp() {
    setError('');
    try {
      await apiFetch('/owners/me/change-phone/request', { method: 'POST' });
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirmPhoneChange(e) {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/owners/me/change-phone/confirm', {
        method: 'POST',
        body: JSON.stringify({ code, newPhone }),
      });
      setMessage('Nomor WhatsApp berhasil diganti.');
      setChangingPhone(false);
      setOtpSent(false);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!ready) return null;
  if (!owner) return <p style={{ padding: 24 }}>Memuat...</p>;

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>Edit profil</h1>

      <form onSubmit={handleSaveName}>
        <label style={{ fontSize: 13, color: '#666' }}>Nama lengkap</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ width: '100%', margin: '6px 0 14px', boxSizing: 'border-box', padding: 8 }}
        />
        <button type="submit" style={{ padding: '8px 16px', marginBottom: 20 }}>Simpan nama</button>
      </form>

      <div style={{ borderTop: '1px solid #eee', paddingTop: 14 }}>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
          Nomor WhatsApp dipakai untuk login, jadi butuh verifikasi kode dulu sebelum diganti.
        </p>
        <p style={{ fontSize: 14 }}>Nomor saat ini: {owner.phone || '(belum ada)'}</p>

        {!changingPhone && (
          <button onClick={() => setChangingPhone(true)} style={{ padding: '8px 16px' }}>
            Ganti nomor
          </button>
        )}

        {changingPhone && !otpSent && (
          <button onClick={handleRequestPhoneOtp} style={{ padding: '8px 16px' }}>
            Kirim kode verifikasi ke nomor lama
          </button>
        )}

        {changingPhone && otpSent && (
          <form onSubmit={handleConfirmPhoneChange}>
            <label style={{ fontSize: 13, color: '#666' }}>Kode verifikasi</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ width: '100%', margin: '6px 0 10px', boxSizing: 'border-box', padding: 8 }}
            />
            <label style={{ fontSize: 13, color: '#666' }}>Nomor WhatsApp baru</label>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              style={{ width: '100%', margin: '6px 0 14px', boxSizing: 'border-box', padding: 8 }}
            />
            <button type="submit" style={{ padding: '8px 16px' }}>Konfirmasi ganti nomor</button>
          </form>
        )}
      </div>

      {message && <p style={{ color: 'green', fontSize: 13, marginTop: 12 }}>{message}</p>}
      {error && <p style={{ color: 'crimson', fontSize: 13, marginTop: 12 }}>{error}</p>}
    </div>
  );
}
