import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Maverick TV Tycoon',
  description: 'Build your production studio. Greenlight hit shows. Rule the airwaves.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
