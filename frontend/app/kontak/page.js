import PublicNav from '../../components/PublicNav';

const CONTACTS = [
  {
    icon: '📍',
    title: 'Alamat',
    lines: ['Jl. Perak Timur No.168, Perak Tim.', 'Kec. Pabean Cantian, Surabaya', 'Jawa Timur 60165'],
  },
  {
    icon: '📞',
    title: 'Telepon',
    lines: ['(031) 3521658'],
  },
  {
    icon: '🕒',
    title: 'Jam Operasional',
    lines: ['Senin - Jumat (08.00 - 16.00)'],
  },
];

export default function KontakPage() {
  return (
    <div>
      <PublicNav />
      <div className="content-page">
        <h1 className="page-title" style={{ marginBottom: 8, marginTop: 8 }}>Kontak</h1>
        <p style={{ marginBottom: 24, color: 'var(--text-secondary)', fontSize: 14.5 }}>
          Hubungi Hiswana Migas DPC Surabaya untuk informasi lebih lanjut.
        </p>

        <div className="stack">
          {CONTACTS.map((c) => (
            <div className="card" key={c.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'var(--brand-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {c.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>{c.title}</div>
                {c.lines.map((line) => (
                  <div key={line} className="text-secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
