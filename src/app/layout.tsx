import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Maverick TV Tycoon',
  description: 'Build your production studio. Greenlight hit shows. Rule the airwaves.',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Maverick TV' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="overscroll-none">{children}</body>
    </html>
  );
}
