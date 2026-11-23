import { projectMetadata } from '@/content/projects';

export const metadata = projectMetadata('ratatouille');

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
