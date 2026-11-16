import { createHash } from 'node:crypto';
import { latestTrack } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

/**
 * The song for the desk's CD: what's playing on Spotify now, or the last
 * one played. `{ song: null }` when Spotify isn't set up (the desk then uses
 * content/music.ts). The cover goes through /api/now-playing/cover so the
 * page never loads images from another site.
 */
export async function GET() {
  try {
    const track = await latestTrack();
    if (!track) return Response.json({ song: null });
    const version = track.coverUrl ? createHash('sha1').update(track.coverUrl).digest('hex').slice(0, 12) : '';
    return Response.json(
      {
        song: {
          title: track.title,
          artist: track.artist,
          cover: version ? `/api/now-playing/cover?v=${version}` : '',
          url: track.url,
          playing: track.playing,
        },
      },
      { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' } },
    );
  } catch {
    return Response.json({ song: null });
  }
}
