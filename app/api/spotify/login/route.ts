import { randomBytes } from 'node:crypto';
import { requestOrigin, SPOTIFY_SCOPES, spotifyCredentials } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

/**
 * One-time setup, development only: open http://127.0.0.1:3000/api/spotify/login,
 * sign in to Spotify, and /api/spotify/callback shows the refresh token to put
 * in SPOTIFY_REFRESH_TOKEN. Spotify only accepts loopback redirect URIs as
 * 127.0.0.1 (not localhost), so localhost is sent there first.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const origin = requestOrigin(request);
  if (origin.hostname === 'localhost') {
    origin.hostname = '127.0.0.1';
    return Response.redirect(new URL('/api/spotify/login', origin), 307);
  }
  const creds = spotifyCredentials();
  if (!creds) {
    return new Response('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local first, then restart the dev server.', { status: 500 });
  }
  const state = randomBytes(16).toString('hex');
  const authorize = new URL('https://accounts.spotify.com/authorize');
  authorize.search = new URLSearchParams({
    response_type: 'code',
    client_id: creds.id,
    scope: SPOTIFY_SCOPES,
    redirect_uri: `${origin.origin}/api/spotify/callback`,
    state,
    // always show the consent screen, with "Not you?" to switch accounts:
    // only the app's owner (or users added to it) can sign in to a dev-mode app
    show_dialog: 'true',
  }).toString();
  return new Response(null, {
    status: 307,
    headers: { Location: authorize.toString(), 'Set-Cookie': `spotify_state=${state}; Path=/api/spotify; HttpOnly; SameSite=Lax; Max-Age=600` },
  });
}
