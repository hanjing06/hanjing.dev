import { createHash } from 'node:crypto';
import { latestTrack, spotifyCredentials } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

/**
 * The song for the desk's CD: what's playing on Spotify now, or the last
 * one played. `{ song: null }` when Spotify isn't set up (the desk then uses
 * content/music.ts). The cover and the 30-second preview go through
 * /api/now-playing/cover and /preview, so the page never loads media from
 * another site.
 */
export async function GET() {
  try {
    const track = await latestTrack();
    // `reason` says why there's no song (never any secret), so a missing setup is easy to tell apart from a failing one
    if (!track) return Response.json({ song: null, reason: spotifyCredentials() && process.env.SPOTIFY_REFRESH_TOKEN ? 'nothing played yet' : 'spotify keys not set' });
    const version = track.coverUrl ? createHash('sha1').update(track.coverUrl).digest('hex').slice(0, 12) : '';
    return Response.json(
      {
        song: {
          title: track.title,
          artist: track.artist,
          cover: version ? `/api/now-playing/cover?v=${version}` : '',
          url: track.url,
          playing: track.playing,
          audio: track.previewUrl ? `/api/now-playing/preview?v=${createHash('sha1').update(track.previewUrl).digest('hex').slice(0, 12)}` : '',
        },
      },
      { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' } },
    );
  } catch (error) {
    // shows up in the host's function logs (e.g. "spotify token: 400" for a wrong or revoked key)
    console.error('[now-playing]', error);
    return Response.json({ song: null, reason: error instanceof Error ? error.message : 'spotify error' });
  }
}
