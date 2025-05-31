import type { Metadata } from 'next';

interface MetaTagsProps {
  title: string;
  description: string;
  keywords?: string;
  path: string;
  ogImage?: string;
  noindex?: boolean;
}

/**
 * Helper function to generate consistent metadata for all pages
 */
export function generateMetadata({
  title,
  description,
  keywords = '',
  path,
  ogImage = '/og-image.jpg',
  noindex = false
}: MetaTagsProps): Metadata {
  const url = `https://calorietracker.in${path}`;

  return {
    title: `${title} | Calorie Tracker`,
    description,
    keywords: `calorie tracker, nutrition app, ${keywords}`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url,
      title: `${title} | Calorie Tracker`,
      description,
      siteName: 'Calorie Tracker',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Calorie Tracker`,
      description,
      images: [ogImage],
      creator: '@calorietrackin',
    },
    robots: noindex ? 
      { 
        index: false, 
        follow: false 
      } : 
      {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
  };
} 