'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';

// Halaman promosi event yang bisa dishare bebas ke luar (media sosial, WA grup umum),
// TANPA perlu login. Kalau orangnya mau daftar, baru diarahkan login di /events/[id].
export default function PublicEventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/events/public/${id}`)
      .then((data) => setEvent(data.event))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p style={{ padding: 24, color: 'crimson' }}>{error}</p>;
  if (!event) return <p style={{ padding: 24 }}>Memuat...</p>;

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500 }}>{event.title}</h1>
      <p style={{ color: '#888', fontSize: 13 }}>
        {new Date(event.event_date).toLocaleDateString('id-ID', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        })}
        {' · '}{event.location}
      </p>
      {event.description && <p style={{ marginTop: 16, lineHeight: 1.6 }}>{event.description}</p>}

      <Link href={`/events/${event.id}`}>
        <button style={{ marginTop: 20, padding: '10px 20px' }}>Masuk untuk daftar</button>
      </Link>
    </div>
  );
}
