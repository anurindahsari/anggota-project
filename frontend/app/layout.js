export const metadata = {
  title: 'Anggota Hiswana Migas',
  description: 'Portal anggota, iuran, dan event',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, background: '#fff', color: '#111' }}>
        {children}
      </body>
    </html>
  );
}
