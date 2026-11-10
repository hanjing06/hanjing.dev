'use client';

import { Barlow_Condensed } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import DeskScene from './DeskScene';
import type { DeskEvents, DeskMode, DeskTarget } from './engine';
import { ALL_ITEMS, CONTACT_ITEM, getDeskItem } from './items';
import type { DeskFonts } from './textures';

const tapeFont = Barlow_Condensed({ weight: '600', subsets: ['latin'] });
const fonts: DeskFonts = { tape: tapeFont.style.fontFamily, serif: 'Lora, Georgia, serif' };

/** The 3D desk covers the whole window (navbar and footer included). */
const FULLSCREEN = 'fixed inset-0 z-[60] h-[100svh] w-full overflow-hidden bg-[#1b1714]';
const CAPTION_FONT = "font-['Times_New_Roman',Times,serif]";

type Caption = { title: string; detail: string };

/** The caption at the bottom: what you're pointing at and what it does. */
function captionFor(target: DeskTarget, lidOpen: boolean, inCase: boolean): Caption | null {
  if (target === 'case') return { title: 'hanjing’s everyday essentials', detail: lidOpen ? 'click to close' : 'click to open' };
  if (target === 'contact') return { title: CONTACT_ITEM.title, detail: 'contact · click to read' };
  if (target === 'monitor') return { title: 'terminal', detail: 'click it or start typing' };
  if (target === 'sticky') return { title: 'back to the start', detail: 'choose the 3d desk or the simple site · drag to move it' };
  if (target === 'wall-note') return { title: 'back to the start', detail: 'choose the 3d desk or the simple site' };
  const item = getDeskItem(target);
  if (!item) return null;
  return { title: item.title, detail: inCase ? item.kicker : `${item.kicker} · double-click to visit` };
}

type DeskHeroProps = {
  /** The visitor wants to go back to the start (a sticky note, or `simple` in the terminal). */
  onLeave: () => void;
  onProgress?: (fraction: number) => void;
  onReady?: () => void;
  onError?: () => void;
};

/**
 * The 3D home: a full-window cozy desk with the 2000s pencil case. Open it,
 * drag the parts out onto the cutting mat, or type to use the terminal on the
 * monitor. Rendered by components/home/HomeExperience.tsx after the visitor
 * chooses 3D on the start screen.
 */
export default function DeskHero({ onLeave, onProgress, onReady, onError }: DeskHeroProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState<Caption | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hint, setHint] = useState('');
  const [deskMode, setDeskMode] = useState<DeskMode>('desk');

  const events = useMemo<DeskEvents>(
    () => ({
      onHover: (target, { lidOpen, inCase }) => setHovered(target ? captionFor(target, lidOpen, inCase) : null),
      onSelect: setSelected,
      onOpen: (href) => router.push(href),
      onHint: setHint,
      onMode: setDeskMode,
      onSimple: onLeave,
    }),
    [router, onLeave],
  );

  const typing = deskMode === 'terminal';
  const item = selected && !typing ? getDeskItem(selected) : null;
  // in the terminal the monitor explains itself, so nothing sits over the keyboard
  const caption = typing ? null : (hovered ?? { title: 'welcome to hanjing’s desk', detail: hint });

  return (
    <section aria-label="A desk with a 2000s pencil case. Drag the parts out to explore the site." className={FULLSCREEN}>
      <DeskScene
        fonts={fonts}
        events={events}
        onProgress={onProgress}
        onReady={onReady}
        onError={onError}
        className="h-full w-full"
      />

      {/* the same links for keyboard and screen-reader users */}
      <ul className="sr-only">
        {ALL_ITEMS.map((part) => (
          <li key={part.id}>
            <Link href={part.href}>{`${part.title}: ${part.summary}`}</Link>
          </li>
        ))}
      </ul>

      {/* keyboard users: back to the start screen, visible only when focused */}
      <button
        type="button"
        onClick={onLeave}
        className="sr-only left-4 top-4 bg-white px-3 py-2 text-sm text-black focus:not-sr-only focus:absolute sm:left-6 sm:top-6"
      >
        back to the start (3d or simple site)
      </button>

      {item ? (
        <div className="absolute left-4 right-4 top-4 flex flex-col gap-1.5 border border-black/10 bg-white p-4 sm:bottom-6 sm:left-auto sm:right-6 sm:top-auto sm:w-[340px]">
          <div className="flex items-start justify-between gap-3">
            <span className={`${tapeFont.className} text-xs tracking-[0.16em] text-[#c4161c] uppercase`}>{item.kicker}</span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="-m-2 inline-flex size-9 items-center justify-center text-lg leading-none text-neutral-500 hover:text-black"
            >
              ×
            </button>
          </div>
          <p className="text-xl leading-snug text-black">{item.title}</p>
          <p className="text-sm leading-relaxed text-neutral-600">{item.summary}</p>
          <Link href={item.href} className="mt-1 w-fit border-b border-black/30 text-sm text-black transition-colors hover:border-black">
            {item.cta} →
          </Link>
        </div>
      ) : null}

      {/* caption: names what you're pointing at, or how to get started */}
      {caption ? (
        <div
          aria-live="polite"
          className={`${CAPTION_FONT} pointer-events-none absolute inset-x-4 bottom-5 flex flex-col items-center gap-1 text-center text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.55)] sm:bottom-7`}
        >
          <p key={caption.title} className="text-xl leading-tight sm:text-2xl motion-safe:animate-[caption-in_0.25s_ease-out]">
            {caption.title}
          </p>
          <p className="text-sm tracking-wide text-white/75 sm:text-base">{caption.detail}</p>
        </div>
      ) : null}
    </section>
  );
}
