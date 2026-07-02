import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tiny Squares Camera System',
  description: 'Engineering an embedded camera that captures, converts, and instantly prints images.',
  alternates: {
    canonical: '/projects/tiny-squares-camera-system',
  },
};

export default function TinySquaresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
