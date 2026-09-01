'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import Header from '../../components/Header';

export default function EventsListPage() {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    apiFetch('/events/upcoming').then((data) => setEvents(data.events));
  }, []);

  return (
    <div className="page">
      <Header />
      <h1 className="page-title">Event terdekat</h1>
      <p className="page-subtitle">Agenda DPC Surabaya yang akan datang.</p>

      {!events && <div className="text-muted">Memuat...</div>}
      {events && events.length === 0 && <div className="text-muted">Belum ada event terjadwal.</div>}

      <div className="stack">
        {events && events.map((e) => (
          <Link href={`/events/${e.id}`} key={e.id}>
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{e.title}</div>
              <div className="text-secondary" style={{ fontSize: 13.5 }}>
                {new Date(e.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · {e.location}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
