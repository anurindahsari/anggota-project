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
  const [phonePassword, setPhonePassword] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  async function handleChangePhone(e) {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await apiFetch('/owners/me/change-phone', {
        method: 'POST',
        body: JSON.stringify({ password: phonePassword, newPhone }),
      });
      setMessage('Nomor WhatsApp berhasil diganti.');
      setChangingPhone(false);
      setPhonePassword('');
      setNewPhone('');
    } catch (err) { setError(err.message); }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setError(''); setMessage('');
    if (newPassword !== confirmPassword) {
      return setError('Konfirmasi password baru tidak cocok.');
    }
    try {
      await apiFetch('/owners/me/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setMessage('Password berhasil diganti.');
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
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

      <div className="card" style={{ marginBottom: 16 }}>
        <p className="text-muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
          Butuh password kamu buat konfirmasi sebelum nomor diganti.
        </p>
        <p style={{ fontSize: 14, marginBottom: 12 }}>Nomor saat ini: <strong>{owner.phone || '(belum ada)'}</strong></p>

        {!changingPhone && (
          <button onClick={() => setChangingPhone(true)} className="btn btn-secondary btn-sm">Ganti nomor</button>
        )}
        {changingPhone && (
          <form onSubmit={handleChangePhone}>
            <div className="field" style={{ marginBottom: 10 }}>
              <label className="label" htmlFor="phonePassword">Password kamu</label>
              <input id="phonePassword" className="input" type="password" value={phonePassword} onChange={(e) => setPhonePassword(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label className="label" htmlFor="newPhone">Nomor WhatsApp baru</label>
              <input id="newPhone" className="input" type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Konfirmasi ganti nomor</button>
          </form>
        )}
      </div>

      <div className="card">
        <p className="text-muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
          Ganti password akun kamu secara berkala biar tetap aman.
        </p>

        {!changingPassword && (
          <button onClick={() => setChangingPassword(true)} className="btn btn-secondary btn-sm">Ganti password</button>
        )}
        {changingPassword && (
          <form onSubmit={handleChangePassword}>
            <div className="field" style={{ marginBottom: 10 }}>
              <label className="label" htmlFor="currentPassword">Password lama</label>
              <input id="currentPassword" className="input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 10 }}>
              <label className="label" htmlFor="newPassword">Password baru</label>
              <input id="newPassword" className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label className="label" htmlFor="confirmPassword">Ulangi password baru</label>
              <input id="confirmPassword" className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Simpan password baru</button>
          </form>
        )}
      </div>

      {message && <div className="alert alert-success mt-24">{message}</div>}
      {error && <div className="alert alert-danger mt-24">{error}</div>}
    </div>
  );
}
