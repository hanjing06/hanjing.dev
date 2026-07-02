import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Moore FSM: A Sequence Detector',
  description:
    'Designing, optimizing, and implementing a Moore finite state machine sequence detector.',
  alternates: {
    canonical: '/projects/moore-fsm-sequence-detector',
  },
};

export default function MooreFsmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
