'use client';

import { useId } from 'react';

/**
 * Line drawing of the desk: architect's lamp, the pencil case with its red
 * label tape, and a mug with rising steam. `glow` (0 to 1) switches the lamp
 * on. Shared by the start screen and the simple landing page.
 */
export default function LampSketch({ glow, className = '' }: { glow: number; className?: string }) {
  const gradient = `lamp-glow-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 480 250" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={gradient} cx="50%" cy="10%" r="90%">
          <stop offset="0%" stopColor="#ffd48a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffd48a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* light cone, then the desk on top of it */}
      <polygon
        points="214,106 262,100 340,220 160,220"
        fill={`url(#${gradient})`}
        style={{ opacity: glow, transition: 'opacity 500ms ease' }}
      />
      <g fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="20" y1="220" x2="460" y2="220" />
        {/* lamp */}
        <ellipse cx="90" cy="214" rx="34" ry="6" fill="#fff" />
        <line x1="90" y1="208" x2="122" y2="112" />
        <circle cx="122" cy="110" r="5" fill="#fff" />
        <line x1="122" y1="110" x2="232" y2="70" />
        <path d="M224 66 L242 60 L262 100 L212 108 Z" fill="#fff" />
        {/* pencil case with its label tape */}
        <rect x="196" y="190" width="128" height="30" rx="6" fill="#8ecdf0" />
        <line x1="196" y1="199" x2="324" y2="199" />
        <rect x="222" y="192.5" width="64" height="5" rx="1" fill="#c4161c" stroke="none" />
        {/* mug + steam */}
        <path d="M378 180 h38 v34 a6 6 0 0 1 -6 6 h-26 a6 6 0 0 1 -6 -6 Z" fill="#fff" />
        <path d="M416 188 a10 10 0 0 1 0 20" />
        {[386, 397, 408].map((x, i) => (
          <path
            key={x}
            d={`M${x} 170 q-5 -8 0 -16 q5 -8 0 -16`}
            stroke="#9a9a9a"
            strokeWidth="1.5"
            className="motion-safe:animate-[gate-steam_3s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.6}s` }}
          />
        ))}
      </g>
      <circle cx="237" cy="101" r="5" fill="#ffd48a" style={{ opacity: glow, transition: 'opacity 500ms ease' }} />
    </svg>
  );
}
