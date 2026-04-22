import type { Metadata } from 'next';
import AboutContent from './about-content';

// Metadata for SEO optimization
export const metadata: Metadata = {
  title: 'Calorie Tracker',
  description: 'Calorie Tracker',
  keywords: 'calorie tracker',
  alternates: {
    canonical: 'https://calorietracker.in/about',
  },
  openGraph: {
    title: 'Calorie Tracker',
    description: 'Calorie Tracker',
    url: 'https://calorietracker.in/about',
    type: 'website',
  }
};

export default function AboutPage() {
  return <AboutContent />;
} 