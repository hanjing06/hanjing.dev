'use client';

import type { ReactNode } from 'react';

/**
 * Shared pieces for the start screen ("gate"): a full-window light page that
 * asks whether to enter the 3D desk or browse the simple site, then shows
 * loading progress until the desk is ready.
 */

type GateStage = 'choose' | 'loading';

export type GateProps = {
  stage: GateStage;
  /** Model download progress, 0 to 1 (only while loading). */
  progress: number;
  /** True on machines where 3D will likely struggle; null before we know. */
  recommendSimple: boolean | null;
  /** Shown when the 3D desk failed to load. */
  error: boolean;
  onEnter: () => void;
  onSimple: () => void;
};

export const GATE_FONT = "font-['Times_New_Roman',Times,serif]";

export const COPY = {
  title: 'hanjing.dev',
  enter: 'enter the 3d desk',
  enterDetail: 'a cozy desk you can explore · best on a laptop or desktop',
  simple: 'browse the simple site',
  simpleDetail: 'lighter and faster · works everywhere',
  recommend: 'this device may find 3d heavy, so the simple site is recommended.',
  error: 'the 3d desk couldn’t load here. the simple site works everywhere.',
};

/** "setting up the desk… 42%", then "almost there…" while the first frames render. */
export function loadingLabel(progress: number) {
  return progress >= 0.999 ? 'almost there…' : `setting up the desk… ${Math.round(progress * 100)}%`;
}

/** Full-window white page that fades out when the desk is ready. */
export function GateShell({ leaving, children }: { leaving: boolean; children: ReactNode }) {
  return (
    <div
      className={`fixed inset-0 z-[70] h-[100svh] w-full overflow-hidden bg-white text-black transition-opacity duration-700 ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  );
}
