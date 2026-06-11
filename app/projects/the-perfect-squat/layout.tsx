import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Perfect Squat',
  description: 'Building a computer vision system that measures a barbell squat path.',
};

export default function PerfectSquatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
