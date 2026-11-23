'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createFadeUp, easeFade, fadeUp, pageContainer } from '@/lib/motion';

const late = createFadeUp(easeFade, 0.5);

/**
 * The simple home page's opening screen: name and subheader on the left, and
 * on the right a desk lamp that takes you into the 3D desk (a speech bubble
 * says so on arrival and on hover). A quiet "scroll" cue sends everyone else
 * down the page.
 */
export default function SimpleContent({ onEnter3D }: { onEnter3D: () => void }) {
  const [lit, setLit] = useState(false);
  // the bubble says hello once on arrival, then only while the lamp is pointed at
  const [greeting, setGreeting] = useState(false);
  useEffect(() => {
    const show = window.setTimeout(() => setGreeting(true), 1200);
    const hide = window.setTimeout(() => setGreeting(false), 4200);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);
  const bubble = lit || greeting;
  const on = { onMouseEnter: () => setLit(true), onMouseLeave: () => setLit(false), onFocus: () => setLit(true), onBlur: () => setLit(false) };

  return (
    <motion.div
      variants={pageContainer}
      initial="hidden"
      animate="show"
      className="site-container relative flex min-h-screen items-center justify-between gap-6"
    >
      <div>
        <motion.h1 variants={fadeUp} className="text-6xl text-black sm:text-7xl">
          Hanjing Lin
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-4 text-xl text-neutral-600 sm:text-2xl">
          embedded systems and more
        </motion.p>
      </div>

      <motion.button
        type="button"
        variants={fadeUp}
        onClick={onEnter3D}
        {...on}
        aria-label="Enter 3D Space"
        className="relative flex shrink-0 flex-col items-center rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-black/30"
      >
        <SpeechBubble show={bubble}>Enter 3D Space.</SpeechBubble>
        <DeskLamp lit={lit} className="w-36 sm:w-56" />
      </motion.button>

      <motion.a
        variants={late}
        href="#about"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-sm text-neutral-400 transition-colors duration-200 hover:text-black"
      >
        <span className="inline-block motion-safe:animate-[scroll-cue_2.4s_ease-in-out_infinite]">scroll ↓</span>
      </motion.a>
    </motion.div>
  );
}

/** A hand-drawn speech bubble that pops up above the lamp's shade. */
function SpeechBubble({ show, children }: { show: boolean; children: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute -top-14 right-0 origin-bottom-right whitespace-nowrap rounded-2xl border-[1.5px] border-[#1a1a1a] bg-white px-4 py-2 text-base text-black transition-[opacity,scale,translate] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] sm:-top-12 sm:right-[-12px] ${
        show ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-1 scale-90 opacity-0'
      }`}
    >
      {children}
      {/* tail, pointing down at the shade */}
      <svg viewBox="0 0 20 14" className="absolute -bottom-[12px] right-10 w-5" aria-hidden="true">
        <path d="M1 0 L9 12 L17 0" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** A line-drawn architect's lamp that switches on while `lit`. */
function DeskLamp({ lit, className = '' }: { lit: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 160 170" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="desk-lamp-glow" cx="70%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#ffd48a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffd48a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <polygon
        points="104,66 134,58 158,160 70,160"
        fill="url(#desk-lamp-glow)"
        style={{ opacity: lit ? 1 : 0, transition: 'opacity 400ms ease' }}
      />
      <g fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="160" x2="156" y2="160" />
        <ellipse cx="40" cy="155" rx="26" ry="5" fill="#fff" />
        <line x1="40" y1="150" x2="58" y2="78" />
        <circle cx="58" cy="76" r="4" fill="#fff" />
        <line x1="58" y1="76" x2="112" y2="30" />
        <path d="M106 24 L122 18 L136 58 L102 66 Z" fill="#fff" />
      </g>
      <circle cx="119" cy="61" r="4" fill="#ffd48a" style={{ opacity: lit ? 1 : 0, transition: 'opacity 400ms ease' }} />
    </svg>
  );
}
