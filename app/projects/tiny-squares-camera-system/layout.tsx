import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tiny Squares Camera System',
  description: 'Engineering an embedded camera that captures, converts, and instantly prints images.',
};

export default function TinySquaresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
