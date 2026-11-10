'use client';

import { useState } from 'react';
import { COPY, GATE_FONT, loadingLabel, type GateProps } from './shared';

/**
 * Prototype 1: a line drawing of the desk. The architect's lamp switches on
 * while you hover "enter", and warms up as the 3D desk loads.
 */
export default function LampGate({ stage, progress, recommendSimple, error, onEnter, onSimple }: GateProps) {
  const [hoverEnter, setHoverEnter] = useState(false);
  const loading = stage === 'loading';
  const glow = loading ? 0.35 + 0.65 * progress : hoverEnter ? 1 : 0;
  const simpleFirst = !!recommendSimple || error;

  const enter = (
    <ChoiceButton
      primary={!simpleFirst}
      label={COPY.enter}
      detail={COPY.enterDetail}
      onClick={onEnter}
      onHover={setHoverEnter}
    />
  );
  const simple = <ChoiceButton primary={simpleFirst} label={COPY.simple} detail={COPY.simpleDetail} onClick={onSimple} />;

  return (
    <main className={`${GATE_FONT} flex h-full flex-col items-center justify-center gap-8 px-6 text-center`}>
      <svg viewBox="0 0 480 250" className="w-full max-w-[460px]" aria-hidden="true">
        <defs>
          <radialGradient id="lamp-glow" cx="50%" cy="10%" r="90%">
            <stop offset="0%" stopColor="#ffd48a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffd48a" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* light cone, then the desk on top of it */}
        <polygon
          points="214,106 262,100 340,220 160,220"
          fill="url(#lamp-glow)"
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

      <div className="flex flex-col items-center gap-2">
        <h1 className="text-5xl tracking-wide sm:text-6xl">{COPY.title}</h1>
        <p className="text-lg text-neutral-500">pull up a chair.</p>
      </div>

      {loading ? (
        <div className="flex w-64 flex-col items-center gap-3" role="status" aria-live="polite">
          <div className="relative h-px w-full bg-neutral-200">
            <div className="absolute inset-y-0 left-0 bg-black transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="text-sm text-neutral-500">{loadingLabel(progress)}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            {simpleFirst ? simple : enter}
            {simpleFirst ? enter : simple}
          </div>
          {error || recommendSimple ? <p className="max-w-sm text-sm text-neutral-500">{error ? COPY.error : COPY.recommend}</p> : null}
        </div>
      )}
    </main>
  );
}

function ChoiceButton({
  primary,
  label,
  detail,
  onClick,
  onHover,
}: {
  primary: boolean;
  label: string;
  detail: string;
  onClick: () => void;
  onHover?: (hovering: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onFocus={() => onHover?.(true)}
      onBlur={() => onHover?.(false)}
      className={`flex min-h-11 w-64 flex-col items-center gap-0.5 border-[1.5px] px-5 py-3 transition-[background-color,color,scale] duration-200 active:scale-[0.97] ${
        primary
          ? 'border-transparent bg-[#1d1d1f] text-[#f5f5f7] hover:bg-[#3a3a3c]'
          : 'border-[#1d1d1f] text-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-[#f5f5f7]'
      }`}
    >
      <span className="text-lg">{label} →</span>
      <span className={`text-xs ${primary ? 'text-[#f5f5f7]/70' : 'opacity-70'}`}>{detail}</span>
    </button>
  );
}
