import type { MetadataRoute } from 'next';
import { projectHref, projects } from '@/content/projects';
import { site } from '@/lib/site';

// Blog routes are intentionally omitted while the blog is `noIndex`.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/about',
    '/projects',
    ...projects.map(({ slug }) => projectHref(slug)),
    '/contact',
  ];

  return routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'monthly' : 'yearly',
    priority: route === '' ? 1 : route === '/projects' ? 0.9 : 0.7,
  }));
}
