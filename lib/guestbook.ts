import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * The journal's guest book: short text messages that visitors leave, shared
 * with everyone. (Older entries may carry a `drawing`; it's no longer shown.)
 *
 * Storage, picked automatically:
 * - Redis over REST (Upstash, or Vercel's Redis/KV integration) when
 *   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_URL +
 *   KV_REST_API_TOKEN) are set. Use this in production.
 * - Otherwise a JSON file at .data/guestbook.json, for local development and
 *   self-hosting. Serverless hosts can't write files, so set up Redis there.
 */

type Signature = {
  id: string;
  name: string;
  message: string;
  /** ISO timestamp. */
  at: string;
};

export const LIMITS = { name: 40, message: 160, kept: 500, shown: 200 } as const;

const KEY = 'guestbook';
const FILE = path.join(process.cwd(), '.data', 'guestbook.json');

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

async function command(args: (string | number)[]) {
  const db = redis()!;
  const response = await fetch(db.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${db.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`guest book storage: ${response.status}`);
  return (await response.json()).result;
}

async function readFile(): Promise<Signature[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    return [];
  }
}

/** Newest first. */
export async function listSignatures(): Promise<Signature[]> {
  if (redis()) {
    const rows: string[] = await command(['LRANGE', KEY, 0, LIMITS.shown - 1]);
    return rows.map((row) => JSON.parse(row));
  }
  return (await readFile()).slice(0, LIMITS.shown);
}

export async function addSignature(signature: Signature) {
  if (redis()) {
    await command(['LPUSH', KEY, JSON.stringify(signature)]);
    await command(['LTRIM', KEY, 0, LIMITS.kept - 1]);
    return;
  }
  const all = [signature, ...(await readFile())].slice(0, LIMITS.kept);
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
}

/**
 * Delete stored signatures that `drop` rejects (for entries that break the
 * guest book's rules, e.g. ones signed before a word was banned). Returns how
 * many went.
 */
export async function removeSignatures(drop: (signature: Signature) => boolean) {
  if (redis()) {
    const rows: string[] = await command(['LRANGE', KEY, 0, -1]);
    const bad = rows.filter((row) => {
      try {
        return drop(JSON.parse(row));
      } catch {
        return false;
      }
    });
    for (const row of bad) await command(['LREM', KEY, 0, row]);
    return bad.length;
  }
  const all = await readFile();
  const kept = all.filter((signature) => !drop(signature));
  if (kept.length !== all.length) await fs.writeFile(FILE, JSON.stringify(kept, null, 2));
  return all.length - kept.length;
}
