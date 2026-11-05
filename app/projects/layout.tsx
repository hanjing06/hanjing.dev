import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Projects',
  description: 'Embedded systems, computer vision, and software engineering projects by Hanjing Lin.',
  path: '/projects',
});

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
