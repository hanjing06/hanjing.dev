'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { posts } from '@/content/posts';
import GuestBookSign from './GuestBookSign';
import { CloseButton } from './PickedUp';

/**
 * The journal on the desk, opened over the scene: a welcome page, contents,
 * one entry per blog post, then the guest book: signatures on the left,
 * "leave a message for the internet!" on the right, where visitors write or
 * draw (shared with everyone, see lib/guestbook.ts).
 *
 * Two-page spreads that turn like paper on wide screens; one page at a time
 * on narrow ones. Arrow keys flip, esc closes.
 */

export type Signature = { id: string; name: string; message: string; at: string };

type Page = { key: string; body: ReactNode };

const FLIP_MS = 650;
const SHUT_MS = 520;
const AWAY_MS = 420;
/**
 * Packing messages onto guest book pages without scrolling: a rough height
 * for each (name, date, one line per ~MESSAGE_LINE characters) against what a
 * page holds, in pixels.
 */
const PAGE_ROOM = 420;
const MESSAGE_LINE = 40;
const messageHeight = (s: Signature) => 52 + Math.ceil(s.message.length / MESSAGE_LINE) * 22;
const SERIF = "font-['Times_New_Roman',Times,serif]";

/** Splits a post's paragraphs into two roughly even pages. */
function halves(body: string[]): [string[], string[]] {
  const total = body.reduce((n, p) => n + p.length, 0);
  let count = 0;
  const cut = body.findIndex((p) => (count += p.length) > total / 2);
  const at = Math.max(1, cut);
  return [body.slice(0, at), body.slice(at)];
}

/** Pages before the guest book: the welcome page, contents, and two per post. */
const FRONT_PAGES = 2 + posts.length * 2;

/**
 * Splits signatures (newest first) into pages, newest page first. Always an
 * odd number of pages, so the sign page after them lands on the right and the
 * newest messages face it.
 */
function guestPages(signatures: Signature[]): Signature[][] {
  const pages: Signature[][] = [];
  let room = 0;
  for (const s of signatures) {
    const h = messageHeight(s);
    if (!pages.length || room < h) {
      pages.push([]);
      room = PAGE_ROOM;
    }
    pages[pages.length - 1].push(s);
    room -= h;
  }
  if (!pages.length) pages.push([]);
  if ((FRONT_PAGES + pages.length) % 2 === 0) {
    // split the fullest page in two, or add an empty one
    const i = pages.reduce((best, p, j) => (p.length > pages[best].length ? j : best), 0);
    const half = Math.ceil(pages[i].length / 2);
    if (pages[i].length > 1) pages.splice(i, 1, pages[i].slice(0, half), pages[i].slice(half));
    else pages.push([]);
  }
  return pages;
}

function dateOf(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase();
}

export default function Journal({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<Signature[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [wide, setWide] = useState(true);
  const [at, setAt] = useState(0);
  const [turn, setTurn] = useState<{ from: number; to: number } | null>(null);
  /** Closing: the book shuts (right page onto the left), then slides away. */
  const [closing, setClosing] = useState<'shut' | 'away' | null>(null);
  const closeTimers = useRef<number[]>([]);
  const close = useCallback(() => {
    if (closeTimers.current.length) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return onClose();
    const spreads = window.matchMedia('(min-width: 768px)').matches;
    setClosing(spreads ? 'shut' : 'away');
    const shutMs = spreads ? SHUT_MS : 0;
    closeTimers.current = [window.setTimeout(() => setClosing('away'), shutMs), window.setTimeout(onClose, shutMs + AWAY_MS)];
  }, [onClose]);
  useEffect(() => () => closeTimers.current.forEach((t) => window.clearTimeout(t)), []);
  const bookRef = useRef<HTMLDivElement>(null);
  // where the book is, for handlers that outlive a render (contents, keys)
  const place = useRef({ at: 0, turning: false, last: 0, wide: true });

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const update = () => setWide(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/guestbook')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setEntries(data.entries ?? []);
        if (data.error) setLoadError(data.error);
      })
      .catch(() => {
        if (!cancelled) {
          setEntries([]);
          setLoadError('the guest book couldn’t be opened right now.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => bookRef.current?.focus(), []);

  /** Turn to a page (on wide screens, to the spread that holds it). */
  const goTo = useCallback((page: number) => {
    const { at: from, turning, last: end, wide: spreads } = place.current;
    const target = Math.max(0, Math.min(end, spreads ? page - (page % 2) : page));
    if (turning || target === from) return;
    place.current.turning = true;
    setTurn({ from, to: target });
    window.setTimeout(() => {
      setAt(target);
      setTurn(null);
    }, FLIP_MS);
  }, []);

  // signing closes the book; the new signature is first in the guest book next time
  const signed = useCallback(
    (entry: Signature) => {
      setEntries((list) => [entry, ...(list ?? [])]);
      close();
    },
    [close],
  );

  const pages = useMemo<Page[]>(() => {
    const list: Page[] = [];
    const contentsAt: { label: string; page: number }[] = [];
    list.push({
      key: 'inside-cover',
      body: (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <p className="text-3xl text-[#2b1a10]">welcome to my journal.</p>
          <p className="mt-4 text-base italic text-[#6b4a2e]">this book belongs to hanjing lin.</p>
        </div>
      ),
    });
    list.push({ key: 'contents', body: null });
    for (const post of posts) {
      const [first, second] = halves(post.body);
      contentsAt.push({ label: post.title, page: list.length });
      list.push({
        key: `${post.slug}-1`,
        body: (
          <>
            <p className="text-xs uppercase text-[#9a6b4a]">{post.kicker}</p>
            <h3 className="mt-2 text-2xl text-[#2b1a10]">{post.title}</h3>
            {first.map((p) => (
              <p key={p} className="mt-3 leading-relaxed">{p}</p>
            ))}
          </>
        ),
      });
      list.push({
        key: `${post.slug}-2`,
        body: (
          <>
            {second.map((p) => (
              <p key={p} className="mb-3 leading-relaxed">{p}</p>
            ))}
            <p className="mt-4 text-right italic text-[#6b4a2e]">— hanjing, {post.dateLabel}</p>
          </>
        ),
      });
    }
    // the guest book reads like a chat: oldest at the top of a page, newest
    // at the bottom of the left page, facing the message box on the right
    const signatures = entries ?? [];
    const chunks = guestPages(signatures);
    for (let i = chunks.length - 1; i >= 0; i -= 1) {
      const thread = [...chunks[i]].reverse();
      list.push({
        key: `guests-${i}`,
        body: (
          <>
            <h3 className="text-2xl leading-tight text-[#2b1a10]">guest book</h3>
            {entries === null ? (
              <p className="mt-5 italic text-[#6b4a2e]">opening the guest book…</p>
            ) : thread.length ? (
              <ul className="mt-5 space-y-4">
                {thread.map((s) => (
                  <li key={s.id}>
                    <p className="text-sm leading-tight text-[#2b1a10]">From: {s.name}</p>
                    <p className="text-[11px] leading-tight text-[#9a6b4a]">{dateOf(s.at)}</p>
                    <p className="mt-1.5 w-fit max-w-full break-words rounded-2xl rounded-tl-sm bg-white/75 px-3.5 py-2 leading-snug text-[#2b1a10] shadow-[0_1px_2px_rgba(43,26,16,0.12)]">
                      {s.message}
                    </p>
                  </li>
                ))}
              </ul>
            ) : i === 0 && !signatures.length ? (
              <p className="mt-5 italic text-[#6b4a2e]">{loadError || 'no messages yet. be the first!'}</p>
            ) : null}
          </>
        ),
      });
    }
    contentsAt.push({ label: 'guest book', page: list.length });
    list.push({ key: 'sign', body: <GuestBookSign onSigned={signed} /> });

    list[1] = {
      key: 'contents',
      body: (
        <>
          <h3 className="text-2xl text-[#2b1a10]">contents</h3>
          <ol className="mt-4 space-y-2">
            {contentsAt.map(({ label, page }) => (
              <li key={label}>
                <button type="button" data-page={page} className="flex w-full items-baseline gap-2 text-left hover:text-black" onClick={(e) => goTo(Number(e.currentTarget.dataset.page))}>
                  <span>{label}</span>
                  <span className="flex-1 border-b border-dotted border-[#2b1a10]/30" />
                  <span className="text-sm text-[#6b4a2e]">{page + 1}</span>
                </button>
              </li>
            ))}
          </ol>
        </>
      ),
    };
    return list;
  }, [entries, loadError, signed, goTo]);

  const step = wide ? 2 : 1;
  const last = wide ? Math.floor((pages.length - 1) / 2) * 2 : pages.length - 1;

  useEffect(() => {
    place.current = { at, turning: !!turn, last, wide };
  });



  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = (event.target as HTMLElement | null)?.closest?.('input, textarea');
      if (event.key === 'Escape') close();
      else if (typing) return;
      else if (event.key === 'ArrowRight') goTo(at + step);
      else if (event.key === 'ArrowLeft') goTo(at - step);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const page = (index: number, side: 'left' | 'right' | 'single') => {
    const p = pages[index];
    const edge = side === 'left' ? 'rounded-l-md' : side === 'right' ? 'rounded-r-md' : 'rounded-md';
    return (
      <div
        className={`${SERIF} relative h-full overflow-hidden bg-[#f6efdc] px-7 py-8 text-[15px] text-[#3a2a1e] ${edge}`}
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 27px, rgba(43,26,16,0.07) 27px 28px)',
          boxShadow: side === 'left' ? 'inset -18px 0 24px -20px rgba(0,0,0,0.35)' : side === 'right' ? 'inset 18px 0 24px -20px rgba(0,0,0,0.35)' : undefined,
        }}
      >
        {p?.body}
        {p && p.key !== 'blank' ? <span className="absolute bottom-3 left-0 right-0 text-center text-xs text-[#6b4a2e]/70">{index + 1}</span> : null}
      </div>
    );
  };

  const shown = turn ? (turn.to > turn.from ? turn.to : turn.from) : at;
  const forward = turn ? turn.to > turn.from : false;

  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/45 px-4 backdrop-blur-[1px] ${closing === 'away' ? 'animate-[fade-out_0.5s_ease-in_forwards]' : 'motion-safe:animate-[caption-in_0.3s_ease-out]'}`}
      onClick={close}
    >
      <div className={`w-full max-w-[920px] ${closing === 'away' ? 'animate-[journal-away_0.42s_cubic-bezier(0.4,0,1,1)_forwards]' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div ref={bookRef} tabIndex={-1} aria-label="hanjing’s journal" className={`relative mx-auto h-[min(600px,72svh)] outline-none ${wide ? 'w-full' : 'w-full max-w-[460px]'} rounded-lg bg-[#7a2e24] p-2.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]`} style={{ perspective: 2200, outline: 'none' }}>
          {wide ? (
            <div className="relative grid h-full grid-cols-2">
              {/* the spread underneath: while a page turns it already shows where you're going */}
              {page(turn ? (forward ? turn.from : turn.to) : at, 'left')}
              {page((turn ? (forward ? turn.to : turn.from) : at) + 1, 'right')}
              {turn ? (
                <div
                  className="absolute top-0 h-full w-1/2"
                  style={{
                    left: forward ? '50%' : 0,
                    transformOrigin: forward ? 'left center' : 'right center',
                    transformStyle: 'preserve-3d',
                    animation: `${forward ? 'journal-turn-forward' : 'journal-turn-back'} ${FLIP_MS}ms cubic-bezier(0.45, 0, 0.2, 1) forwards`,
                  }}
                >
                  <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                    {page(forward ? turn.from + 1 : turn.from, forward ? 'right' : 'left')}
                  </div>
                  <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    {page(forward ? turn.to : turn.to + 1, forward ? 'left' : 'right')}
                  </div>
                </div>
              ) : null}
              <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-black/15" />
              {closing ? (
                // shutting: the right page (with the cover on its back) folds over onto the left
                <div
                  className="absolute top-0 h-full w-1/2"
                  style={{ left: '50%', transformOrigin: 'left center', transformStyle: 'preserve-3d', animation: `journal-shut ${SHUT_MS}ms cubic-bezier(0.5, 0, 0.3, 1) forwards` }}
                >
                  <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                    {page(at + 1, 'right')}
                  </div>
                  <div className="absolute inset-0 rounded-l-md bg-[#7a2e24]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <div className="absolute inset-3 rounded-sm border border-[#f6efdc]/25" />
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div key={turn ? turn.to : at} className="h-full motion-safe:animate-[caption-in_0.3s_ease-out]">
              {page(turn ? turn.to : at, 'single')}
            </div>
          )}
          {closing ? null : <CloseButton onClose={close} label="Close the journal" className="right-5 top-5 text-[#2b1a10]" />}
        </div>

        <div className={`${SERIF} mt-4 flex items-center justify-between text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]`}>
          <button type="button" onClick={() => goTo(at - step)} disabled={at === 0} className="px-2 py-1 text-lg disabled:opacity-30">
            ← back
          </button>
          <p className="text-sm text-white/70">(← → to flip · esc to close)</p>
          <button type="button" onClick={() => goTo(at + step)} disabled={shown >= last} className="px-2 py-1 text-lg disabled:opacity-30">
            next →
          </button>
        </div>
      </div>
    </div>
  );
}
