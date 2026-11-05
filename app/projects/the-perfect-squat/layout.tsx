import { projectMetadata } from '@/content/projects';

export const metadata = projectMetadata('the-perfect-squat');

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
