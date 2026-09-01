'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import Header from '../../../components/Header';

export default function PublicEventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/events/public/${id}`)
      .then((data) => setEvent(data.event))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="page"><div className="alert alert-danger">{error}</div></div>;
  if (!event) return <div className="page text-muted">Memuat...</div>;

  return (
    <div className="page">
      <Header />
      <h1 className="page-title">{event.title}</h1>
      <p className="page-subtitle">
        {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {event.location}
      </p>

      {event.description && (
        <div className="card" style={{ marginBottom: 24 }}>
          <p style={{ lineHeight: 1.6, fontSize: 14.5 }}>{event.description}</p>
        </div>
      )}

      <Link href={`/events/${event.id}`}>
        <button className="btn btn-primary btn-full">Masuk untuk daftar</button>
      </Link>
    </div>
  );
}
