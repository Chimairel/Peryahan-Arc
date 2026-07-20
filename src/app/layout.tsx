import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TicketProvider } from '../context/TicketContext';
import SWRegister from './sw-register';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Peryahan Ticket Seller - Offline Carnival PWA',
  description: 'Fast offline carnival ticket sales calculator, customer change tracker, and sequential ticket code logger.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Peryahan Ticket',
  },
};

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} dark h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950" suppressHydrationWarning>
        <TicketProvider>
          <SWRegister />
          {children}
        </TicketProvider>
      </body>
    </html>
  );
}
