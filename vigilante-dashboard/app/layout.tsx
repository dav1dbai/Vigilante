// app/layout.tsx
import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['300'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Vigilante Dashboard',
  description: 'Misinformation Visualization System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <header className="p-4 bg-[#2f2f2f] border-b border-zinc-700 shadow">
          <nav className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain border-2 border-white rounded-md"
                priority
              />
              <span className={`${poppins.className} text-white text-xl`}>
                Vigilante
              </span>
            </div>
            <div className="flex space-x-4">
              <Link href="/" className={`${poppins.className} font-semibold text-white hover:text-gray-300`}>
                Home
              </Link>
              <Link href="/analytics" className={`${poppins.className} font-semibold text-white hover:text-gray-300`}>
                Analytics
              </Link>
              <Link href="/analytics/tweets-by-day" className={`${poppins.className} font-semibold text-white hover:text-gray-300`}>
                Tweets by Day
              </Link>
            </div>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto py-4">
          {children}
        </main>
      </body>
    </html>
  );
}
