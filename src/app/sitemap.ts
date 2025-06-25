import { MetadataRoute } from 'next';
import { blogData } from '@/data/blog-content';

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
  '/blog',
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

  // Generate entries for all blog posts
  const blogEntries = blogData.map(post => ({
    url: `${baseUrl}${post.readMoreLink}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    ...routeEntries,
    ...blogEntries,
  ];
} 