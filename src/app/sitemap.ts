import { MetadataRoute } from 'next';

// Main pages of the application
const routes = [
  '',
  '/progress',
  '/ai-features',
  '/goals',
  '/profile',
  '/log-food/manual',
  '/log-food/photo',
  '/onboarding',
  '/welcome',
  '/reminders',
  '/about',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://calorietracker.in';
  
  // Generate entries for all static routes
  const routeEntries = routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [
    ...routeEntries,
    // Add any additional dynamic routes if needed
  ];
} 