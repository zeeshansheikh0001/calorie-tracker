import type { Metadata } from 'next';
import { Geist, Geist_Mono, Poppins } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import React from 'react';
import { applicationSchema } from '@/lib/schema';
import GoogleAnalytics from '@/lib/analytics';
import { ServiceWorkerRegistrar } from '@/components/service-worker-registrar';

import SupabaseProvider from "@/components/supabase-provider";

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
  title: 'Calorie Tracker | Smart Nutrition Monitoring App',
  description: 'Track your daily calories, macronutrients, and achieve your fitness goals with our AI-powered nutrition tracking app. Set goals, monitor progress, and get personalized insights.',
  keywords: 'calorie tracker, nutrition app, meal tracking, diet planner, fitness goals, weight loss, muscle gain, macro tracking, healthy eating, food logger',
  authors: [{ name: 'Calorie Tracker Team' }],
  creator: 'Calorie Tracker',
  publisher: 'Calorie Tracker',
  applicationName: 'Calorie Tracker',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://calorietracker.in'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://calorietracker.in',
    title: 'Calorie Tracker | Smart Nutrition Monitoring App',
    description: 'Track your daily calories, macronutrients, and achieve your fitness goals with our AI-powered nutrition tracking app.',
    siteName: 'Calorie Tracker',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Calorie Tracker App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calorie Tracker | Smart Nutrition Monitoring App',
    description: 'Track your daily calories, macronutrients, and achieve your fitness goals with our AI-powered nutrition tracking app.',
    images: ['/twitter-image.jpg'],
    creator: '@calorietracker',
  },
  manifest: '/favicon/site.webmanifest',
  icons: {
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon-16x16.png',
    apple: '/favicon/apple-touch-icon.png',
    other: [
      {
        url: '/favicon/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/favicon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const bodyClassNames = [
    geistSans.variable.trim(),
    geistMono.variable.trim(),
    poppins.variable.trim(),
    'font-sans',
    'antialiased'
  ].filter(Boolean).join(' ');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://calorietracker.in" />
        <meta name="google-adsense-account" content="ca-pub-3014018771524962" />
        {/* Structured data for Recipe App */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(applicationSchema)
          }}
        />

      </head>
      <body className={bodyClassNames}>
        <GoogleAnalytics />
        <ServiceWorkerRegistrar />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <SupabaseProvider>
            <AppLayout>{children}</AppLayout>
          </SupabaseProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
