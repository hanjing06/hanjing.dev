'use client';

import { useEffect, useRef } from 'react';
import type { DeskEvents } from './engine';
import type { DeskFonts } from './textures';

type DeskSceneProps = {
  fonts: DeskFonts;
  events: DeskEvents;
  /** Download progress of the model, 0 to 1. */
  onProgress?: (fraction: number) => void;
  /** The scene has loaded and drawn its first frames. */
  onReady?: () => void;
  /** WebGL or the model failed to load. */
  onError?: () => void;
  className?: string;
};

/** Mounts the three.js desk. The engine (and three.js) is code-split and only loads here. */
export default function DeskScene({ fonts, events, onProgress, onReady, onError, className = '' }: DeskSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // keep callbacks in refs so React re-renders never rebuild the scene
  const callbacks = useRef({ events, onProgress, onReady, onError });

  useEffect(() => {
    callbacks.current = { events, onProgress, onReady, onError };
  }, [events, onProgress, onReady, onError]);

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
      const events = () => callbacks.current.events;
      const engine = new DeskEngine(container, fonts, {
        onHover: (...args) => events().onHover?.(...args),
        onSelect: (...args) => events().onSelect?.(...args),
        onOpen: (...args) => events().onOpen?.(...args),
        onHint: (...args) => events().onHint?.(...args),
        onMode: (...args) => events().onMode?.(...args),
        onSimple: () => events().onSimple?.(),
      });
      dispose = () => engine.dispose();
      await engine.load((fraction) => callbacks.current.onProgress?.(fraction));
      if (cancelled) return;
      // give the first frames (and shader compiles) a moment before revealing
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (!cancelled) callbacks.current.onReady?.();
    })().catch(() => {
      if (!cancelled) callbacks.current.onError?.();
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [fonts]);

  return <div ref={containerRef} className={`relative ${className}`} aria-hidden="true" />;
}
