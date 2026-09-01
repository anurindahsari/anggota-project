import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ maxWidth: 480, margin: '4rem auto', padding: '0 1rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500 }}>Portal anggota Hiswana Migas</h1>
      <Link href="/login">
        <button style={{ marginTop: 16, padding: '10px 20px' }}>Masuk</button>
      </Link>
    </div>
  );
}
