import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sunstang VCU 2026',
  description: 'Designing and routing a vehicle control unit PCB for the Sunstang solar car.',
  alternates: {
    canonical: '/projects/sunstang-vcu-2026',
  },
};

export default function SunstangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
