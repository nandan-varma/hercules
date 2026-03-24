import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hercules",
  description: "A modular GitHub-like platform built with Next.js and Hono"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
