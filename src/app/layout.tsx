import type { Metadata } from 'next';
import { Geist, Geist_Mono, Poppins } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import React from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Calorie Tracker',
  description: 'Track your calories and nutrition smartly.',
};

export default function RootLayout({
  children,
  params, // Explicitly destructure params
}: Readonly<{
  children: React.ReactNode;
  params: { [key: string]: string | string[] | undefined }; // Add type for params
}>) {
  // The "params enumerated" warning can sometimes be an internal Next.js development mode issue.
  // By explicitly acknowledging `params` here, we might influence how Next.js's tooling perceives it,
  // even though `params` are not directly used in this root layout's rendering logic.
  // If params were to be used, it would be with: const unwrapped = React.use(params);

  const bodyClassNames = [
    geistSans.variable.trim(),
    geistMono.variable.trim(),
    poppins.variable.trim(),
    'font-sans',
    'antialiased'
  ].filter(Boolean).join(' ');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={bodyClassNames}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          // disableTransitionOnChange // Removed previously, keeping it removed for now
        >
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
