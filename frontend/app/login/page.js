'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, setToken } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
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
      const data = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      });
      setToken(data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '4rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500 }}>Masuk akun anggota</h1>

      {step === 'phone' && (
        <form onSubmit={handleRequestOtp}>
          <label style={{ fontSize: 13, color: '#666' }}>Nomor WhatsApp</label>
          <input
            type="text"
            placeholder="0812xxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', margin: '6px 0 16px', boxSizing: 'border-box', padding: 8 }}
          />
          {error && <p style={{ color: 'crimson', fontSize: 13 }}>{error}</p>}
          <button disabled={loading} type="submit" style={{ width: '100%', padding: 10 }}>
            {loading ? 'Mengirim...' : 'Kirim kode OTP'}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp}>
          <p style={{ fontSize: 13, color: '#666' }}>Kode dikirim ke {phone}</p>
          <label style={{ fontSize: 13, color: '#666' }}>Kode OTP</label>
          <input
            type="text"
            placeholder="6 digit"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ width: '100%', margin: '6px 0 16px', boxSizing: 'border-box', padding: 8 }}
          />
          {error && <p style={{ color: 'crimson', fontSize: 13 }}>{error}</p>}
          <button disabled={loading} type="submit" style={{ width: '100%', padding: 10 }}>
            {loading ? 'Memverifikasi...' : 'Masuk'}
          </button>
        </form>
      )}
    </div>
  );
}
