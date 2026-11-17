'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const SERIF = "font-['Times_New_Roman',Times,serif]";
/** How long putting something down takes (matches the `put-down` keyframes). */
const PUT_DOWN_MS = 320;

/** `close()` puts the current view down with its animation; views and the × use this. */
const PutDownContext = createContext<() => void>(() => undefined);
const usePutDown = () => useContext(PutDownContext);

/**
 * Something picked up off the desk and held up to look at: dims the desk,
 * shows the thing in the middle, and puts it back down (sinking and fading)
 * on esc, its × or a click outside it. `hint` is shown in brackets
 * underneath. Views with a corner to spare put a <CloseButton> there.
 */
export default function PickedUp({ children, hint, onClose, wide = false }: { children: ReactNode; hint: string; onClose: () => void; wide?: boolean }) {
  const [closing, setClosing] = useState(false);
  const timer = useRef<number | null>(null);
  const close = useCallback(() => {
    if (timer.current !== null) return;
    setClosing(true);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timer.current = window.setTimeout(onClose, reduced ? 0 : PUT_DOWN_MS);
  }, [onClose]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  return (
    <PutDownContext.Provider value={close}>
      <div
        className={`absolute inset-0 z-20 flex flex-col items-center justify-center ${wide ? 'bg-black/20 px-2 backdrop-blur-sm sm:px-4' : 'bg-black/40 px-4 backdrop-blur-[2px]'} ${closing ? 'motion-safe:animate-[fade-out_0.32s_ease-in_0.04s_forwards]' : 'motion-safe:animate-[backdrop-in_0.35s_ease-out]'}`}
        onClick={close}
      >
        <div
          onClick={(event) => event.stopPropagation()}
          className={`flex max-h-full ${wide ? 'w-full' : ''} flex-col items-center ${closing ? 'motion-safe:animate-[put-down_0.32s_cubic-bezier(0.4,0,1,1)_forwards]' : ''}`}
        >
          {children}
        </div>
        <p className={`${SERIF} mt-5 text-sm text-white/70 [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]`}>({hint})</p>
      </div>
    </PutDownContext.Provider>
  );
}

/** The plain × in the top-right corner of a picked-up view (projects, journal). */
export function CloseButton({ onClose, label = 'Put it back down', className = '' }: { onClose?: () => void; label?: string; className?: string }) {
  const putDown = usePutDown();
  const close = onClose ?? putDown;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        close();
      }}
      onKeyDown={(event) => event.stopPropagation()}
      aria-label={label}
      title="put it back down (esc)"
      className={`absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center text-2xl leading-none opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none ${className}`}
    >
      ×
    </button>
  );
}
