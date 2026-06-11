import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Hanjing Lin, a software engineering student building embedded and intelligent systems.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
