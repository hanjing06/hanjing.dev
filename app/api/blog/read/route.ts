import {
  getBlogReadEventName,
  isBlogReadSlug,
} from '@/lib/blogReadConfig';
import { getReadCount, incrementReadCount } from '@/lib/blogReadStore';

export const runtime = 'nodejs';

const vercelToken = process.env.VERCEL_TOKEN;
const vercelProjectId = process.env.VERCEL_PROJECT_ID;
const vercelTeamId = process.env.VERCEL_TEAM_ID;

function hasVercelAnalyticsConfig() {
  return Boolean(vercelToken && vercelProjectId);
}

function badRequest(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

async function getVercelAnalyticsReadCount(slug: string) {
  if (!isBlogReadSlug(slug)) {
    return 0;
  }

  const eventName = getBlogReadEventName(slug);
  const url = new URL('https://api.vercel.com/v1/query/web-analytics/events/count');
  url.searchParams.set('projectId', vercelProjectId!);
  url.searchParams.set('filter', `eventName eq '${eventName}'`);

  if (vercelTeamId) {
    url.searchParams.set('teamId', vercelTeamId);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${vercelToken!}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Vercel analytics request failed with ${response.status}`);
  }

  const data = (await response.json()) as { count?: number };
  return data.count ?? 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return badRequest('Missing slug parameter.');
  }

  if (hasVercelAnalyticsConfig()) {
    const count = await getVercelAnalyticsReadCount(slug);
    return Response.json({ slug, count, source: 'vercel-analytics' });
  }

  const count = await getReadCount(slug);
  return Response.json({ slug, count, source: 'local-store' });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { slug?: string }
    | null;

  const slug = body?.slug;

  if (!slug) {
    return badRequest('Missing slug in request body.');
  }

  if (hasVercelAnalyticsConfig()) {
    const count = (await getVercelAnalyticsReadCount(slug)) + 1;
    return Response.json({
      slug,
      count,
      source: 'vercel-analytics-estimate',
    });
  }

  const count = await incrementReadCount(slug);
  return Response.json({ slug, count, source: 'local-store' });
}
