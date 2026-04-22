import type { Metadata } from 'next';
import TermsContent from './terms-content';

export const metadata: Metadata = {
  title: 'Calorie Tracker',
  description: 'Calorie Tracker',
  keywords: 'calorie tracker',
  alternates: {
    canonical: 'https://calorietracker.in/terms',
  },
};

export default function TermsOfServicePage() {
  return <TermsContent />;
} 