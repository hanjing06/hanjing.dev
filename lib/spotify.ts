/**
 * What Hanjing is listening to on Spotify, for the CD on the desk: the
 * current track, or the last one played. Server-only (it holds secrets).
 *
 * Needs three env vars (see README → "Spotify"):
 *   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
 * Without them, `latestTrack()` returns null and the desk uses content/music.ts.
 */

export type Track = {
  title: string;
  artist: string;
  /** Album art on Spotify's CDN (served to visitors through /api/now-playing/cover). */
  coverUrl: string | null;
  /** The track on open.spotify.com. */
  url: string | null;
  /** True while it's playing right now; false for the last played. */
  playing: boolean;
};

export const SPOTIFY_SCOPES = 'user-read-currently-playing user-read-recently-played';

/** Spotify only serves album art from here; the cover proxy accepts nothing else. */
export const COVER_HOST = 'i.scdn.co';

/** Seconds to reuse an answer before asking Spotify again. */
const FRESH_FOR = 60;

export function spotifyCredentials() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  return id && secret ? { id, secret } : null;
}

/**
 * The origin the browser actually used. In development Next.js reports
 * request.url as localhost even when the page was opened on 127.0.0.1, so
 * this reads the Host header instead.
 */
export function requestOrigin(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get('host') ?? url.host;
  const proto = request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');
  return new URL(`${proto}://${host}`);
}

export function basicAuth({ id, secret }: { id: string; secret: string }) {
  return `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`;
}

let token: { value: string; expires: number } | null = null;
let cached: { track: Track | null; at: number } | null = null;

async function accessToken(): Promise<string | null> {
  const creds = spotifyCredentials();
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!creds || !refresh) return null;
  if (token && token.expires > Date.now() + 30_000) return token.value;
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: basicAuth(creds), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`spotify token: ${response.status}`);
  const data = (await response.json()) as { access_token: string; expires_in: number };
  token = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return token.value;
}

type SpotifyTrack = {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string; width: number }[] };
  external_urls?: { spotify?: string };
};

function toTrack(item: SpotifyTrack, playing: boolean): Track {
  // the smallest image that's still at least 300px wide is plenty for the CD
  const images = [...(item.album?.images ?? [])].sort((a, b) => a.width - b.width);
  const image = images.find((i) => i.width >= 300) ?? images.at(-1);
  return {
    title: item.name,
    artist: item.artists.map((a) => a.name).join(', '),
    coverUrl: image?.url ?? null,
    url: item.external_urls?.spotify ?? null,
    playing,
  };
}

/** The track playing now, else the last one played; null when Spotify isn't set up. */
export async function latestTrack(): Promise<Track | null> {
  if (cached && Date.now() - cached.at < FRESH_FOR * 1000) return cached.track;
  const access = await accessToken();
  if (!access) return null;
  const headers = { Authorization: `Bearer ${access}` };

  let track: Track | null = null;
  const now = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers, cache: 'no-store' });
  if (now.status === 200) {
    const data = (await now.json()) as { is_playing: boolean; currently_playing_type: string; item: SpotifyTrack | null };
    // podcasts and ads have no album art or artist; fall through to the last song
    if (data.item && data.currently_playing_type === 'track') track = toTrack(data.item, data.is_playing);
  } else if (now.status !== 204) {
    throw new Error(`spotify now playing: ${now.status}`);
  }
  if (!track) {
    const recent = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { headers, cache: 'no-store' });
    if (!recent.ok) throw new Error(`spotify recently played: ${recent.status}`);
    const data = (await recent.json()) as { items: { track: SpotifyTrack }[] };
    if (data.items[0]) track = toTrack(data.items[0].track, false);
  }
  cached = { track, at: Date.now() };
  return track;
}
