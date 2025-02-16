// app/layout.tsx
import type { Metadata } from "next";

import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vigilante Dashboard",
  description: "Misinformation Visualization System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground flex flex-col">
        {children}
      </body>
    </html>
  );
}
