// app/layout.tsx
import './globals.css';
import React from 'react';
import type { Metadata } from 'next';

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
      <body className="bg-gray-100 text-gray-900">
        <header className="p-4 bg-white border-b shadow">
          <nav className="max-w-7xl mx-auto flex space-x-4">
            <a href="/" className="font-semibold hover:underline">
              Home
            </a>
            <a href="/analytics" className="font-semibold hover:underline">
              Analytics
            </a>
            <a href="/analytics/tweets-by-day" className="font-semibold hover:underline">
              Tweets by Day
            </a>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto py-4">
          {children}
        </main>
      </body>
    </html>
  );
}
