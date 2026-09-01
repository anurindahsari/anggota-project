import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
});

export const metadata = {
  title: 'Hiswana Migas | Portal Anggota',
  description: 'Portal anggota, iuran, dan event DPC Surabaya',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body style={{ fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
