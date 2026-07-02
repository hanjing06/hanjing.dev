import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Writing and project updates from Hanjing Lin.',
  alternates: {
    canonical: '/blog',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
