'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Asks before any link leaves the site. Catches clicks on every link that
 * points to another website (GitHub, LinkedIn, Qualcomm, ...) and opens it in
 * a new tab only after the visitor says yes. Mounted once in the root layout,
 * so pages just write normal links. Email links are left alone.
 */
export default function ExternalLinkPrompt() {
  const [pending, setPending] = useState<URL | null>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const link = (event.target as Element | null)?.closest?.('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href, window.location.href);
      if (!/^https?:$/.test(url.protocol) || url.origin === window.location.origin) return;
      event.preventDefault();
      returnFocus.current = link;
      setPending(url);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  const close = useCallback(() => {
    setPending(null);
    returnFocus.current?.focus();
  }, []);

  useEffect(() => {
    if (!pending) return;
    openRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pending, close]);

  if (!pending) return null;
  const host = pending.hostname.replace(/^www\./, '');

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/20 px-6 backdrop-blur-[2px]" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leaving-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm border border-black/15 bg-white p-6 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.35)] motion-safe:animate-[caption-in_0.2s_ease-out]"
      >
        <p id="leaving-title" className="text-xl text-black">
          heading to {host}?
        </p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          this link leaves hanjing.dev and opens in a new tab.
        </p>
        <p className="mt-1 break-all text-xs text-neutral-400">{pending.href}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={close}
            className="min-h-10 px-4 text-sm text-neutral-600 transition-colors hover:text-black"
          >
            stay here
          </button>
          <button
            ref={openRef}
            type="button"
            onClick={() => {
              window.open(pending.href, '_blank', 'noopener,noreferrer');
              close();
            }}
            className="min-h-10 bg-[#1d1d1f] px-4 text-sm text-[#f5f5f7] transition-colors hover:bg-[#3a3a3c]"
          >
            open new tab ↗
          </button>
        </div>
      </div>
    </div>
  );
}
