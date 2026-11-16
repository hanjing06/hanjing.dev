import { COVER_HOST, latestTrack } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

/**
 * The current CD cover's image, fetched from Spotify's CDN and served from
 * this site (the CSP only allows our own images). It only ever serves the
 * latest track's cover, never an arbitrary URL. `?v=` just busts caches.
 */
export async function GET() {
  try {
    const track = await latestTrack();
    const url = track?.coverUrl ? new URL(track.coverUrl) : null;
    if (!url || url.protocol !== 'https:' || url.hostname !== COVER_HOST) return new Response(null, { status: 404 });
    const image = await fetch(url, { cache: 'no-store' });
    const type = image.headers.get('content-type') ?? '';
    if (!image.ok || !type.startsWith('image/')) return new Response(null, { status: 502 });
    return new Response(image.body, {
      headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=300, s-maxage=3600' },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
