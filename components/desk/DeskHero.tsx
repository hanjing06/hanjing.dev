'use client';

import { Barlow_Condensed } from 'next/font/google';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DeskScene from './DeskScene';
import IdCard from './IdCard';
import Journal from './Journal';
import ProjectLab from './lab/ProjectLab';
import type { CdSong, DeskControls, DeskEvents, DeskMode, DeskTarget } from './engine';
import { song } from '@/content/music';
import { projects } from '@/content/projects';
import { getSticker } from '@/content/stickers';
import { ALL_ITEMS, getDeskItem } from './items';
import type { DeskFonts } from './textures';

const tapeFont = Barlow_Condensed({ weight: '600', subsets: ['latin'] });
const fonts: DeskFonts = { tape: tapeFont.style.fontFamily, serif: 'Lora, Georgia, serif' };

/** The 3D desk covers the whole window (navbar and footer included). */
const FULLSCREEN = 'fixed inset-0 z-[60] h-[100svh] w-full overflow-hidden bg-[#1b1714]';
const CAPTION_FONT = "font-['Times_New_Roman',Times,serif]";

type Caption = {
  title: string;
  /** Plain lines under the title (a sticker's role and dates). */
  lines?: string[];
  /** How to use it, shown in brackets, e.g. "(double-click or press enter to read the write-up)". */
  hint?: string;
};
type HoverState = { lidOpen: boolean; inCase: boolean; lampOn: boolean };

/** The caption at the bottom: what you're pointing at and what it does. */
function captionFor(target: DeskTarget, { lidOpen, lampOn }: HoverState, musicOpen: boolean, live: LiveSong | null): Caption | null {
  if (target === 'case') return { title: 'hanjing’s everyday essentials', hint: lidOpen ? 'click to close it' : 'click the pencil case to see what’s inside!' };
  if (target === 'contact') return { title: 'property of hanjing lin', hint: lidOpen ? 'click to close it' : 'click the pencil case to see what’s inside!' };
  if (target === 'lamp') return { title: 'desk lamp', hint: lampOn ? 'click to turn off' : 'click to turn on' };
  if (target === 'monitor') return { title: 'terminal', hint: 'click or start typing' };
  if (target === 'sticky') return { title: 'the normal website', hint: 'click to switch' };
  if (target === 'wall-note') return { title: 'the simple site', hint: 'click to switch' };
  if (target.startsWith('sticker:')) {
    const sticker = getSticker(target.slice('sticker:'.length));
    return sticker ? { title: sticker.title, lines: [sticker.role, sticker.when] } : null;
  }
  const item = getDeskItem(target);
  return item ? { title: titleOf(item.id, item.title, live), hint: openHint(item.id, item.cta, musicOpen, live) } : null;
}

/** The latest song from Spotify (app/api/now-playing), when it's set up; `audio` is its 30-second preview, if Apple has one. */
type LiveSong = CdSong & { playing: boolean; audio?: string };

/** The CD plays quietly: it fades up to this volume, and back down when it stops. */
const VOLUME = 0.3;
const FADE_IN_S = 2.5;
const FADE_OUT_S = 1.2;

type Player = { el: HTMLAudioElement; src: string; ctx: AudioContext | null; gain: GainNode | null; stopTimer: number | null };

/** Glide the volume to `to` over `seconds` (Web Audio where there is one: iOS ignores `audio.volume`). */
function fadeTo(p: Player, to: number, seconds: number) {
  if (p.ctx && p.gain) {
    const g = p.gain.gain;
    const now = p.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(to, now + seconds);
    return;
  }
  const from = p.el.volume;
  const start = performance.now();
  const step = () => {
    const k = Math.min(1, (performance.now() - start) / (seconds * 1000));
    p.el.volume = from + (to - from) * k;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** The CD is named after its song: the live one when there is one. */
function titleOf(id: string, title: string, live: LiveSong | null) {
  if (id !== 'music' || !live) return title;
  return `${live.playing ? 'now playing: ' : ''}${live.title} · ${live.artist}`;
}

/** How to open a part: the CD plays, everything else opens with a double-click or enter. */
function openHint(id: string, cta: string, musicOpen: boolean, live: LiveSong | null) {
  // a live song without a preview has nothing to play, so the case just opens
  if (id === 'music' && live && !live.audio) return `double-click or press enter to ${musicOpen ? 'close' : 'open'} the case`;
  if (id === 'music') return `double-click or press enter to ${musicOpen ? 'stop' : 'listen'}`;
  return `double-click or press enter to ${cta}`;
}

type DeskHeroProps = {
  /** The visitor wants the simple site (a sticky note, or `simple` in the terminal). */
  onSimple: () => void;
  onProgress?: (fraction: number) => void;
  onReady?: () => void;
  onError?: () => void;
};

/**
 * The 3D home: a full-window cozy desk with the 2000s pencil case. Open it,
 * drag the parts out onto the cutting mat, or type to use the terminal on the
 * monitor. Parts are picked up and shown over the desk; only the notes leave, for
 * the simple site. Rendered by components/home/HomeExperience.tsx after the
 * visitor chooses 3D.
 */
export default function DeskHero({ onSimple, onProgress, onReady, onError }: DeskHeroProps) {
  const controls = useRef<DeskControls | null>(null);
  const [hovered, setHovered] = useState<{ target: DeskTarget; state: HoverState } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [musicOpen, setMusicOpen] = useState(false);
  /** The part picked up and shown over the desk, if any. */
  const [opened, setOpened] = useState<string | null>(null);
  const [hint, setHint] = useState('');
  const [deskMode, setDeskMode] = useState<DeskMode>('desk');
  const [live, setLive] = useState<LiveSong | null>(null);
  const liveRef = useRef<LiveSong | null>(null);

  // the CD shows what Hanjing's listening to on Spotify, if that's set up
  useEffect(() => {
    let cancelled = false;
    fetch('/api/now-playing')
      .then((r) => r.json())
      .then((data: { song: LiveSong | null }) => {
        if (cancelled || !data.song) return;
        liveRef.current = data.song;
        setLive(data.song);
        controls.current?.setSong(data.song);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  // if the song arrived before the desk did, put it on once the desk is ready
  const ready = useCallback(() => {
    if (liveRef.current) controls.current?.setSong(liveRef.current);
    onReady?.();
  }, [onReady]);

  const events = useMemo<DeskEvents>(
    () => ({
      onHover: (target, state) => setHovered(target ? { target, state } : null),
      onSelect: setSelected,
      onMusic: setMusicOpen,
      onOpen: (id) => {
        controls.current?.setCovered(true);
        setOpened(id);
      },
      onHint: setHint,
      onMode: setDeskMode,
      onSimple,
    }),
    [onSimple],
  );

  const putDown = useCallback(() => {
    controls.current?.setCovered(false);
    setOpened(null);
  }, []);

  const typing = deskMode === 'terminal';
  const item = selected && selected !== 'contact' && !typing ? getDeskItem(selected) : null;
  // the selected part speaks through the caption (no card over the scene):
  // its title and how to open it
  const selectedCaption: Caption | null = item ? { title: titleOf(item.id, item.title, live), hint: openHint(item.id, item.cta, musicOpen, live) } : null;

  // The CD's song plays while its case is open: the live song's preview, or
  // the file in content/music.ts. It fades in quietly and fades out when the
  // case closes; near the end of the clip the case closes by itself.
  const source = live ? (live.audio ?? '') : song.audio;
  const player = useRef<Player | null>(null);
  useEffect(() => {
    if (!source) return;
    let p = player.current;
    if (musicOpen) {
      if (!p || p.src !== source) {
        p?.el.pause();
        void p?.ctx?.close();
        const el = new Audio(source);
        el.preload = 'auto';
        let ctx: AudioContext | null = null;
        let gain: GainNode | null = null;
        try {
          ctx = new AudioContext();
          gain = ctx.createGain();
          gain.gain.value = 0;
          ctx.createMediaElementSource(el).connect(gain).connect(ctx.destination);
        } catch {
          ctx = null;
          gain = null;
          el.volume = 0;
        }
        p = { el, src: source, ctx, gain, stopTimer: null };
        player.current = p;
      }
      const current = p;
      if (current.stopTimer !== null) window.clearTimeout(current.stopTimer);
      current.stopTimer = null;
      current.el.ontimeupdate = () => {
        const left = current.el.duration - current.el.currentTime;
        if (Number.isFinite(left) && left < FADE_OUT_S + 0.2) controls.current?.setMusic(false);
      };
      current.el.onended = () => controls.current?.setMusic(false);
      void current.ctx?.resume();
      current.el.play().catch(() => undefined);
      fadeTo(current, VOLUME, FADE_IN_S);
    } else if (p && !p.el.paused) {
      const current = p;
      fadeTo(current, 0, FADE_OUT_S);
      current.stopTimer = window.setTimeout(() => {
        current.el.pause();
        current.el.currentTime = 0;
        current.stopTimer = null;
      }, FADE_OUT_S * 1000);
    }
  }, [musicOpen, source]);
  useEffect(
    () => () => {
      const p = player.current;
      if (!p) return;
      if (p.stopTimer !== null) window.clearTimeout(p.stopTimer);
      p.el.pause();
      void p.ctx?.close();
    },
    [],
  );
  // leaving the desk (for the simple site) closes the CD, so its song fades out
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) controls.current?.setMusic(false);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const hoverCaption = hovered && hovered.target !== selected ? captionFor(hovered.target, hovered.state, musicOpen, live) : null;
  // in the terminal the monitor explains itself, so nothing sits over the keyboard
  const caption = typing || opened ? null : (hoverCaption ?? selectedCaption ?? { title: 'welcome to hanjing’s desk', hint });

  return (
    <section ref={sectionRef} aria-label="A desk with a 2000s pencil case. Drag the parts out to explore the site." className={FULLSCREEN}>
      <DeskScene
        fonts={fonts}
        events={events}
        onProgress={onProgress}
        onReady={ready}
        onError={onError}
        controlsRef={controls}
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

      {/* keyboard users: the simple site, visible only when focused */}
      <button
        type="button"
        onClick={onSimple}
        className="sr-only left-4 top-4 bg-white px-3 py-2 text-sm text-black focus:not-sr-only focus:absolute sm:left-6 sm:top-6"
      >
        go to the simple site
      </button>

      {opened ? <OpenedPart id={opened} onClose={putDown} /> : null}

      {/* caption: names what you're pointing at, or how to get started */}
      {caption ? (
        <div
          aria-live="polite"
          className={`${CAPTION_FONT} pointer-events-none absolute inset-x-4 bottom-5 flex flex-col items-center gap-1 text-center text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.55)] sm:bottom-7`}
        >
          <p key={caption.title} className="text-xl leading-tight sm:text-2xl motion-safe:animate-[caption-in_0.25s_ease-out]">
            {caption.title}
          </p>
          {caption.lines?.map((line) => (
            <p key={line} className="max-w-xl text-sm tracking-wide text-white/75 sm:text-base">
              {line}
            </p>
          ))}
          {caption.hint ? <p className="max-w-xl text-sm tracking-wide text-white/60 sm:text-base">({caption.hint})</p> : null}
        </div>
      ) : null}
    </section>
  );
}

/** What a picked-up part looks like up close: the ID card, a project's lab or the journal. */
function OpenedPart({ id, onClose }: { id: string; onClose: () => void }) {
  if (id === 'blog') return <Journal onClose={onClose} />;
  if (id === 'about') return <IdCard onClose={onClose} />;
  const project = projects.find((p) => p.slug === id);
  return project ? <ProjectLab project={project} onClose={onClose} /> : null;
}
