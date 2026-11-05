import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Blog',
  description: 'Writing and project updates from Hanjing Lin.',
  path: '/blog',
  noIndex: true,
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
