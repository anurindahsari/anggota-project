'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';

export default function EventsListPage() {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    apiFetch('/events/upcoming').then((data) => setEvents(data.events));
  }, []);

  if (!events) return <p style={{ padding: 24 }}>Memuat...</p>;

  return (
    <div style={{ maxWidth: 560, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 16 }}>Event terdekat</h1>
      {events.length === 0 && <p style={{ color: '#888' }}>Belum ada event terjadwal.</p>}
      {events.map((e) => (
        <Link key={e.id} href={`/events/${e.id}`}>
          <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 14, marginBottom: 10 }}>
            <p style={{ margin: 0, fontWeight: 500 }}>{e.title}</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>
              {new Date(e.event_date).toLocaleDateString('id-ID')} &middot; {e.location}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
