'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, setToken, getToken } from '../../lib/api';
import Header from '../../components/Header';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    if (!phone.trim() || !password.trim()) return setError('Nomor dan password wajib diisi.');
    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
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
    <div className="page" style={{ paddingTop: 64 }}>
      <Header />
      <h1 className="page-title">Masuk akun</h1>
      <p className="page-subtitle">Pakai nomor WhatsApp dan password akun kamu.</p>

      <form onSubmit={handleLogin}>
        <div className="field">
          <label className="label" htmlFor="phone">Nomor WhatsApp</label>
          <input id="phone" className="input" type="text" placeholder="0812xxxxxxx"
            value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="field">
          <label className="label" htmlFor="password">Password</label>
          <input id="password" className="input" type="password" placeholder="Password"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button disabled={loading} className="btn btn-primary btn-full" type="submit">
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}
