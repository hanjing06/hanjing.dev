export const BLOG_READ_SLUGS = ['introduction'] as const;

export type BlogReadSlug = (typeof BLOG_READ_SLUGS)[number];

export function isBlogReadSlug(value: string): value is BlogReadSlug {
  return BLOG_READ_SLUGS.includes(value as BlogReadSlug);
}

export function getBlogReadEventName(slug: BlogReadSlug) {
  return `blog_read_${slug}`;
}
