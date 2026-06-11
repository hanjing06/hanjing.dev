import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Embedded systems, computer vision, and software engineering projects by Hanjing Lin.',
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
