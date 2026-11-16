import { randomUUID } from 'node:crypto';
import { addSignature, LIMITS, listSignatures } from '@/lib/guestbook';

export const dynamic = 'force-dynamic';

/** A few signatures per visitor per window, per server instance. */
const RATE = { max: 3, windowMs: 10 * 60 * 1000 };
const recent = new Map<string, number[]>();

function tooMany(ip: string) {
  const now = Date.now();
  const times = (recent.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  recent.set(ip, [...times, now]);
  return times.length >= RATE.max;
}

/** Collapse whitespace and drop control characters. */
function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

export async function GET() {
  try {
    // text only: older drawing-only entries are left out, and drawings aren't sent
    const entries = (await listSignatures()).filter((e) => e.message).map(({ id, name, message, at }) => ({ id, name, message, at }));
    return Response.json({ entries });
  } catch {
    return Response.json({ entries: [], error: 'the guest book is resting right now.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'that didn’t come through. try again?' }, { status: 400 });
  }
  // a field people never see; bots fill it in
  if (clean(body.website, 100)) return Response.json({ ok: true });

  const name = clean(body.name, LIMITS.name) || 'a visitor';
  const message = clean(body.message, LIMITS.message);
  if (!message) return Response.json({ error: 'write a message first.' }, { status: 400 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (tooMany(ip)) return Response.json({ error: 'thanks for all the love! try again in a few minutes.' }, { status: 429 });

  const entry = { id: randomUUID(), name, message, at: new Date().toISOString() };
  try {
    await addSignature(entry);
  } catch {
    return Response.json({ error: 'the guest book couldn’t be saved right now.' }, { status: 503 });
  }
  return Response.json({ entry });
}
