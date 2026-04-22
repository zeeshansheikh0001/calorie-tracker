import type { Metadata } from 'next';
import PrivacyContent from './privacy-content';

export const metadata: Metadata = {
  title: 'Calorie Tracker',
  description: 'Calorie Tracker',
  keywords: 'calorie tracker',
  alternates: {
    canonical: 'https://calorietracker.in/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyContent />;
} 