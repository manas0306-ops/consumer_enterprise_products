import type { Metadata } from 'next';
import './globals.css';
import { BusinessProvider } from '@/context/BusinessContext';

export const metadata: Metadata = {
  title: 'KINETIC — AI-Powered Business Operating System for MSMEs',
  description: 'Multilingual AI business operating system for Indian MSMEs & Kirana stores. Built for IndustrySolve Hackathon | IIIT Delhi 2026.',
  icons: {
    icon: '/assets/rangoli_mandala.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-ivory-50 text-earth-900 min-h-screen">
        <BusinessProvider>
          {children}
        </BusinessProvider>
      </body>
    </html>
  );
}
