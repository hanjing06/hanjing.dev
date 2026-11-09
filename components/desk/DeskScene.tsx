'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { DeskEvents } from './engine';
import type { DeskFonts } from './textures';

export type DeskController = { packUp: () => void };

type DeskSceneProps = {
  fonts: DeskFonts;
  events: DeskEvents;
  /** Filled with imperative controls once the scene has loaded. */
  controllerRef?: RefObject<DeskController | null>;
  /** Called if WebGL or the model fails, so the page can fall back to lite mode. */
  onError?: () => void;
  className?: string;
};

/** Mounts the three.js desk. The engine (and three.js) is code-split and only loads here. */
export default function DeskScene({ fonts, events, controllerRef, onError, className = '' }: DeskSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef(events);
  const errorRef = useRef(onError);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    eventsRef.current = events;
    errorRef.current = onError;
  }, [events, onError]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    (async () => {
      // canvas textures need the web fonts loaded before drawing
      await Promise.all([
        document.fonts.load(`600 64px ${fonts.tape}`),
        document.fonts.load(`500 64px ${fonts.serif}`),
        document.fonts.load(`italic 64px ${fonts.serif}`),
      ]).catch(() => undefined);
      const { DeskEngine } = await import('./engine');
      if (cancelled) return;
      // forward events through a ref so React re-renders never rebuild the scene
      const engine = new DeskEngine(container, fonts, {
        onHover: (...args) => eventsRef.current.onHover?.(...args),
        onSelect: (...args) => eventsRef.current.onSelect?.(...args),
        onOpen: (...args) => eventsRef.current.onOpen?.(...args),
        onHint: (...args) => eventsRef.current.onHint?.(...args),
      });
      dispose = () => engine.dispose();
      await engine.load();
      if (cancelled) return;
      if (controllerRef) controllerRef.current = { packUp: () => engine.packUp() };
      setReady(true);
    })().catch(() => {
      if (!cancelled) errorRef.current?.();
    });

    return () => {
      cancelled = true;
      if (controllerRef) controllerRef.current = null;
      dispose?.();
    };
  }, [fonts, controllerRef]);

  return (
    <div ref={containerRef} className={`relative ${className}`} aria-hidden="true">
      {!ready ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm tracking-widest text-white/60">
          setting up the desk…
        </p>
      ) : null}
    </div>
  );
}
