'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';
import { useAuthGuard } from '../../../../lib/useAuthGuard';

export default function FeedbackPage() {
  const ready = useAuthGuard();
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (rating === 0) return setError('Pilih dulu ratingnya.');

    try {
      await apiFetch(`/events/${id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      });
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!ready) return null;

  if (sent) {
    return (
      <div style={{ maxWidth: 360, margin: '4rem auto', padding: '0 1rem', textAlign: 'center' }}>
        <p>Terima kasih atas feedback-nya.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 360, margin: '4rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 18, fontWeight: 500 }}>Gimana acaranya?</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '16px 0' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              style={{
                fontSize: 24,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: n <= rating ? '#f5a623' : '#ccc',
              }}
              aria-label={`${n} bintang`}
            >
              ★
            </button>
          ))}
        </div>

        <label style={{ fontSize: 13, color: '#666' }}>Catatan (opsional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Ceritain pengalaman kamu"
          style={{ width: '100%', margin: '6px 0 16px', boxSizing: 'border-box', padding: 8 }}
        />

        {error && <p style={{ color: 'crimson', fontSize: 13 }}>{error}</p>}

        <button type="submit" style={{ width: '100%', padding: 10 }}>Kirim feedback</button>
      </form>
    </div>
  );
}
