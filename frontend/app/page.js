import Link from 'next/link';
import Header from '../components/Header';

export default function HomePage() {
  return (
    <div className="page" style={{ paddingTop: 80 }}>
      <Header />
      <h1 className="page-title" style={{ fontSize: 26, marginBottom: 10 }}>
        Portal anggota
      </h1>
      <p className="page-subtitle" style={{ marginBottom: 28 }}>
        Cek status iuran, bayar, dan lihat event terdekat DPC Surabaya.
      </p>
      <Link href="/login">
        <button className="btn btn-primary btn-full">Masuk</button>
      </Link>
    </div>
  );
}
