import type { Metadata } from 'next';
import BlogIntroductionClient from './BlogIntroductionClient';

export const metadata: Metadata = {
  title: 'An Introduction',
  description: 'An introduction to Hanjing Lin and the writing behind this blog.',
  alternates: {
    canonical: '/blog/introduction',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function BlogIntroductionPage() {
  return <BlogIntroductionClient />;
}
