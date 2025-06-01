'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, Suspense } from 'react';

// Add type declaration for gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      target: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

const GA_MEASUREMENT_ID = 'G-P3WL0JM7FM';

function GoogleAnalyticsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Track page views
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsContent />
    </Suspense>
  );
} 