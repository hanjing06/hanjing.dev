import { basicAuth, requestOrigin, spotifyCredentials } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

const page = (body: string, status = 200) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><title>Spotify setup</title><body style="font:16px/1.5 system-ui;max-width:640px;margin:48px auto;padding:0 16px">${body}</body>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Set-Cookie': 'spotify_state=; Path=/api/spotify; Max-Age=0' } },
  );

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Second half of the one-time setup (see ../login/route.ts). Development only. */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const url = new URL(request.url);
  const origin = requestOrigin(request).origin;
  const creds = spotifyCredentials();
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expected = request.headers.get('cookie')?.match(/(?:^|;\s*)spotify_state=([a-f0-9]+)/)?.[1];
  if (!creds) return page('<p>SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET aren’t set.</p>', 500);
  if (url.searchParams.get('error')) return page(`<p>Spotify said: ${escape(url.searchParams.get('error')!)}</p>`, 400);
  if (!code || !state || state !== expected) return page('<p>That sign-in didn’t match. Start again at <a href="/api/spotify/login">/api/spotify/login</a>.</p>', 400);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: basicAuth(creds), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: `${origin}/api/spotify/callback` }),
    cache: 'no-store',
  });
  if (!response.ok) return page(`<p>Spotify refused the code (${response.status}). Check the redirect URI in your Spotify app matches <code>${escape(origin)}/api/spotify/callback</code>.</p>`, 502);
  const data = (await response.json()) as { refresh_token?: string };
  if (!data.refresh_token) return page('<p>Spotify didn’t send a refresh token. Try again.</p>', 502);

  return page(
    `<h1 style="font-size:22px">Connected to Spotify</h1>
     <p>Add this line to <code>.env.local</code> (and to your host’s environment variables), then restart the server:</p>
     <pre style="white-space:pre-wrap;word-break:break-all;background:#f3f3f3;padding:12px">SPOTIFY_REFRESH_TOKEN=${escape(data.refresh_token)}</pre>
     <p>Keep it private: it lets the site read what you’re listening to. This page isn’t saved anywhere.</p>`,
  );
}
