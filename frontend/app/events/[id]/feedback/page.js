'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';
import { useAuthGuard } from '../../../../lib/useAuthGuard';
import Header from '../../../../components/Header';

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
      await apiFetch(`/events/${id}/feedback`, { method: 'POST', body: JSON.stringify({ rating, comment }) });
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!ready) return null;

  if (sent) {
    return (
      <div className="page text-center" style={{ paddingTop: 80 }}>
        <Header />
        <p style={{ fontSize: 15 }}>Terima kasih atas feedback-nya.</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingTop: 64 }}>
      <Header />
      <h1 className="page-title">Gimana acaranya?</h1>
      <p className="page-subtitle">Ceritakan pengalaman kamu, membantu kami untuk acara berikutnya.</p>

      <form onSubmit={handleSubmit}>
        <div className="row" style={{ justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}
              style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: n <= rating ? 'var(--brand)' : 'var(--border-strong)', padding: 2 }}
              aria-label={`${n} bintang`}>★</button>
          ))}
        </div>

        <div className="field">
          <label className="label" htmlFor="comment">Catatan (opsional)</label>
          <textarea id="comment" className="input" rows={3} placeholder="Ceritain pengalaman kamu"
            value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary btn-full">Kirim feedback</button>
      </form>
    </div>
  );
}
