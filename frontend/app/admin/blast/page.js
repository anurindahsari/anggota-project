'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { useAuthGuard } from '../../../lib/useAuthGuard';
import Header from '../../../components/Header';

export default function BlastAdminPage() {
  const ready = useAuthGuard();
  const [events, setEvents] = useState([]);
  const [targetFilter, setTargetFilter] = useState('unpaid');
  const [eventId, setEventId] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    apiFetch('/events/upcoming').then((data) => setEvents(data.events));
  }, [ready]);

  async function handleSend(e) {
    e.preventDefault();
    setError(''); setResult('');
    if (!message.trim()) return setError('Pesan wajib diisi.');
    setLoading(true);
    try {
      const data = await apiFetch('/blast', { method: 'POST', body: JSON.stringify({ targetFilter, eventId: eventId || null, message }) });
      setResult(data.message);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (!ready) return null;

  return (
    <div className="page">
      <Header />
      <h1 className="page-title">Kirim info ke anggota</h1>
      <p className="page-subtitle">Blast WhatsApp ke anggota terpilih.</p>

      <form onSubmit={handleSend}>
        <div className="field">
          <label className="label" htmlFor="target">Kirim ke</label>
          <select id="target" className="input" value={targetFilter} onChange={(e) => setTargetFilter(e.target.value)}>
            <option value="all">Semua pemilik</option>
            <option value="unpaid">Yang belum bayar iuran</option>
            <option value="registered_event">Yang sudah daftar event tertentu</option>
          </select>
        </div>

        {targetFilter === 'registered_event' && (
          <div className="field">
            <label className="label" htmlFor="event">Pilih event</label>
            <select id="event" className="input" value={eventId} onChange={(e) => setEventId(e.target.value)}>
              <option value="">-- pilih --</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>
        )}

        <div className="field">
          <label className="label" htmlFor="msg">Pesan</label>
          <textarea id="msg" className="input" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {result && <div className="alert alert-success">{result}</div>}

        <button disabled={loading} type="submit" className="btn btn-primary btn-full">
          {loading ? 'Mengirim...' : 'Kirim sekarang'}
        </button>
      </form>
    </div>
  );
}
