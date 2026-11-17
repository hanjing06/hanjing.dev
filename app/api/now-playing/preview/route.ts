import { latestTrack, PREVIEW_HOST_SUFFIX } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

/**
 * The current CD song's 30-second preview, fetched from Apple and served
 * from this site (the CSP only allows our own media). It only ever serves
 * the latest track's preview, never an arbitrary URL. Range requests pass
 * through, since Safari won't play audio without them. `?v=` busts caches.
 */
export async function GET(request: Request) {
  try {
    const track = await latestTrack();
    const url = track?.previewUrl ? new URL(track.previewUrl) : null;
    if (!url || url.protocol !== 'https:' || !url.hostname.endsWith(PREVIEW_HOST_SUFFIX)) return new Response(null, { status: 404 });
    const range = request.headers.get('range');
    const upstream = await fetch(url, { cache: 'no-store', headers: range ? { Range: range } : {} });
    const type = upstream.headers.get('content-type') ?? '';
    if (!upstream.ok || !type.startsWith('audio/')) return new Response(null, { status: 502 });
    const headers = new Headers({ 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=300, s-maxage=3600' });
    for (const name of ['content-length', 'content-range']) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return new Response(null, { status: 502 });
  }
}
