
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Calorie Tracker',
  description: 'Track your calories and nutrition smartly.',
};

// This RootLayout is a Server Component.
// It doesn't directly receive or use route `params` or `searchParams` in its props.
// If child pages (which are Client Components in this app) needed route parameters,
// they would typically use hooks like `useParams()` or `useSearchParams()` from `next/navigation`.
// The "params enumerated" warning might stem from Next.js internals or library interactions
// in development mode if not directly from user code misusing params in a Server Component.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
