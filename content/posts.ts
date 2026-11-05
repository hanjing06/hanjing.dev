import { pageMetadata } from '@/lib/metadata';

export type Post = {
  /** Folder name under `app/blog/` and `public/blog/`. */
  slug: string;
  /** Bold first line of the card on /blog. */
  listTitle: string;
  /** Second line of the card on /blog. */
  listSubtitle: string;
  /** Date line of the card on /blog. */
  dateLabel: string;
  /** Browser title + search description for the post page. */
  seo: {
    title: string;
    description: string;
  };
};

/**
 * Every blog post, newest first. Adding an entry here lists it on /blog and
 * gives the post page its metadata (via `postMetadata`).
 * The blog is currently hidden from search engines (`noIndex`).
 */
export const posts: Post[] = [
  {
    slug: 'introduction',
    listTitle: 'start here.',
    listSubtitle: 'an introduction',
    dateLabel: 'july 17, 2026',
    seo: {
      title: 'An Introduction',
      description: 'An introduction to Hanjing Lin and the writing behind this blog.',
    },
  },
];

export const postHref = (slug: string) => `/blog/${slug}`;

export function getPost(slug: string): Post {
  const post = posts.find((entry) => entry.slug === slug);
  if (!post) {
    throw new Error(`Unknown post slug "${slug}". Add it to content/posts.ts.`);
  }
  return post;
}

/** Metadata for `app/blog/<slug>/page.tsx`. */
export function postMetadata(slug: string) {
  const { seo } = getPost(slug);
  return pageMetadata({ ...seo, path: postHref(slug), noIndex: true });
}
