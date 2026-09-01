'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { useAuthGuard } from '../../../lib/useAuthGuard';

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
    setError('');
    setResult('');
    if (!message.trim()) return setError('Pesan wajib diisi.');

    setLoading(true);
    try {
      const data = await apiFetch('/blast', {
        method: 'POST',
        body: JSON.stringify({ targetFilter, eventId: eventId || null, message }),
      });
      setResult(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>Kirim info ke anggota</h1>

      <form onSubmit={handleSend}>
        <label style={{ fontSize: 13, color: '#666' }}>Kirim ke</label>
        <select
          value={targetFilter}
          onChange={(e) => setTargetFilter(e.target.value)}
          style={{ width: '100%', margin: '6px 0 14px', padding: 8 }}
        >
          <option value="all">Semua pemilik</option>
          <option value="unpaid">Yang belum bayar iuran</option>
          <option value="registered_event">Yang sudah daftar event tertentu</option>
        </select>

        {targetFilter === 'registered_event' && (
          <>
            <label style={{ fontSize: 13, color: '#666' }}>Pilih event</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              style={{ width: '100%', margin: '6px 0 14px', padding: 8 }}
            >
              <option value="">-- pilih --</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </>
        )}

        <label style={{ fontSize: 13, color: '#666' }}>Pesan</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          style={{ width: '100%', margin: '6px 0 16px', boxSizing: 'border-box', padding: 8 }}
        />

        {error && <p style={{ color: 'crimson', fontSize: 13 }}>{error}</p>}
        {result && <p style={{ color: 'green', fontSize: 13 }}>{result}</p>}

        <button disabled={loading} type="submit" style={{ width: '100%', padding: 10 }}>
          {loading ? 'Mengirim...' : 'Kirim sekarang'}
        </button>
      </form>
    </div>
  );
}
