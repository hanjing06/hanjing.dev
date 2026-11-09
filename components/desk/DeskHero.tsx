'use client';

import { Barlow_Condensed } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import DeskScene, { type DeskController } from './DeskScene';
import type { DeskEvents, DeskTarget } from './engine';
import { ALL_ITEMS, CONTACT_ITEM, getDeskItem } from './items';
import type { DeskFonts } from './textures';

const tapeFont = Barlow_Condensed({ weight: '600', subsets: ['latin'] });
const fonts: DeskFonts = { tape: tapeFont.style.fontFamily, serif: "Lora, Georgia, serif" };

// ---------------------------------------------------------------- 3D vs lite preference

type Mode = '3d' | 'lite';
const MODE_KEY = 'hanjing.hero-mode';
const listeners = new Set<() => void>();
let autoLite: boolean | null = null;

/** Lite by default when WebGL is missing, the machine is low-end, or motion is reduced. */
function prefersLite() {
  if (autoLite !== null) return autoLite;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  let webgl = false;
  try {
    const probe = document.createElement('canvas');
    webgl = !!(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    webgl = false;
  }
  const lowEnd = (nav.hardwareConcurrency ?? 8) <= 4 && (nav.deviceMemory ?? 8) <= 4;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  autoLite = !webgl || lowEnd || reduced || !!nav.connection?.saveData;
  return autoLite;
}

function readMode(): Mode {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === '3d' || stored === 'lite') return stored;
  } catch {
    // storage blocked: fall through to detection
  }
  return prefersLite() ? 'lite' : '3d';
}

function writeMode(mode: Mode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // storage blocked: the choice lasts until reload
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---------------------------------------------------------------- hero

/** The 3D version covers the whole window (navbar and footer included). */
const FULLSCREEN = 'fixed inset-0 z-[60] h-[100svh] w-full overflow-hidden bg-[#1b1714]';

type Caption = { title: string; detail: string };

/** The subtle title at the bottom: what you're pointing at and where it leads. */
function captionFor(target: DeskTarget, lidOpen: boolean, inCase: boolean): Caption | null {
  if (target === 'case') return { title: 'the pencil case', detail: lidOpen ? 'click to close it' : 'click to open it' };
  if (target === 'contact') return { title: CONTACT_ITEM.title, detail: 'contact · click to read' };
  const item = getDeskItem(target);
  if (!item) return null;
  return { title: item.title, detail: `${item.kicker} · ${inCase ? 'drag it out' : 'double-click to visit'}` };
}

/**
 * Home-page hero: a full-window cozy desk with the 2000s pencil case. Open it,
 * drag the parts out onto the cutting mat, and each one leads to a page of
 * the site. Low-powered machines get the lite version: the same links, no
 * WebGL, with the normal navbar and footer.
 */
export default function DeskHero() {
  const router = useRouter();
  const storedMode = useSyncExternalStore(subscribe, readMode, () => null);
  const [failed, setFailed] = useState(false);
  const mode: Mode | null = failed ? 'lite' : storedMode;

  const [hovered, setHovered] = useState<Caption | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hint, setHint] = useState('setting up the desk…');
  const controllerRef = useRef<DeskController | null>(null);

  const events = useMemo<DeskEvents>(
    () => ({
      onHover: (target, { lidOpen, inCase }) => setHovered(target ? captionFor(target, lidOpen, inCase) : null),
      onSelect: setSelected,
      onOpen: (href) => router.push(href),
      onHint: setHint,
    }),
    [router],
  );
  const onError = useCallback(() => setFailed(true), []);

  // the full-window desk shouldn't scroll the (hidden) page underneath it
  const fullscreen = mode !== 'lite';
  useEffect(() => {
    if (!fullscreen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [fullscreen]);

  const item = selected ? getDeskItem(selected) : null;
  const caption = hovered ?? { title: 'Hanjing Lin', detail: hint };

  if (mode === null) {
    // server render / first paint: the desk's background, so the navbar never flashes
    return <section aria-label="Pencil case desk" className={FULLSCREEN} />;
  }

  if (mode === 'lite') {
    return (
      <section aria-label="Pencil case contents" className="w-full border-b border-black/10 bg-[#2c6b66] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="site-container flex flex-col gap-6 py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className={`${tapeFont.className} -rotate-1 bg-[#c4161c] px-3 py-1.5 text-sm tracking-[0.22em] text-[#fff4f4]`}>
              PROPERTY OF HANJING LIN
            </p>
            <button
              type="button"
              onClick={() => {
                setFailed(false);
                writeMode('3d');
              }}
              className="min-h-11 border border-white/30 bg-white/10 px-4 text-sm tracking-wider text-white transition-colors duration-200 hover:bg-white/20"
            >
              3d version
            </button>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ALL_ITEMS.map((part) => (
              <li key={part.id}>
                <Link
                  href={part.href}
                  className="flex h-full flex-col gap-1 border border-black/10 bg-white p-4 transition-transform duration-200 hover:-translate-y-1 hover:-rotate-[0.6deg]"
                >
                  <span className={`${tapeFont.className} text-xs tracking-[0.16em] text-[#c4161c] uppercase`}>{part.kicker}</span>
                  <span className="text-lg text-black">{part.title}</span>
                  <span className="text-sm text-neutral-600">{part.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="A desk with a 2000s pencil case. Drag the parts out to explore the site." className={FULLSCREEN}>
      <DeskScene fonts={fonts} events={events} controllerRef={controllerRef} onError={onError} className="h-full w-full" />

      {/* the same links for keyboard and screen-reader users */}
      <ul className="sr-only">
        {ALL_ITEMS.map((part) => (
          <li key={part.id}>
            <Link href={part.href}>{`${part.title}: ${part.summary}`}</Link>
          </li>
        ))}
      </ul>

      <div className="absolute right-4 top-4 flex gap-2 sm:right-6 sm:top-6">
        <button
          type="button"
          onClick={() => controllerRef.current?.packUp()}
          className="min-h-9 bg-white/80 px-3 text-sm text-black transition-colors duration-200 hover:bg-white"
        >
          put everything back
        </button>
        <button
          type="button"
          onClick={() => writeMode('lite')}
          className="min-h-9 bg-white/80 px-3 text-sm text-black transition-colors duration-200 hover:bg-white"
        >
          lite version
        </button>
      </div>

      {item ? (
        <div className="absolute left-4 right-4 top-16 flex flex-col gap-1.5 border border-black/10 bg-white p-4 sm:bottom-6 sm:left-auto sm:right-6 sm:top-auto sm:w-[340px]">
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

      {/* subtle title: names what you're pointing at and where it leads */}
      <div
        aria-live="polite"
        className="pointer-events-none absolute inset-x-4 bottom-5 flex flex-col items-center gap-1 text-center text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.55)] sm:bottom-7"
      >
        <p key={caption.title} className="text-lg leading-tight tracking-wide sm:text-xl motion-safe:animate-[caption-in_0.25s_ease-out]">
          {caption.title}
        </p>
        <p className={`${tapeFont.className} text-[11px] tracking-[0.2em] text-white/70 uppercase sm:text-xs`}>{caption.detail}</p>
      </div>
    </section>
  );
}
