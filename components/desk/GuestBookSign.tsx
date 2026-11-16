'use client';

import { useRef, useState } from 'react';
import type { Signature } from './Journal';

/** Matches LIMITS.message in lib/guestbook.ts. */
const MAX_MESSAGE = 160;

/**
 * The journal's right-hand guest book page, like a chat box: a name, a
 * message, and sign (enter sends, shift+enter for a new line). Saved for
 * everyone through /api/guestbook; signing closes the journal.
 */
export default function GuestBookSign({ onSigned }: { onSigned: (entry: Signature) => void }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ kind: 'idle' | 'sending' | 'error'; text?: string }>({ kind: 'idle' });
  const honeypot = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (status.kind === 'sending') return;
    if (!message.trim()) {
      setStatus({ kind: 'error', text: 'write a message first.' });
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, website: honeypot.current?.value }),
      });
      const data = await response.json();
      if (!response.ok || !data.entry) throw new Error(data.error);
      onSigned(data.entry); // the journal closes
    } catch (error) {
      setStatus({ kind: 'error', text: (error as Error).message || 'that didn’t save. try again?' });
    }
  };

  const field = 'w-full rounded-2xl bg-white/70 px-4 text-[#2b1a10] shadow-[inset_0_1px_2px_rgba(43,26,16,0.12)] outline-none placeholder:text-[#6b4a2e]/50 focus:bg-white/90';

  return (
    <form
      className="flex h-full flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <h3 className="text-2xl leading-tight text-[#2b1a10]">leave a message for the internet!</h3>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={40}
        placeholder="name (optional)"
        aria-label="Your name (optional)"
        className={`${field} mt-5 py-2`}
      />
      {/* left empty by people; bots fill it in */}
      <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <textarea
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          if (status.kind === 'error') setStatus({ kind: 'idle' });
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        maxLength={MAX_MESSAGE}
        rows={5}
        placeholder="say hi…"
        aria-label="Your message"
        className={`${field} mt-3 resize-none py-3 leading-snug`}
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className={`text-xs ${status.kind === 'error' ? 'italic text-[#9b3b2a]' : 'text-[#6b4a2e]/70'}`} role="status">
          {status.kind === 'error' ? status.text : status.kind === 'sending' ? 'signing…' : `${message.length}/${MAX_MESSAGE}`}
        </p>
        <button
          type="submit"
          disabled={status.kind === 'sending'}
          className="shrink-0 rounded-full bg-[#2b1a10] px-5 py-1.5 text-sm text-[#f6efdc] transition-colors hover:bg-[#4a2f1e] disabled:opacity-50"
        >
          sign
        </button>
      </div>
    </form>
  );
}
