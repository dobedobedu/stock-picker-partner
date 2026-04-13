import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stock Literacy — Learn How Stocks Work',
  description: 'A financial literacy tool that helps K-12 students evaluate stocks using real market data.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
