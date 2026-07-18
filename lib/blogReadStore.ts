import { promises as fs } from 'node:fs';
import path from 'node:path';

const storePath = path.join(process.cwd(), 'data', 'blog-reads.json');

type BlogReadStore = Record<string, number>;

async function ensureStore() {
  try {
    await fs.access(storePath);
  } catch {
    await fs.mkdir(path.dirname(storePath), { recursive: true });
    await fs.writeFile(storePath, '{}', 'utf8');
  }
}

async function readStore(): Promise<BlogReadStore> {
  await ensureStore();

  try {
    const raw = await fs.readFile(storePath, 'utf8');
    return JSON.parse(raw) as BlogReadStore;
  } catch {
    return {};
  }
}

async function writeStore(store: BlogReadStore) {
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), 'utf8');
}

export async function getReadCount(slug: string) {
  const store = await readStore();
  return store[slug] ?? 0;
}

export async function incrementReadCount(slug: string) {
  const store = await readStore();
  const nextCount = (store[slug] ?? 0) + 1;
  store[slug] = nextCount;
  await writeStore(store);
  return nextCount;
}
