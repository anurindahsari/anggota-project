'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, setToken } from '../../lib/api';
import Header from '../../components/Header';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestOtp(e) {
    e.preventDefault();
    setError('');
    if (!phone.trim()) return setError('Nomor WhatsApp wajib diisi.');
    setLoading(true);
    try {
      await apiFetch('/auth/request-otp', { method: 'POST', body: JSON.stringify({ phone }) });
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError('');
    if (!code.trim()) return setError('Kode OTP wajib diisi.');
    setLoading(true);
    try {
      const data = await apiFetch('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, code }) });
      setToken(data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ paddingTop: 64 }}>
      <Header />
      <h1 className="page-title">Masuk akun</h1>
      <p className="page-subtitle">
        {step === 'phone' ? 'Pakai nomor WhatsApp yang terdaftar sebagai anggota.' : `Kode terkirim ke ${phone}`}
      </p>

      {step === 'phone' && (
        <form onSubmit={handleRequestOtp}>
          <div className="field">
            <label className="label" htmlFor="phone">Nomor WhatsApp</label>
            <input id="phone" className="input" type="text" placeholder="0812xxxxxxx"
              value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button disabled={loading} className="btn btn-primary btn-full" type="submit">
            {loading ? 'Mengirim...' : 'Kirim kode OTP'}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp}>
          <div className="field">
            <label className="label" htmlFor="code">Kode OTP</label>
            <input id="code" className="input" type="text" placeholder="6 digit"
              value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button disabled={loading} className="btn btn-primary btn-full" type="submit">
            {loading ? 'Memverifikasi...' : 'Masuk'}
          </button>
        </form>
      )}
    </div>
  );
}
