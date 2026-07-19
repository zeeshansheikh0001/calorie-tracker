import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/toaster";
import React from "react";
import { applicationSchema } from "@/lib/schema";
import GoogleAnalytics from "@/lib/analytics";
import { ServiceWorkerRegistrar } from "@/components/service-worker-registrar";
import { AppProviders } from "@/providers/app-providers";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nourish | Intelligent Nutrition Tracking",
  description:
    "A calm, AI-first nutrition companion. Track calories, macros, hydration, and daily health with a premium coaching experience.",
  keywords:
    "calorie tracker, nutrition app, meal tracking, diet planner, fitness goals, AI nutrition coach, macro tracking",
  authors: [{ name: "Nourish" }],
  creator: "Nourish",
  publisher: "Nourish",
  applicationName: "Nourish",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://calorietracker.in"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://calorietracker.in",
    title: "Nourish | Intelligent Nutrition Tracking",
    description:
      "A calm, AI-first nutrition companion for calories, macros, and daily wellness.",
    siteName: "Nourish",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nourish nutrition app",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nourish | Intelligent Nutrition Tracking",
    description:
      "A calm, AI-first nutrition companion for calories, macros, and daily wellness.",
    images: ["/twitter-image.jpg"],
    creator: "@calorietracker",
  },
  manifest: "/favicon/site.webmanifest",
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon-16x16.png",
    apple: "/favicon/apple-touch-icon.png",
    other: [
      {
        url: "/favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/favicon/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3faf4" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1410" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyClassNames = [
    display.variable.trim(),
    sans.variable.trim(),
    mono.variable.trim(),
    "font-sans",
    "antialiased",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-3014018771524962" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(applicationSchema),
          }}
        />
      </head>
      <body className={bodyClassNames}>
        <GoogleAnalytics />
        <ServiceWorkerRegistrar />
        <AppProviders>
          <AppShell>{children}</AppShell>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
