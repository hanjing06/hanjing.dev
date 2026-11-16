'use client';

import { useEffect, useRef, useState } from 'react';
import type { BoardScene } from './boardScene';

/** A part of a board that explains itself: hovering it shows `label` and `tip` over it. */
export type BoardPart = {
  /** Mesh names that count as this part (a prefix ends in `*`). */
  match: string;
  /** The node the label points at. */
  anchor: string;
  label: string;
  tip?: string;
};
/** What to do next: a pulsing ring on `anchor` with `text` over it (or under it, with `below`, to keep lights in view). */
export type BoardGuide = { anchor: string; text: string; below?: boolean } | null;

const MONO = 'font-mono';
// labels are divs, not <p>: globals.css gives p `text-wrap: pretty`, which beats whitespace-nowrap

export function partFor(parts: BoardPart[], name: string | null) {
  if (!name) return null;
  return parts.find((p) => (p.match.endsWith('*') ? name.startsWith(p.match.slice(0, -1)) : name === p.match)) ?? null;
}

/**
 * The labels over a board in a lab: what the part under the pointer is and
 * does, and a pulsing ring on the control to try next, so nobody has to
 * guess which switch is which. Positions follow the board every frame
 * (written straight to the DOM, not through React).
 */
export default function PartGuide({ scene, parts, guide }: { scene: BoardScene; parts: BoardPart[]; guide: BoardGuide }) {
  const [hovered, setHovered] = useState<BoardPart | null>(null);
  const tipEl = useRef<HTMLDivElement>(null);
  const tipLabel = useRef<HTMLDivElement>(null);
  const guideEl = useRef<HTMLDivElement>(null);
  const guideLabel = useRef<HTMLDivElement>(null);
  const anchors = useRef({ hover: '', guide: '', below: false });
  useEffect(() => {
    anchors.current = { hover: hovered?.anchor ?? '', guide: guide?.anchor ?? '', below: !!guide?.below };
  }, [hovered, guide]);

  useEffect(() => {
    scene.setHoverable(parts.map((p) => p.match));
    const offHover = scene.onHover((name) => setHovered(partFor(parts, name)));
    const place = (el: HTMLDivElement | null, label: HTMLDivElement | null, anchor: string, gap: number, below = false) => {
      if (!el || !anchor) return;
      const at = scene.screenOf(anchor);
      el.style.opacity = at ? '1' : '0';
      if (!at) return;
      el.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)`;
      if (!label) return;
      // centred over the part, but kept inside the stage
      const width = label.offsetWidth;
      const stage = el.parentElement?.clientWidth ?? width;
      const left = Math.min(Math.max(at.x - width / 2, 8), stage - width - 8);
      label.style.transform = below ? `translate(${(left - at.x).toFixed(1)}px, ${gap}px)` : `translate(${(left - at.x).toFixed(1)}px, calc(-100% - ${gap}px))`;
    };
    const offFrame = scene.onFrame(() => {
      place(tipEl.current, tipLabel.current, anchors.current.hover, 12);
      place(guideEl.current, guideLabel.current, anchors.current.guide, 20, anchors.current.below);
    });
    return () => {
      offHover();
      offFrame();
    };
  }, [scene, parts]);

  const showGuide = guide && guide.anchor !== hovered?.anchor;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-live="polite">
      {showGuide ? (
        <div ref={guideEl} key={guide.anchor} className="absolute left-0 top-0 opacity-0 transition-opacity duration-300 will-change-transform">
          <span className="absolute -left-4 -top-4 h-8 w-8 rounded-full border-2 border-[#f6c177] motion-safe:animate-ping" />
          <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full border-2 border-[#f6c177] bg-[#f6c177]/20" />
          <div
            key={guide.text}
            ref={guideLabel}
            className={`${MONO} absolute left-0 top-0 whitespace-nowrap rounded-md bg-[#f6c177] px-2 py-1 text-[12px] font-semibold text-[#1b1714] shadow-lg motion-safe:animate-[fade-in_0.25s_ease-out]`}
          >
            {guide.text}
          </div>
        </div>
      ) : null}
      {hovered ? (
        <div ref={tipEl} key={hovered.anchor} className="absolute left-0 top-0 opacity-0 will-change-transform">
          <div
            ref={tipLabel}
            className={`${MONO} absolute left-0 top-0 whitespace-nowrap rounded-md bg-[#0e0f10]/85 px-2.5 py-1.5 text-center text-[12px] leading-snug shadow-lg ring-1 ring-white/15 backdrop-blur motion-safe:animate-[fade-in_0.15s_ease-out]`}
          >
            <div className="font-semibold text-white">{hovered.label}</div>
            {hovered.tip ? <div className="text-white/70">{hovered.tip}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
